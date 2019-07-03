import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import isEmailComponent from 'isemail'
import { Link, Redirect } from 'react-router-dom'
import { TextField } from 'final-form-material-ui'
import {
  INVALID_EMAIL,
  INVALID_PASSWORD_LENGTH,
  POPUP_CLOSED_BEFORE_COMPLETION,
  USER_NOT_FOUND_INVALID_EMAIL_OR_PASSWORD,
  WRONG_PASSWORD_INVALID_EMAIL_OR_PASSWORD
} from '../../messages'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { FORGOT_PASSWORD, ROOT } from '../../urls'
import LoggedInState from '../../components/LoggedInState'
import * as Sentry from '@sentry/browser'
import { Field, Form } from 'react-final-form'
import { EMAIL, PASSWORD } from '../../fields'

const providerGoogle = new firebase.auth.GoogleAuthProvider()
const providerFacebook = new firebase.auth.FacebookAuthProvider()

const required = value => (value ? undefined : 'Required')
const isEmail = value => (!value || !isEmailComponent.validate(value) ? INVALID_EMAIL : undefined)
const minPasswordLength = value => (value.length < 6 ? INVALID_PASSWORD_LENGTH(6) : undefined)
const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)

class SignInPage extends Component {

  constructor (props) {
    super(props)
    this.state = {
      errorMessage: '',
      isSigningIn: false,
      isSignedIn: false
    }
  }

  handleSignInError (error) {
    window.scrollTo(0, 0)

    const { code, message } = error
    switch (code) {
      case 'auth/invalid-email':
        this.setState({ errorMessage: INVALID_EMAIL })
        break
      case 'auth/user-not-found':
        this.setState({ errorMessage: USER_NOT_FOUND_INVALID_EMAIL_OR_PASSWORD })
        break
      case 'auth/wrong-password':
        this.setState({ errorMessage: WRONG_PASSWORD_INVALID_EMAIL_OR_PASSWORD })
        break
      case 'auth/popup-closed-by-user':
        this.setState({ errorMessage: POPUP_CLOSED_BEFORE_COMPLETION })
        break
      default:
        Sentry.captureException(error)
        console.error('SignInPage',
          'code:', code,
          'message:', message)
        this.setState({ errorMessage: message })
    }
  }

  async signIn (providerName, params) {
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
        promise = firebase.auth().signInWithEmailAndPassword(params[EMAIL], params[PASSWORD])
        break
    }

    this.setState({
      isSigningIn: true
    })

    try {
      await promise
      this.setState({
        isSignedIn: false
      })
    } catch (error) {
      console.log('error while signing in', error)
      this.setState({
        isSignedIn: false
      })
      this.handleSignInError(error)
    }
    // todo: when sign-in is done via provider, redirect to user details and then maybe to payments
  }

  handleSignInWithEmail (values) {
    this.setState({ errorMessage: '' })

    this.signIn('email', values)
  }

  handleSignInWithProvider (providerName) {
    this.signIn(providerName)
  }

  render () {
    console.log('Signin render called')

    const { close, isSigningIn, isSignedIn, errorMessage } = this.state

    if (close || isSignedIn) {
      return <Redirect to={ROOT} />
    }

    return (
      <Form
        onSubmit={(values) => this.handleSignInWithEmail(values)}
        render={({ handleSubmit, form }) => (
          <form onSubmit={handleSubmit}>
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
                {/*
          // TODO: enable providers
          <div className="btn btn-block btn-social btn-twitter"
               onClick={() => this.handleSignInWithProvider('facebook')}>
            <span className="fab fa-facebook" /> Sign in with Facebook
          </div>
          <div className="btn btn-block btn-social btn-google"
               onClick={() => this.handleSignInWithProvider('google')}>
            <span className="fab fa-google" /> Sign in with Google
          </div>

          <div className="mt-4 text-center text-dark">Or sign in with email</div>
*/}

                {
                  errorMessage &&
                  <div className="mt-2 text-danger text-center">{errorMessage}</div>
                }

                <Field
                  label='Your email'
                  margin='normal'
                  type='email'
                  fullWidth
                  name={EMAIL}
                  component={TextField}
                  validate={composeValidators(required, isEmail)}
                />
                <Field
                  label='Your password'
                  type='password'
                  margin='normal'
                  fullWidth
                  name={PASSWORD}
                  component={TextField}
                  validate={composeValidators(required, minPasswordLength)}
                />

                <p className="float-right">
                  Forgot<Link to={FORGOT_PASSWORD} className="ml-2">Password?</Link>
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
                        onClick={() => form.submit()}
                        disabled={isSigningIn}
                >
                  Sign in
                </Button>

              </DialogActions>
            </Dialog>
          </form>
        )}
      />
    )
  }
}

export default LoggedInState({ name: 'SignIn', isRequiredToBeLoggedIn: false })(SignInPage)
