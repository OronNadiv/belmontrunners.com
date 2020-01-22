import React, { useState, useEffect } from 'react'
import * as PropTypes from 'prop-types'
import {
  EXPIRED_ACTION_CODE,
  INVALID_ACTION_CODE_INVALID_URL,
  USER_DISABLED_INVALID_URL,
  USER_NOT_FOUND_INVALID_URL
} from '../../messages'
import { Redirect, withRouter, RouteComponentProps } from 'react-router-dom'
import { ROOT } from '../../urls'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core'
import * as Sentry from '@sentry/browser'
import { auth } from '../../firebase'

const RecoverEmailPage = ({ location: { state: { info: { data: { email } }, query: { oobCode } } } }: RouteComponentProps) => {
  const [close, setClose] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const processError = (error: firebase.auth.Error) => {
    const { code, message } = error
    switch (code) {
      case 'auth/expired-action-code':
        setErrorMessage(EXPIRED_ACTION_CODE)
        return
      case 'auth/invalid-action-code':
        setErrorMessage(INVALID_ACTION_CODE_INVALID_URL)
        return
      case 'auth/user-disabled':
        setErrorMessage(USER_DISABLED_INVALID_URL)
        return
      case 'auth/user-not-found':
        setErrorMessage(USER_NOT_FOUND_INVALID_URL)
        return
      default:
        Sentry.captureException(error)
        console.error('RecoverEmailPage', 'code:', code, 'message:', message)
        setErrorMessage(message)
    }
  }

  useEffect(() => {
    ;(async function() {
      // Get the restored email address.

      console.log('calling applyActionCode')
      try {
        await auth.applyActionCode(oobCode)
        console.log('calling sendPasswordResetEmail')
        try {
          await auth.sendPasswordResetEmail(email)
          setIsSuccess(true)
          setErrorMessage('')
        } catch (error) {
          const { code, message } = error
          Sentry.captureException(error)
          console.error('RecoverEmailPage', 'code:', code, 'message:', message)
          setErrorMessage(message)
        }
      } catch (error) {
        processError(error)
      }
    })()
  }, [oobCode, email])

  if (close) {
    console.log('redirecting to root', close)
    return <Redirect to={ROOT} />
  }

  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      onClose={() => setClose(true)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle>Recover Email</DialogTitle>

      <DialogContent>
        <DialogContentText>
          {isSuccess && (
            <div className="text-success text-center ">
              Your email ({email}) has been successfully recovered.
              <br />A password reset confirmation email has been sent to your
              email. Please follow the instructions in the email to reset your
              password.
            </div>
          )}
          {errorMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setClose(true)}
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

RecoverEmailPage.propTypes = {
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

// @ts-ignore
export default withRouter(RecoverEmailPage)
