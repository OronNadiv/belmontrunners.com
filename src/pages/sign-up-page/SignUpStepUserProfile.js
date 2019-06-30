import React, { Component } from 'react'
import * as PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import SignUpStepperButton from './SignUpStepperButton'
import LoggedInState from '../../components/LoggedInState'
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
import { updateUserData as updateUserDataAction } from '../../reducers/currentUser'
import { DatePicker, MuiPickersUtilsProvider } from "material-ui-pickers"
import MomentUtils from '@date-io/moment'
import _ from 'underscore'
import UserDetails from '../../components/UserDetails'

class SignUpStepUserProfile extends Component {
  handleSubmit (values) {
    this.submitting = true
    const { updateUserData } = this.props
    console.log('submitting values:', JSON.stringify(values, 0, 2))
    return updateUserData(values, { merge: true })
  }

  componentDidMount () {
    window.scrollTo(0, 0)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.userDataUpdating && !this.props.userDataUpdating && this.submitting) {
      this.submitting = false
      if (!this.props.userDataUpdateError) {
        const { onNextClicked } = this.props
        onNextClicked()
      } else {
        // todo: show error since update failed.
      }
    }
  }

  render () {
    const { isLast, isCurrentUserLoaded, userDataUpdating } = this.props
    const userData = this.props.userData.toJS()

    const initialValues = _.pick(userData, ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, STATE, ZIP)
    return !isCurrentUserLoaded ?
      '' :
      <Form
        onSubmit={(values) => this.handleSubmit(values)}
        initialValues={initialValues}
        render={({ handleSubmit, form, values }) => (
          <form onSubmit={handleSubmit}>

            <UserDetails values={values} />

            <SignUpStepperButton
              handlePrimaryClicked={() => form.submit()}
              primaryText={isLast ? 'Save' : 'Next'}
              primaryDisabled={!!userDataUpdating}
              showPrimary
            />
          </form>
        )}
      />
  }
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
  userDataUpdating: PropTypes.bool.isRequired,
  userDataUpdateError: PropTypes.object,
  isCurrentUserLoaded: PropTypes.bool.isRequired,

  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  updateUserData: updateUserDataAction
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, userData, userDataUpdating, userDataUpdateError } }) => {
  return {
    isCurrentUserLoaded,
    userData,
    userDataUpdating,
    userDataUpdateError
  }
}

export default LoggedInState({
  name: 'SignUpStepUserProfile',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps, mapDispatchToProps)(SignUpStepUserProfile))
