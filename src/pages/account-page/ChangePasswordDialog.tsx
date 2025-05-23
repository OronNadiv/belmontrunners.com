import { User, reauthenticateWithCredential, AuthError, updatePassword, EmailAuthProvider } from 'firebase/auth'
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
  PASSWORDS_MISMATCH,
  WRONG_PASSWORD
} from '../../messages'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser'
import { PASSWORD } from '../../fields'
import { Field, Form } from 'react-final-form'
import { IRedisState } from '../../entities/User'
import { required, minPasswordLength, composeValidators } from '../../utilities/formValidators'

const PASSWORD1 = 'password1'
const PASSWORD2 = 'password2'

interface Props {
  onClose: () => void
  firebaseUser: User
}

function ChangePasswordDialog({ onClose, firebaseUser }: Props) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmitFunc = async (values: { [key: string]: any }) => {
    if (!firebaseUser.email) {
      console.error('current user does not have an email.')
      return
    }
    const password0 = values[PASSWORD]
    const password1 = values[PASSWORD1]
    const password2 = values[PASSWORD2]

    if (password1 !== password2) {
      return { [PASSWORD2]: PASSWORDS_MISMATCH }
    }

    setErrorMessage('')
    setIsSubmitting(true)

    const credentials = EmailAuthProvider.credential(
      firebaseUser.email,
      password0
    )
    try {
      await reauthenticateWithCredential(firebaseUser, credentials)
      try {
        await updatePassword(firebaseUser, password1)
        setIsSuccess(true)
      } catch (error) {
        const { code, message } = error as AuthError
        Sentry.captureException(error)
        console.error(
          'currentUser.updatePassword.',
          'code:',
          code,
          'message:',
          message
        )
        setErrorMessage(message)
      }
    } catch (error) {
      const { code, message } = error as AuthError
      if (code === 'auth/wrong-password') {
        setErrorMessage(WRONG_PASSWORD)
      } else {
        Sentry.captureException(error)
        console.error(
          'currentUser.reauthenticateWithCredential.',
          'code:',
          code,
          'message:',
          message
        )
        setErrorMessage(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  console.log('ChangePasswordDialog render called.')

  return (
    <Form
      onSubmit={handleSubmitFunc}
      render={
        // @ts-ignore */
        ({ handleSubmit, form }) => (
          <form onSubmit={handleSubmit} method="POST">
            <Dialog
              open
              fullWidth
              maxWidth="xs"
              onClose={handleClose}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle>Change Password</DialogTitle>

              <DialogContent>
                {errorMessage && (
                  <div className="mt-2 text-danger text-center">
                    {errorMessage}
                  </div>
                )}
                {isSuccess ? (
                  <div className="text-success text-center mt-4">
                    Password changed successfully.
                  </div>
                ) : (
                  <div>
                    <Field
                      label="Current password"
                      type="password"
                      margin="normal"
                      fullWidth
                      name={PASSWORD}
                      component={TextField}
                      validate={composeValidators(required, minPasswordLength)}
                    />

                    <Field
                      label="New password"
                      type="password"
                      margin="normal"
                      fullWidth
                      name={PASSWORD1}
                      component={TextField}
                      validate={composeValidators(required, minPasswordLength)}
                    />

                    <Field
                      label="Confirm new password"
                      type="password"
                      margin="normal"
                      fullWidth
                      name={PASSWORD2}
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
                      onClick={form.submit}
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

ChangePasswordDialog.propTypes = {
  firebaseUser: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
}

const mapStateToProps = ({ currentUser: { firebaseUser } }: IRedisState) => {
  return {
    firebaseUser
  }
}

// @ts-ignore
export default connect(mapStateToProps)(ChangePasswordDialog)
