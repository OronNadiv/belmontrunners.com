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
import {
  EMAIL_ALREADY_IN_USE,
  EMAILS_DONT_MATCH,
  INVALID_EMAIL,
  WRONG_PASSWORD
} from '../../messages'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser'
import { Field, Form } from 'react-final-form'
import { PASSWORD } from '../../fields'
import { SendEmailVerification, sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import { required, isEmail, composeValidators, minPasswordLength } from '../../utilities/formValidators'
import { CurrentUserStore } from '../../entities/User'

const EMAIL1 = 'email1'
const EMAIL2 = 'email2'

interface Props {
  currentUser: firebase.User
  sendEmailVerification: SendEmailVerification
  onClose: () => void
}

function ChangeEmailDialog({ currentUser, sendEmailVerification, onClose }: Props) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (values: {
    [EMAIL1]: string,
    [EMAIL2]: string,
    [PASSWORD]: string
  }) => {
    const email1 = values[EMAIL1]
    const email2 = values[EMAIL2]
    const password = values[PASSWORD]

    if (email1 !== email2) {
      return { [EMAIL2]: EMAILS_DONT_MATCH }
    }

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const credentials = firebase.auth.EmailAuthProvider.credential(
        // @ts-ignore At this point, we only support login with email.
        currentUser.email,
        password
      )
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
      // @ts-ignore
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

const mapStateToProps = ({ currentUser: { currentUser } }: CurrentUserStore) => {
  return {
    currentUser
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
// @ts-ignore
)(ChangeEmailDialog)
