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
  PASSWORDS_MISMATCH,
  WRONG_PASSWORD
} from '../../messages'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser'
import { PASSWORD } from '../../fields'
import { Field, Form } from 'react-final-form'
import { CurrentUserStore } from '../../entities/User'
import { required, minPasswordLength, composeValidators } from '../../utilities/formValidators'

const PASSWORD1 = 'password1'
const PASSWORD2 = 'password2'

interface Props {
  onClose: () => void
  currentUser: firebase.User
}

function ChangePasswordDialog({ onClose, currentUser }: Props) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmitFunc = async (values: { [key: string]: any }) => {
    if (!currentUser.email) {
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

    const credentials = firebase.auth.EmailAuthProvider.credential(
      currentUser.email,
      password0
    )
    try {
      await currentUser.reauthenticateWithCredential(credentials)
      try {
        await currentUser.updatePassword(password1)
        setIsSuccess(true)
      } catch (error) {
        const { code, message } = error
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
      const { code, message } = error
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
  currentUser: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser } }: CurrentUserStore) => {
  return {
    currentUser
  }
}

// @ts-ignore
export default connect(mapStateToProps)(ChangePasswordDialog)
