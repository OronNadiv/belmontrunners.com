import { auth } from '../../firebase'
import * as PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { Link, withRouter, RouteComponentProps } from 'react-router-dom'
import { TextField } from 'final-form-material-ui'
import {
  INVALID_EMAIL,
  POPUP_CLOSED_BEFORE_COMPLETION,
  USER_NOT_FOUND_INVALID_EMAIL_OR_PASSWORD,
  WRONG_PASSWORD_INVALID_EMAIL_OR_PASSWORD
} from '../../messages'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@material-ui/core'
import { FORGOT_PASSWORD, ROOT } from '../../urls'
import LoggedInState from '../../components/HOC/LoggedInState'
import * as Sentry from '@sentry/browser'
import { Field, Form } from 'react-final-form'
import { EMAIL, PASSWORD } from '../../fields'
import { goToTop } from 'react-scrollable-anchor'
import { compose } from 'underscore'
import { connect } from 'react-redux'
import { required, isEmail, minPasswordLength, composeValidators } from '../../utilities/formValidators'
import { CurrentUserStore } from '../../entities/User'

// const providerGoogle = new firebase.auth.GoogleAuthProvider()
// const providerFacebook = new firebase.auth.FacebookAuthProvider()

interface Props extends RouteComponentProps {
  currentUser: firebase.User
}

function SignInPage({ history, location, currentUser }: Props) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(goToTop, [])

  useEffect(() => {
    errorMessage && goToTop()
  }, [errorMessage])

  const handleSignInError = (error: firebase.auth.Error) => {
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
        console.error('SignInPage', 'code:', code, 'message:', message)
        setErrorMessage(message)
    }
  }

  interface IEmailPassword {
    email: string
    password: string
  }

  const signIn = async (providerName: string, params: IEmailPassword) => {
    let promise
    switch (providerName.toLowerCase()) {
      // case 'facebook':
      //   promise = auth.signInWithPopup(providerFacebook)
      //   break
      // case 'google':
      //   promise = auth.signInWithPopup(providerGoogle)
      //   break
      case 'email':
      default:
        promise = auth.signInWithEmailAndPassword(params.email, params.password)
        break
    }

    try {
      setIsSigningIn(true)
      await promise
    } catch (error) {
      setIsSigningIn(false)
      console.log('error while signing in', error)
      handleSignInError(error)
    }
    // todo: when sign-in is done via provider, redirect to user details and then maybe to payments
  }

  const handleSignInWithEmail = async (values: IEmailPassword) => {
    setErrorMessage('')

    await signIn('email', values)
  }

  // const handleSignInWithProvider = (providerName) => {
  //   signIn(providerName)
  // }

  const handleClose = () => {
    history.push(ROOT)
  }

  useEffect(() => {
    if (!currentUser) {
      return
    }
    let targetUrl = ROOT
    if (location && location.state && location.state.redirectUrl) {
      targetUrl = location.state.redirectUrl
    }
    currentUser && history.push(targetUrl)
  }, [currentUser, history, location])

  console.log('SignIn render called')

  return (
    <Form
      onSubmit={handleSignInWithEmail}
      // @ts-ignore
      render={({ handleSubmit, form }) => (
        <form onSubmit={handleSubmit} method="POST">
          <Dialog
            open
            fullWidth
            maxWidth="xs"
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle>Sign In</DialogTitle>

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

              {errorMessage && (
                <div className="mt-2 text-danger text-center">
                  {errorMessage}
                </div>
              )}

              <Field
                label="Your email"
                margin="normal"
                type="email"
                fullWidth
                name={EMAIL}
                component={TextField}
                validate={composeValidators(required, isEmail)}
              />
              <Field
                label="Your password"
                type="password"
                margin="normal"
                fullWidth
                name={PASSWORD}
                component={TextField}
                validate={composeValidators(required, minPasswordLength)}
              />

              <p className="float-right">
                Forgot
                <Link to={FORGOT_PASSWORD} className="ml-2">
                  Password?
                </Link>
              </p>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} disabled={isSigningIn}>
                Cancel
              </Button>
              <Button
                type="button"
                color="primary"
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
  currentUser: PropTypes.object,
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({
    state: PropTypes.shape({
      redirectUrl: PropTypes.string
    })
  }).isRequired
}

const mapStateToProps = ({ currentUser: { currentUser } }: CurrentUserStore) => {
  return {
    currentUser
  }
}

export default compose(
  connect(mapStateToProps),
  withRouter,
  LoggedInState({ isRequiredToBeLoggedIn: false })
)(SignInPage)
