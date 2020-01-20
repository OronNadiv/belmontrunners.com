import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { INVALID_EMAIL, USER_NOT_FOUND_EXPLICIT } from '../../messages'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core'
import { TextField } from 'final-form-material-ui'
import { ROOT } from '../../urls'
import LoggedInState from '../../components/HOC/LoggedInState'
import { Field, Form } from 'react-final-form'
import { EMAIL } from '../../fields'
import * as Sentry from '@sentry/browser'
import { auth } from '../../firebase'
import { required, isEmail, composeValidators } from '../../utilities/formValidators'

const ForgotPasswordPage = () => {
  const [close, setClose] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleError = (error: firebase.auth.Error) => {
    const { code, message } = error
    switch (code) {
      case 'auth/user-not-found':
        setErrorMessage(USER_NOT_FOUND_EXPLICIT)
        break
      case 'auth/invalid-email':
        setErrorMessage(INVALID_EMAIL)
        break
      default:
        Sentry.captureException(error)
        console.error('forgotPasswordPage', 'code:', code, 'message:', message)
        setErrorMessage(message)
    }
  }

  const handleSubmit = async (values: { [EMAIL]: string }) => {
    const email = values[EMAIL]

    setErrorMessage('')
    setIsSubmitting(true)
    try {
      await auth.sendPasswordResetEmail(email)
      setIsSuccess(true)
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (close) {
    console.log('redirecting to root', close)
    return <Redirect to={ROOT} />
  }

  return (
    <Form
      onSubmit={(values: { [EMAIL]: string }) => handleSubmit(values)}
      // @ts-ignore
      render={({ handleSubmit, form }) => (
        <form onSubmit={handleSubmit} method="POST">
          <Dialog
            open
            fullWidth
            maxWidth="xs"
            onClose={() => setClose(true)}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle>Forgot Password</DialogTitle>

            <DialogContent>
              {errorMessage && (
                <div className="mt-2 text-danger text-center">
                  {errorMessage}
                </div>
              )}
              {isSuccess ? (
                <DialogContentText>
                  <div className="text-success text-center">
                    We have sent you an e-mail. Please contact us if you do
                    not receive it within a few minutes.
                  </div>
                </DialogContentText>
              ) : (
                <Field
                  label="Your email"
                  margin="normal"
                  type="email"
                  fullWidth
                  name={EMAIL}
                  component={TextField}
                  validate={composeValidators(required, isEmail)}
                />
              )}
            </DialogContent>
            {isSuccess ? (
              <DialogActions>
                <Button
                  onClick={() => setClose(true)}
                  color="primary"
                >
                  Close
                </Button>
              </DialogActions>
            ) : (
              <DialogActions>
                <Button
                  onClick={() => setClose(true)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  color="primary"
                  onClick={() => form.submit()}
                  disabled={isSubmitting}
                >
                  Send password reset email
                </Button>
              </DialogActions>
            )}
          </Dialog>
        </form>
      )}
    />
  )
}

export default LoggedInState({ isRequiredToBeLoggedIn: false })(
  ForgotPasswordPage
)
