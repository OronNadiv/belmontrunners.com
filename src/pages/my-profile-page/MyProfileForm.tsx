import { Map as IMap } from 'immutable'
import React from 'react'
import * as PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import { connect } from 'react-redux'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DISPLAY_NAME,
  GENDER,
  PHONE,
  STATE,
  ZIP
} from '../../fields'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import { compose, pick } from 'underscore'
import UserDetails from '../../components/UserDetails'
import { ROOT } from '../../urls'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import UpdateUserData from '../../components/HOC/UpdateUserData'
import { IRedisState, IUserOptionalProps, IUser } from '../../entities/User'
import { User, updateProfile } from 'firebase/auth';

interface Props {
  updateUserData: any,
  firebaseUser: User,
  userData: any,
  isSubmitting: boolean,
  onSubmitting: (arg0: boolean) => void
}

function MyProfileForm({
                         updateUserData,
                         firebaseUser,
                         userData,
                         isSubmitting,
                         onSubmitting
                       }: Props) {
  const navigate = useNavigate()
  const userDataJS: IUser = userData.toJS()

  const handleSubmitFunc = async (values: IUserOptionalProps) => {
    console.log('submitting values:', JSON.stringify(values, null, 2))
    try {
      onSubmitting(true)
      await Promise.all([
        updateProfile(firebaseUser, { [DISPLAY_NAME]: values.displayName }),
        updateUserData(values, { merge: true })
      ])

      onSubmitting(false)
      navigate(ROOT)
    } catch (error) {
      onSubmitting(false)
      console.error(error)
      console.error('error response:', error)
      // todo: show an error message
    }
  }

  const handleClose = () => {
    navigate(ROOT)
  }

  const initialValues = pick(
    userDataJS,
    ADDRESS1,
    ADDRESS2,
    CITY,
    DISPLAY_NAME,
    GENDER,
    PHONE,
    STATE,
    ZIP
  )

  // @ts-ignore
  return (
    firebaseUser && (
      <>
        <Form
          onSubmit={values => handleSubmitFunc(values)}
          initialValues={initialValues}
          render={
            // @ts-ignore */
            ({ handleSubmit, form, values }) => (
              <form onSubmit={handleSubmit} method="POST">
                {/*
  // @ts-ignore */}
                <UserDetails values={values} showDisplayName />
                <div className="d-flex justify-content-between my-5">
                  <Button
                    className="mr-4"
                    variant="contained"
                    color="inherit"
                    fullWidth
                    type="button"
                    onClick={() => handleClose()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    type="button"
                    onClick={() => form.submit()}
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                </div>
              </form>
            )}
        />
      </>
    )
  )
}

MyProfileForm.propTypes = {
  firebaseUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,

// from HOC
  updateUserData: PropTypes.func.isRequired,

  onSubmitting: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

const mapDispatchToProps = {
  sendEmailVerification: sendEmailVerificationAction
}

const mapStateToProps = ({ currentUser: { firebaseUser, userData } }: IRedisState) => {
  return {
    firebaseUser,
    userData: userData ||
      // @ts-ignore
      new IMap()
  }
}

export default compose(
  UpdateUserData,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(MyProfileForm)
