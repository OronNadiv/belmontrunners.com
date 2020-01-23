import { Map as IMap } from 'immutable'
import React, { useEffect, useState } from 'react'
import * as PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import SignUpStepperButton from './SignUpStepperButton'
import LoggedInState from '../../components/HOC/LoggedInState'
import { connect } from 'react-redux'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  GENDER,
  PHONE,
  STATE,
  ZIP
} from '../../fields'
import { compose, pick } from 'underscore'
import UserDetails from '../../components/UserDetails'
import UpdateUserData from '../../components/HOC/UpdateUserData'
import { goToTop } from 'react-scrollable-anchor'
import { IRedisState, IUser, IUserOptionalProps } from '../../entities/User'
import { IUpdateUserData } from '../../reducers/currentUser'

interface Props {
  onNextClicked: () => void
  userData: any
  isLast: boolean
  isCurrentUserLoaded: boolean
  updateUserData: IUpdateUserData
}

const SignUpStepUserProfile = ({
                                 onNextClicked,
                                 userData,
                                 isLast,
                                 isCurrentUserLoaded,
                                 updateUserData
                               }: Props) => {
  const userDataJS: IUser = userData.toJS()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitFunc = async (values: IUserOptionalProps) => {
    console.log('submitting values:', JSON.stringify(values, null, 2))

    setIsSubmitting(true)
    try {
      await updateUserData(values, { merge: true })
      onNextClicked()
    } catch (error) {
      setIsSubmitting(false)
      // todo: show error since update failed.
    }
  }

  useEffect(() => {
    goToTop()
  })

  const initialValues = pick(
    userDataJS,
    ADDRESS1,
    ADDRESS2,
    CITY,
    DATE_OF_BIRTH,
    GENDER,
    PHONE,
    STATE,
    ZIP
  )
  return !isCurrentUserLoaded ? (
    ''
  ) : (
    <Form
      onSubmit={values => handleSubmitFunc(values)}
      initialValues={initialValues}
      // @ts-ignore
      render={({ handleSubmit, form, values }) => (
        <form onSubmit={handleSubmit} method="POST">
          {/*
  // @ts-ignore */}
          <UserDetails values={values} />

          <SignUpStepperButton
            handlePrimaryClicked={() => form.submit()}
            primaryText={isLast ? 'Save' : 'Next'}
            primaryDisabled={isSubmitting}
            showPrimary
          />
        </form>
      )}
    />
  )
}

SignUpStepUserProfile.propTypes = {
  updateUserData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  isCurrentUserLoaded: PropTypes.bool.isRequired,

  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, userData } }: IRedisState) => {
  return {
    isCurrentUserLoaded,
    // @ts-ignore
    userData: userData || new IMap()
  }
}

export default compose(
  UpdateUserData,
  LoggedInState(),
  connect(mapStateToProps)
)(SignUpStepUserProfile)
