import { Map as IMap } from 'immutable'
import React, { useEffect, useState } from 'react'
import * as PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import SignUpStepperButton from './SignUpStepperButton'
import LoggedInState from '../../components/HOC/LoggedInState'
import { connect } from 'react-redux'
import { ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, STATE, ZIP } from '../../fields'
import { DatePicker, MuiPickersUtilsProvider } from "material-ui-pickers"
import MomentUtils from '@date-io/moment'
import { compose, pick } from 'underscore'
import UserDetails from '../../components/UserDetails'
import UpdateUserData from '../../components/HOC/UpdateUserData'
import { goToTop } from 'react-scrollable-anchor'

const SignUpStepUserProfile = ({ onNextClicked, userData, isLast, isCurrentUserLoaded, updateUserData }) => {
  userData = userData.toJS()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values) => {
    console.log('submitting values:', JSON.stringify(values, 0, 2))

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

  const initialValues = pick(userData, ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, STATE, ZIP)
  return !isCurrentUserLoaded ?
    '' :
    <Form
      onSubmit={(values) => handleSubmit(values)}
      initialValues={initialValues}
      render={({ handleSubmit, form, values }) => (
        <form onSubmit={handleSubmit} method='POST'>

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
}

function DatePickerWrapper (props) {
  const {
    input: { name, onChange, value, ...restInput },
    meta,
    ...rest
  } = props
  const showError =
    ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) &&
    meta.touched

  return (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <DatePicker
        {...rest}
        name={name}
        format={'LL'}
        helperText={showError ? meta.error || meta.submitError : undefined}
        error={showError}
        inputProps={restInput}
        onChange={onChange}
        value={value === '' ? null : value}
      />
    </MuiPickersUtilsProvider>
  )
}

DatePickerWrapper.propTypes = {
  input: PropTypes.object,
  meta: PropTypes.object
}

SignUpStepUserProfile.propTypes = {
  updateUserData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  isCurrentUserLoaded: PropTypes.bool.isRequired,

  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, userData } }) => {
  return {
    isCurrentUserLoaded,
    userData: userData || new IMap()
  }
}

export default compose(
  UpdateUserData,
  LoggedInState(),
  connect(mapStateToProps)
)(SignUpStepUserProfile)
