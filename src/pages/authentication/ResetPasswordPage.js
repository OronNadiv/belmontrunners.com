import 'firebase/auth'
import firebase from 'firebase/app'
import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
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
import * as PropTypes from 'prop-types'
import { INVALID_PASSWORD_LENGTH, RESET_PASSWORD_SUCCESS } from '../../messages'
import * as Sentry from '@sentry/browser'
import { PASSWORD } from '../../fields'
import { Field, Form } from 'react-final-form'
import { goToTop } from 'react-scrollable-anchor'

const WEAK_PASSWORD = 'Password is too weak.'

const required = value => (value ? undefined : 'Required')
const composeValidators = (...validators) => value =>
  validators.reduce((error, validator) => error || validator(value), undefined)
const minPasswordLength = value => {
  const res = value.length < 6 ? INVALID_PASSWORD_LENGTH(6) : undefined
  console.log('res', value, res)
  return res
}

function ResetPasswordPage({ history, location }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    goToTop()
  }, [])

  useEffect(() => {
    errorMessage && goToTop()
  }, [errorMessage])

  const handleError = error => {
    const { code, message } = error
    if (code === 'auth/weak-password') {
      setErrorMessage(WEAK_PASSWORD)
    } else {
      Sentry.captureException(error)
      console.error('ResetPasswordPage', 'code:', code, 'message:', message)
      setErrorMessage(message)
    }
  }

  const handleSubmit = async values => {
    const newPassword = values[PASSWORD]

    const oobCode = location.state.query.oobCode

    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await firebase.auth().confirmPasswordReset(oobCode, newPassword)
      setIsSuccess(true)
    } catch (error) {
      handleError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    history.push(ROOT)
  }

  return (
    <Form
      onSubmit={values => handleSubmit(values)}
      render={({ handleSubmit, form }) => (
        <form onSubmit={handleSubmit} method="POST">
          <Dialog
            open
            fullWidth
            maxWidth="xs"
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle>Reset Password</DialogTitle>

            <DialogContent>
              {errorMessage && (
                <DialogContentText>
                  <div className="text-danger text-center">{errorMessage}</div>
                </DialogContentText>
              )}
              {isSuccess ? (
                <DialogContentText>
                  <div className="text-success text-center">
                    {RESET_PASSWORD_SUCCESS}
                  </div>
                </DialogContentText>
              ) : (
                <Field
                  label="New password"
                  type="password"
                  margin="normal"
                  fullWidth
                  name={PASSWORD}
                  component={TextField}
                  validate={composeValidators(required, minPasswordLength)}
                />
              )}
            </DialogContent>
            {isSuccess ? (
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Close
                </Button>
              </DialogActions>
            ) : (
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                  type="button"
                  color="primary"
                  onClick={() => form.submit()}
                  disabled={isSubmitting}
                >
                  Set new password
                </Button>
              </DialogActions>
            )}
          </Dialog>
        </form>
      )}
    />
  )
}

ResetPasswordPage.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      info: PropTypes.shape({
        data: PropTypes.shape({
          email: PropTypes.string.isRequired
        }).isRequired
      }).isRequired,
      query: PropTypes.shape({
        oobCode: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }).isRequired
}

export default withRouter(ResetPasswordPage)
