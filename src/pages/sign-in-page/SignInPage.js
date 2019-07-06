import 'firebase/auth'
import firebase from 'firebase'
import * as PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import isEmailComponent from 'isemail'
import { Link, withRouter } from 'react-router-dom'
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
import LoggedInState from '../../components/HOC/LoggedInState'
import * as Sentry from '@sentry/browser'
import { Field, Form } from 'react-final-form'
import { EMAIL, PASSWORD } from '../../fields'
import { goToTop } from 'react-scrollable-anchor'
import { compose } from 'underscore'

const providerGoogle = new firebase.auth.GoogleAuthProvider()
const providerFacebook = new firebase.auth.FacebookAuthProvider()

const required = value => (value ? undefined : 'Required')
const isEmail = value => (!value || !isEmailComponent.validate(value) ? INVALID_EMAIL : undefined)
const minPasswordLength = value => (value.length < 6 ? INVALID_PASSWORD_LENGTH(6) : undefined)
const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)

function SignInPage ({ history }) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    goToTop()
  }, [])

  useEffect(() => {
    errorMessage && goToTop()
  }, [errorMessage])

  const handleSignInError = (error) => {

    const { code, message } = error
    switch (code) {
      case 'auth/invalid-email':
        setErrorMessage(INVALID_EMAIL)
        break
      case 'auth/user-not-found':
        setErrorMessage(USER_NOT_FOUND_INVALID_EMAIL_OR_PASSWORD)
        break
      case 'auth/wrong-password':
        setErrorMessage(WRONG_PASSWORD_INVALID_EMAIL_OR_PASSWORD)
        break
      case 'auth/popup-closed-by-user':
        setErrorMessage(POPUP_CLOSED_BEFORE_COMPLETION)
        break
      default:
        Sentry.captureException(error)
        console.error('SignInPage',
          'code:', code,
          'message:', message)
        setErrorMessage(message)
    }
  }

  const signIn = async (providerName, params) => {
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

    setIsSigningIn(true)

    try {
      await promise
      setIsSignedIn(true)
    } catch (error) {
      console.log('error while signing in', error)
      setIsSignedIn(false)
      handleSignInError(error)
    }
    // todo: when sign-in is done via provider, redirect to user details and then maybe to payments
  }

  const handleSignInWithEmail = (values) => {
    setErrorMessage('')

    signIn('email', values)
  }

  // const handleSignInWithProvider = (providerName) => {
  //   signIn(providerName)
  // }


  const handleClose = () => {
    history.push(ROOT)
  }

  useEffect(() => {
    isSignedIn && history.push(ROOT)
  })

  console.log('Signin render called')

  return (
    <Form
      onSubmit={handleSignInWithEmail}
      render={({ handleSubmit, form }) => (
        <form onSubmit={handleSubmit}>
          <Dialog
            open
            fullWidth
            maxWidth='xs'
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle>
              Sign In
            </DialogTitle>

            <DialogContent>
              {/*
          // TODO: enable providers
          <div className="btn btn-block btn-social btn-twitter"
               onClick={() => handleSignInWithProvider('facebook')}>
            <span className="fab fa-facebook" /> Sign in with Facebook
          </div>
          <div className="btn btn-block btn-social btn-google"
               onClick={() => handleSignInWithProvider('google')}>
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
                onClick={handleClose}
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

SignInPage.propTypes = {
  history: PropTypes.object.isRequired
}

export default compose(
  withRouter,
  LoggedInState({ isRequiredToBeLoggedIn: false})
)(SignInPage)
