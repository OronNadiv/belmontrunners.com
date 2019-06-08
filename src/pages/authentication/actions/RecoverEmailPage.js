// import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  EXPIRED_ACTION_CODE,
  INVALID_ACTION_CODE_INVALID_URL,
  USER_DISABLED_INVALID_URL,
  USER_NOT_FOUND_INVALID_URL
} from '../../../messages'
import { Redirect, withRouter } from 'react-router-dom'
import { ROOT } from '../../../urls'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import * as Sentry from '@sentry/browser'

class RecoverEmailPage extends Component {
  constructor (props) {
    console.log('RecoverEmailPage ctor')
    super(props)
    this.state = {}
  }

  processError (error) {
    const { code, message } = error
    switch (code) {
      case 'auth/expired-action-code':
        this.setState({
          errorMessage: EXPIRED_ACTION_CODE
        })
        return
      case 'auth/invalid-action-code':
        this.setState({
          errorMessage: INVALID_ACTION_CODE_INVALID_URL
        })
        return
      case 'auth/user-disabled':
        this.setState({
          errorMessage: USER_DISABLED_INVALID_URL
        })
        return
      case 'auth/user-not-found':
        this.setState({
          errorMessage: USER_NOT_FOUND_INVALID_URL
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
    const restoredEmail = this.props.location.state.info.data.email

    console.log('calling applyActionCode')
    try {
      await firebase.auth()
        .applyActionCode(oobCode)
      console.log('calling sendPasswordResetEmail')
      try {
        await firebase.auth()
          .sendPasswordResetEmail(restoredEmail)
        this.setState({
          successMessage:
            <div className='text-success text-center '>
              Your email ({restoredEmail}) has been successfully recovered.<br />
              A password reset confirmation email has been sent to your email.
              Please follow the instructions in the email to reset your password.
            </div>,
          errorMessage: ''
        })
      } catch (error) {
        const { code, message } = error
        Sentry.captureException(error)
        console.error('RecoverEmailPage',
          'code:', code,
          'message:', message)
        this.setState({ errorMessage: message })
      }
    } catch (error) {
      this.processError(error)
    }
  }

  render () {
    const { successMessage, errorMessage, close } = this.state

    if (close) {
      console.log('redirecting to root', close)
      return <Redirect to={ROOT} />
    }

    return (
      <Dialog
        open
        fullWidth
        maxWidth='xs'
        onClose={() => this.setState({ close: true })}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>
          Recover Email
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            {successMessage}
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({ close: true })} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
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

export default withRouter(RecoverEmailPage)
