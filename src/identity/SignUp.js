import React, { Component } from 'react'

import './Signup.scss'
import { Redirect } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import PropTypes from 'prop-types'
import { signIn as signInAction, signUp as signUpAction } from './identityActions'
import { connect } from 'react-redux'
import isEmail from 'isemail'
import {
  EMAIL_ADDRESS_ALREADY_TAKEN,
  INVALID_EMAIL,
  INVALID_FULL_NAME,
  INVALID_PASSWORD_LENGTH,
  MISSING_PASSWORD,
  POPUP_CLOSED_BEFORE_COMPLETION
} from './messages'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'

class SignUpView extends Component {
  constructor (props) {
    super(props)
    console.log('Signup contor called')
    this.state = {
      fullName: '',
      email: '',
      password: '',
      invalidFullNameMessage: '',
      invalidEmailMessage: '',
      invalidPasswordMessage: '',
      generalErrorMessage: ''
    }
  }

  handleSignUp () {
    this.setState({ generalErrorMessage: '' })
    const { fullName, email, password } = this.state

    if (!fullName) {
      this.setState({ invalidFullNameMessage: INVALID_FULL_NAME })
      return
    }
    if (!email || !isEmail.validate(email)) {
      this.setState({ invalidEmailMessage: INVALID_EMAIL })
      return
    }
    if (!password) {
      this.setState({ invalidPasswordMessage: MISSING_PASSWORD })
      return
    }
    if (password.length < 6) {
      this.setState({ invalidPasswordMessage: INVALID_PASSWORD_LENGTH(6) })
      return
    }
    this.props.signUp(fullName, email, password)
  }

  handleSignIn (providerName) {
    this.props.signIn(providerName)
  }

  componentDidUpdate (prevProps) {
    if (this.props.signUpError && prevProps.signUpError !== this.props.signUpError) {
      const { code, message } = this.props.signUpError
      switch (code) {
        case 'auth/invalid-email':
          this.setState({ invalidEmailMessage: INVALID_EMAIL })
          break
        case 'auth/email-already-in-use':
          this.setState({ invalidEmailMessage: EMAIL_ADDRESS_ALREADY_TAKEN })
          break
        case 'auth/popup-closed-by-user':
          this.setState({ generalErrorMessage: POPUP_CLOSED_BEFORE_COMPLETION })
          break
        default:
          console.log('signUpError', 'code:', code, 'message:', message)
          this.setState({ generalErrorMessage: message })
      }
    }
  }

  render () {
    console.log('Signup render called')
    if (this.props.currentUser || this.state.close) {
      return <Redirect
        to={{
          pathname: "/",
          state: { from: '/signup' }
        }}
      />
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
          Sign Up
        </DialogTitle>

        <DialogContent>

          <div className="btn btn-block btn-social btn-twitter"
               onClick={() => this.handleSignIn('facebook')}>
            <span className="fab fa-facebook" /> Connect with Facebook
          </div>
          <div className="btn btn-block btn-social btn-google"
               onClick={() => this.handleSignIn('google')}>
            <span className="fab fa-google" /> Connect with Google
          </div>

          <div className="mt-4 text-center text-dark">Or sign up with email</div>

          {
            this.state.generalErrorMessage &&
            <div className="mt-2 text-danger text-center">{this.state.generalErrorMessage}</div>
          }

          <TextField
            label="Your email"
            type='email'
            fullWidth
            margin="normal"
            onChange={(event) => {
              this.setState({
                invalidEmailMessage: '',
                email: event.target.value
              })
            }}
            error={!!this.state.invalidEmailMessage}
            helperText={this.state.invalidEmailMessage}
          />

          <TextField
            label="Your full name"
            margin="normal"
            fullWidth
            onChange={(event) => {
              this.setState({
                invalidFullNameMessage: '',
                fullName: event.target.value
              })
            }}
            error={!!this.state.invalidFullNameMessage}
            helperText={this.state.invalidFullNameMessage}
          />

          <TextField
            label="Your password"
            type="password"
            margin="normal"
            fullWidth
            onChange={(event) => {
              this.setState({
                invalidPasswordMessage: '',
                password: event.target.value
              })
            }}
            error={!!this.state.invalidPasswordMessage}
            helperText={this.state.invalidPasswordMessage}
            onKeyPress={(ev) => {
              console.log(`Pressed keyCode ${ev.key}`)
              if (ev.key === 'Enter') {
                // Do code here
                ev.preventDefault()
                this.handleSignUp()
              }
            }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({ close: true })}>
            Cancel
          </Button>
          <Button type="button" color="primary"
                  onClick={() => this.handleSignUp()}
                  disabled={this.props.isSendingPasswordResetEmail}>
            Sign up
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

SignUpView.propTypes = {
  signUp: PropTypes.func.isRequired,
  signInWithProvider: PropTypes.func.isRequired,
  signUpError: PropTypes.object
}

const mapDispatchToProps = {
  signUp: signUpAction,
  signIn: signInAction
}

const mapStateToProps = (state) => {
  return {
    signUpError: state.identity.get('signUpError'),
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUpView)
