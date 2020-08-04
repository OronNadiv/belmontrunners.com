import { auth } from '../../firebase'
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

// @ts-ignore
const VerifyEmailPage = ({ location: { state: { query: { oobCode } } } }: RouteComponentProps) => {
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
        setIsSuccess(true)
      } catch (error) {
        processError(error)
      }
    })()
  }, [oobCode])


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
      <DialogTitle>Verify Email</DialogTitle>

      <DialogContent>
        <DialogContentText>
          {isSuccess && (
            <div className="text-success text-center">
              Your email has been verified
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

VerifyEmailPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      query: PropTypes.shape({
        oobCode: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }).isRequired
}

// @ts-ignore
export default withRouter(VerifyEmailPage)
