import React, { Component } from 'react'
import PropTypes from 'prop-types'
import isEmail from 'isemail/lib/index'
import './Signin.scss'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import {
  INVALID_EMAIL,
  INVALID_EMAIL_OR_PASSWORD,
  INVALID_PASSWORD_LENGTH,
  MISSING_PASSWORD,
  POPUP_CLOSED_BEFORE_COMPLETION
} from '../messages'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import 'firebase/auth'
import firebase from 'firebase'

const providerGoogle = new firebase.auth.GoogleAuthProvider()
const providerFacebook = new firebase.auth.FacebookAuthProvider()

class SignInView extends Component {

  constructor (props) {
    super(props)
    this.state = {
      invalidEmailMessage: '',
      invalidPasswordMessage: '',
      generalErrorMessage: ''
    }
  }

  signIn (providerName, params) {
    let promise
    switch (providerName.toLowerCase()) {
      case 'facebook':
        promise = firebase.auth().signInWithPopup(providerFacebook)
        break
      case 'google':
        promise = firebase.auth().signInWithPopup(providerGoogle)
        break
      case 'email':
      default:
        promise = firebase.auth().signInWithEmailAndPassword(params.email, params.password)
        break
    }

    this.setState({
      isSigningIn: true,
      signInError: null
    })

    promise
      .then(({ user }) => this.updateUserVisit(providerName)(user))
      .then(() => {
        this.setState({
          isSigningIn: false,
          signInError: null
        })
      })
      .catch((error) => {
        console.log('error while signing in', error)
        this.setState({
          isSigningIn: false,
          signInError: error
        })
      })
  }

  handleSignInWithEmail () {
    this.setState({ generalErrorMessage: '' })

    const { email, password } = this.state

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

    this.signIn('email', { email, password })
  }

  handleSignInWithProvider (providerName) {
    this.signIn(providerName)
  }

  componentDidUpdate (prevProps, prevState) {
    const { signInError } = this.state
    if (signInError && prevState.signInError !== signInError) {
      const { code, message } = signInError
      switch (code) {
        case 'auth/invalid-email':
          this.setState({ invalidEmailMessage: INVALID_EMAIL })
          break
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          this.setState({ generalErrorMessage: INVALID_EMAIL_OR_PASSWORD })
          break
        case 'auth/popup-closed-by-user':
          this.setState({ generalErrorMessage: POPUP_CLOSED_BEFORE_COMPLETION })
          break
        default:
          console.log('signInError', 'code:', code, 'message:', message)
          this.setState({ generalErrorMessage: message })
      }
    }
  }

  render () {
    console.log('Signin render called')

    const { isSigningIn } = this.state

    if (this.props.currentUser || this.state.close) {
      return <Redirect
        to={{
          pathname: "/",
          state: { from: '/signin' }
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
          Sign In
        </DialogTitle>

        <DialogContent>
          <div className="btn btn-block btn-social btn-twitter"
               onClick={() => this.handleSignInWithProvider('facebook')}>
            <span className="fab fa-facebook" /> Sign in with Facebook
          </div>
          <div className="btn btn-block btn-social btn-google"
               onClick={() => this.handleSignInWithProvider('google')}>
            <span className="fab fa-google" /> Sign in with Google
          </div>

          <div className="mt-4 text-center text-dark">Or sign in with email</div>

          {
            this.state.generalErrorMessage &&
            <div className="mt-2 text-danger text-center">{this.state.generalErrorMessage}</div>
          }

          <TextField
            label="Your email"
            margin="normal"
            type='search'
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
                this.handleSignInWithEmail()
              }
            }}
          />

          <p className="font-small blue-text d-flex justify-content-end">
            Forgot&nbsp;<Link className="blue-text ml-1" to="/forgotpassword">Password?</Link>
          </p>

        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => this.setState({ close: true })}
            disabled={isSigningIn}
          >
            Cancel
          </Button>
          <Button type="button" color="primary"
                  onClick={() => this.handleSignInWithEmail()}
                  disabled={isSigningIn}
          >
            Sign in
          </Button>

        </DialogActions>
      </Dialog>
    )
  }
}

SignInView.propTypes = {
  currentUser: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps)(SignInView)
