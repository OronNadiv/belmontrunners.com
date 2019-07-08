import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import * as PropTypes from 'prop-types'
import {
  EXPIRED_ACTION_CODE,
  INVALID_ACTION_CODE_INVALID_URL,
  USER_DISABLED_INVALID_URL,
  USER_NOT_FOUND_INVALID_URL
} from '../../messages'
import { Redirect, withRouter } from 'react-router-dom'
import { ROOT } from '../../urls'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'
import * as Sentry from '@sentry/browser'

const STATE_CLOSE = 'close'
const STATE_ERROR_MESSAGE = 'errorMessage'
const STATE_IS_SUCCESS = 'isSuccess'

class VerifyEmailPage extends Component {
  constructor (props) {
    console.log('RecoverEmailPage ctor')
    super(props)
    this.state = {
      [STATE_CLOSE]: false,
      [STATE_ERROR_MESSAGE]: '',
      [STATE_IS_SUCCESS]: false
    }
  }

  processError (error) {
    const { code, message } = error
    switch (code) {
      case 'auth/expired-action-code':
        this.setState({
          [STATE_ERROR_MESSAGE]: EXPIRED_ACTION_CODE
        })
        return
      case 'auth/invalid-action-code':
        this.setState({
          [STATE_ERROR_MESSAGE]: INVALID_ACTION_CODE_INVALID_URL
        })
        return
      case 'auth/user-disabled':
        this.setState({
          [STATE_ERROR_MESSAGE]: USER_DISABLED_INVALID_URL
        })
        return
      case 'auth/user-not-found':
        this.setState({
          [STATE_ERROR_MESSAGE]: USER_NOT_FOUND_INVALID_URL
        })
        return
      default:
        Sentry.captureException(error)
        console.error('RecoverEmailPage',
          'code:', code,
          'message:', message)
        this.setState({ errorMessage: message })
    }
  }

  async componentDidMount () {
    // Get the restored email address.
    const oobCode = this.props.location.state.query.oobCode

    console.log('calling applyActionCode')
    try {
      await firebase.auth().applyActionCode(oobCode)
      this.setState({ [STATE_IS_SUCCESS]: true })
    } catch (error) {
      this.processError(error)
    }
  }

  render () {
    const close = this.state[STATE_CLOSE]
    const errorMessage = this.state[STATE_ERROR_MESSAGE]
    const isSuccess = this.state[STATE_IS_SUCCESS]

    if (close) {
      console.log('redirecting to root', close)
      return <Redirect to={ROOT} />
    }

    return (
      <Dialog
        open
        fullWidth
        maxWidth='xs'
        onClose={() => this.setState({ [STATE_CLOSE]: true })}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>
          Verify Email
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {
              isSuccess &&
              <div className='text-success text-center'>
                Your email has been verified
              </div>
            }
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({ [STATE_CLOSE]: true })} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

VerifyEmailPage.propTypes = {
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

export default withRouter(VerifyEmailPage)
