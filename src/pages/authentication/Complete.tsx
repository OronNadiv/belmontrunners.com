import { auth } from '../../firebase'
import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import * as PropTypes from 'prop-types'
import { ROOT } from '../../urls'
import { Redirect, withRouter } from 'react-router-dom'
import {
  EXPIRED_ACTION_CODE,
  INVALID_ACTION_CODE_INVALID_URL,
  USER_DISABLED_INVALID_URL,
  USER_NOT_FOUND_INVALID_URL
} from '../../messages'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core'
import * as Sentry from '@sentry/browser'

interface Props {
  location: {
    search: string
  }
}

const Complete = ({ location: { search } }: Props) => {

  const [errorMessage, setErrorMessage] = useState('')
  const [redirect, setRedirect] = useState()

  const processError = (error: firebase.auth.Error) => {
    const { code, message } = error
    console.log('code:', code, 'message:', message)
    switch (code) {
      case 'auth/expired-action-code':
        setErrorMessage(EXPIRED_ACTION_CODE)
        break
      case 'auth/invalid-action-code':
        setErrorMessage(INVALID_ACTION_CODE_INVALID_URL)
        break
      case 'auth/user-disabled':
        setErrorMessage(USER_DISABLED_INVALID_URL)
        break
      case 'auth/user-not-found':
        setErrorMessage(USER_NOT_FOUND_INVALID_URL)
        break
      default:
        Sentry.captureException(error)
        console.error('in Complete', 'code:', code, 'message:', message)
        setErrorMessage(message)
    }
  }

  useEffect(() => {
    const query: { mode?: string, oobCode?: string } = queryString.parse(search) || {}
    const { mode, oobCode } = query

    const foo = async () => {
      try {
        if (!oobCode) {
          processError({ code: 'auth/invalid-action-code', message: INVALID_ACTION_CODE_INVALID_URL })
          return
        }
        const info = await auth.checkActionCode(oobCode)
        let tmpRedirect
        if (mode) {
          tmpRedirect = (
            <Redirect
              to={{
                pathname: `/${mode}`,
                state: {
                  info,
                  query
                }
              }}
            />
          )
        } else {
          tmpRedirect = <Redirect to={ROOT} />
        }

        setRedirect(tmpRedirect)
      } catch (error) {
        processError(error)
      }
    }
    foo()
  }, [search])

  if (redirect) {
    return redirect
  } else if (!errorMessage) {
    return ''
  }
  return (
    <Dialog
      open
      fullWidth
      maxWidth="xs"
      onClose={() => setRedirect(<Redirect to={ROOT} />)}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle>Error</DialogTitle>

      <DialogContent>
        <DialogContentText>
          <div className="text-danger text-center">{errorMessage}</div>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setRedirect(<Redirect to={ROOT} />)}
          color="primary"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

Complete.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired
  }).isRequired
}

// @ts-ignore
export default withRouter(Complete)
