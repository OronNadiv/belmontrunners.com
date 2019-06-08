import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import '../sign-in-page/Signin.scss'
import { Redirect } from 'react-router-dom'
import isEmail from 'isemail'
import { INVALID_EMAIL, USER_NOT_FOUND_EXPLICIT } from '../../messages'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { ROOT } from '../../urls'
import LoggedInState from '../../components/LoggedInState'

class ForgotPasswordPage extends Component {
  constructor (props) {
    super(props)
    console.log('ForgotPasswordPage ctor called')
    this.state = {
      close: false,
      email: '',
      invalidEmailMessage: '',
      showSuccessMessage: false
    }
  }

  async sendPasswordReset () {
    const { email } = this.state
    if (!email || !isEmail.validate(email)) {
      this.setState({ invalidEmailMessage: INVALID_EMAIL })
      return
    }

    this.setState({
      isSendingPasswordResetEmail: true,
      sendPasswordResetEmailError: null
    })
    try {
      await firebase.auth().sendPasswordResetEmail(email)
      this.setState({
        isSendingPasswordResetEmail: false,
        sendPasswordResetEmailError: null
      })
    } catch (error) {
      this.setState({
        isSendingPasswordResetEmail: false,
        sendPasswordResetEmailError: error
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { isSendingPasswordResetEmail, sendPasswordResetEmailError } = this.state

    if (sendPasswordResetEmailError && prevState.sendPasswordResetEmailError !== sendPasswordResetEmailError) {
      const { code, message } = sendPasswordResetEmailError
      switch (code) {
        case 'auth/user-not-found':
          this.setState({ invalidEmailMessage: USER_NOT_FOUND_EXPLICIT })
          break
        case 'auth/invalid-email':
          this.setState({ invalidEmailMessage: INVALID_EMAIL })
          break
        default:
          console.error('sendPasswordResetEmailError', 'code:', code, 'message:', message)
          this.setState({ invalidEmailMessage: message })
      }
    } else if (!isSendingPasswordResetEmail && prevState.isSendingPasswordResetEmail) {
      this.setState({ showSuccessMessage: true })
    }
  }


  render () {
    const { isSendingPasswordResetEmail, close } = this.state

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
          Forgot Password
        </DialogTitle>

        <DialogContent>
          {
            this.state.showSuccessMessage ?

              <DialogContentText>
                <div className='text-success text-center'>
                  We have sent you an e-mail. Please contact us if you do not receive it within a few minutes.
                </div>
              </DialogContentText> :

              <TextField
                label="Your email"
                type='email'
                margin="normal"
                fullWidth
                onChange={(event) => {
                  this.setState({
                    invalidEmailMessage: '',
                    email: event.target.value
                  })
                }}
                error={!!this.state.invalidEmailMessage}
                helperText={this.state.invalidEmailMessage}
              />
          }
        </DialogContent>
        {
          this.state.showSuccessMessage ?
            <DialogActions>
              <Button onClick={() => this.setState({ close: true })} color="primary">
                Close
              </Button>
            </DialogActions>
            :
            <DialogActions>
              <Button onClick={() => this.setState({ close: true })}>
                Cancel
              </Button>
              <Button type="button" color="primary"
                      onClick={() => this.sendPasswordReset()}
                      disabled={isSendingPasswordResetEmail}>
                Send password reset email
              </Button>
            </DialogActions>
        }
      </Dialog>
    )
  }
}

export default LoggedInState({ name: 'ForgotPassword', isRequiredToBeLoggedIn: false })(ForgotPasswordPage)
