import 'firebase/auth'
import firebase from 'firebase/app'
import React, { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@material-ui/core'
import { TextField } from 'final-form-material-ui'
import isEmailComponent from 'isemail'
import {
  EMAIL_ALREADY_IN_USE,
  EMAILS_DONT_MATCH,
  INVALID_EMAIL,
  INVALID_PASSWORD_LENGTH,
  WRONG_PASSWORD
} from '../../messages'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser'
import { Field, Form } from 'react-final-form'
import { PASSWORD } from '../../fields'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'

const required = value => (value ? undefined : 'Required')
const isEmail = value =>
  !value || !isEmailComponent.validate(value) ? INVALID_EMAIL : undefined
const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined)
const minPasswordLength = value =>
  value.length < 6 ? INVALID_PASSWORD_LENGTH(6) : undefined

const EMAIL1 = 'email1'
const EMAIL2 = 'email2'

function ChangeEmailDialog({ currentUser, sendEmailVerification, onClose }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async values => {
    const email1 = values[EMAIL1]
    const email2 = values[EMAIL2]
    const password = values[PASSWORD]

    if (email1 !== email2) {
      return { [EMAIL2]: EMAILS_DONT_MATCH }
    }

    setErrorMessage('')
    setIsSubmitting(true)

    const credentials = firebase.auth.EmailAuthProvider.credential(
      currentUser.email,
      password
    )
    try {
      await currentUser.reauthenticateWithCredential(credentials)
      try {
        await currentUser.updateEmail(email1)
        // todo: use same mechanism as in UpdateUserData
        await sendEmailVerification()

        setIsSuccess(true)
      } catch (error) {
        Sentry.captureException(error)
        console.error(error)

        const { code, message } = error
        switch (code) {
          case 'auth/invalid-email':
            setErrorMessage(INVALID_EMAIL)
            return
          case 'auth/email-already-in-use':
            setErrorMessage(EMAIL_ALREADY_IN_USE)
            return
          default:
            Sentry.captureException(error)
            console.error('ChangeEmail.', 'code:', code, 'message:', message)
            setErrorMessage(message)
        }
      }
    } catch (error) {
      const { code, message } = error
      if (code === 'auth/wrong-password') {
        setErrorMessage(WRONG_PASSWORD)
      } else {
        Sentry.captureException(error)
        setErrorMessage(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  console.log('ChangeEmail render called')

  return (
    <Form
      onSubmit={handleSubmit}
      render={({ handleSubmit, form }) => (
        <form onSubmit={handleSubmit} method="POST">
          <Dialog
            open
            fullWidth
            maxWidth="xs"
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle>Change Email</DialogTitle>

            <DialogContent>
              Current email address:{' '}
              <span className="font-weight-bold">{currentUser.email}</span>
              {errorMessage && (
                <div className="mt-2 text-danger text-center">
                  {errorMessage}
                </div>
              )}
              {isSuccess ? (
                <div className="text-success text-center mt-4">
                  Email changed successfully.
                </div>
              ) : (
                <div>
                  <Field
                    label="New email"
                    margin="normal"
                    type="email"
                    fullWidth
                    name={EMAIL1}
                    component={TextField}
                    validate={composeValidators(required, isEmail)}
                  />
                  <Field
                    label="Confirm email"
                    margin="normal"
                    type="email"
                    fullWidth
                    name={EMAIL2}
                    component={TextField}
                    validate={composeValidators(required, isEmail)}
                  />

                  <Field
                    label="Enter password"
                    type="password"
                    margin="normal"
                    fullWidth
                    name={PASSWORD}
                    component={TextField}
                    validate={composeValidators(required, minPasswordLength)}
                  />
                </div>
              )}
            </DialogContent>

            <DialogActions>
              {isSuccess ? (
                <Button type="button" color="primary" onClick={handleClose}>
                  Close
                </Button>
              ) : (
                <div>
                  <Button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    color="primary"
                    disabled={isSubmitting}
                    onClick={() => form.submit()}
                  >
                    Submit
                  </Button>
                </div>
              )}
            </DialogActions>
          </Dialog>
        </form>
      )}
    />
  )
}

ChangeEmailDialog.propTypes = {
  currentUser: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  sendEmailVerification: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  sendEmailVerification: sendEmailVerificationAction
}

const mapStateToProps = ({ currentUser: { currentUser } }) => {
  return {
    currentUser
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChangeEmailDialog)
