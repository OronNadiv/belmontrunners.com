import { auth, firestore } from '../../firebase'
import firebase from 'firebase/app'
import React, { useEffect, useState } from 'react'
import { TextField } from 'final-form-material-ui'
import {
  EMAIL_ALREADY_IN_USE,
  INVALID_EMAIL,
  POPUP_CLOSED_BEFORE_COMPLETION
} from '../../messages'
import * as PropTypes from 'prop-types'
import SignUpStepperButton from './SignUpStepperButton'
import Promise from 'bluebird'
import _s from 'underscore.string'
import LoggedInState from '../../components/HOC/LoggedInState'
import {
  PRIVACY_POLICY,
  PRIVACY_POLICY_FILE_NAME,
  TOS,
  TOS_FILE_NAME,
  WAVER,
  WAVER_FILE_NAME
} from '../../urls'
import moment from 'moment'
import * as Sentry from '@sentry/browser'
import { Field, Form } from 'react-final-form'
import { DISPLAY_NAME, EMAIL, PASSWORD, UID } from '../../fields'
import { goToTop } from 'react-scrollable-anchor'
import { compose } from 'underscore'
import { required, isEmail, minPasswordLength, composeValidators } from '../../utilities/formValidators'

interface Props {
  onNextClicked: () => void
  isLast: boolean
}

function SignUpStepAuth({ onNextClicked, isLast }: Props) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)

  useEffect(() => {
    goToTop()
  }, [])

  useEffect(() => {
    errorMessage && goToTop()
  }, [errorMessage])

  const signUp = async (providerName: string, fullName: string, email: string, password: string) => {
    const displayName = _s.words(_s.clean(fullName))
      .map((w) => _s.capitalize(w))
      .join(' ')

    setErrorMessage('')
    setIsSigningUp(true)

    const providerGoogle = new firebase.auth.GoogleAuthProvider()
    const providerFacebook = new firebase.auth.FacebookAuthProvider()

    let promise
    switch (providerName.toLowerCase()) {
      case 'email':
        promise = Promise.resolve(
          auth.createUserWithEmailAndPassword(email, password)
        ).tap(user => {
          console.log('calling updateProfile', user)
          if (!auth.currentUser) {
            throw new Error('auth.currentUser is falsify')
          }
          return auth.currentUser.updateProfile({
            [DISPLAY_NAME]: displayName
          })
        })
        break
      case 'facebook':
        promise = auth.signInWithPopup(providerFacebook)
        break
      case 'google':
        promise = auth.signInWithPopup(providerGoogle)
        break
      default:
        console.error('missing default provider. returning facebook.')
        promise = auth.signInWithPopup(providerFacebook)
        break
    }
    try {

      await promise
      if (!auth.currentUser) {
        throw new Error('auth.currentUser is falsify')
      }
      const userRef = firestore
        .doc(`users/${auth.currentUser[UID]}`)
      const doc = await userRef.get()
      let values = {}
      if (!doc.exists) {
        values = {
          ...values,
          tosUrl: TOS_FILE_NAME,
          tosAcceptedAt: moment().format(),
          waverUrl: WAVER_FILE_NAME,
          waverAcceptedAt: moment()
            .utc()
            .format(),
          privacyPolicyUrl: PRIVACY_POLICY_FILE_NAME,
          privacyPolicyAcceptedAt: moment()
            .utc()
            .format()
        }
      }
      values = {
        ...values,
        email: auth.currentUser.email,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL
      }
      await userRef.set(values, { merge: true })
      onNextClicked()
    } catch (error) {
      setIsSigningUp(false)
      handleSignUpError(error)
    }
  }

  const handleSignUpError = (error: firebase.auth.Error) => {
    const { code, message } = error
    switch (code) {
      case 'auth/invalid-email':
        setErrorMessage(INVALID_EMAIL)
        break
      case 'auth/email-already-in-use':
        setErrorMessage(EMAIL_ALREADY_IN_USE)
        break
      case 'auth/popup-closed-by-user':
        setErrorMessage(POPUP_CLOSED_BEFORE_COMPLETION)
        break
      default:
        Sentry.captureException(error)
        console.error('signUpError', error)
        setErrorMessage(message)
    }
  }

  const handleSignUpWithEmail = async (values: { [DISPLAY_NAME]: string, [EMAIL]: string, [PASSWORD]: string }) => {
    console.log('handleSignUpWithEmail called.  Values:', values)
    await signUp('email', values[DISPLAY_NAME], values[EMAIL], values[PASSWORD])
  }

  // const handleSignInWithProvider = (providerName) => {
  //   signUp(providerName)
  // }

  return (
    <div style={{ maxWidth: 400 }}>
      {/*
        // TODO: enable providers.  Need to redirect to details and payment if seeing for the first time
        <div className='btn btn-block btn-social btn-twitter'
             onClick={() => handleSignInWithProvider('facebook')}>
          <span className='fab fa-facebook' /> Connect with Facebook
        </div>
        <div className='btn btn-block btn-social btn-google'
             onClick={() => handleSignInWithProvider('google')}>
          <span className='fab fa-google' /> Connect with Google
        </div>

        <div className='mt-4 text-center text-dark'>Or sign up with email</div>
*/}

      {errorMessage && (
        <div className="mt-2 text-danger text-center">{errorMessage}</div>
      )}

      <Form
        onSubmit={handleSignUpWithEmail}
        // @ts-ignore
        render={({ handleSubmit, form }) => (
          <form
            onSubmit={handleSubmit}
            method="POST"
            className="container-fluid"
          >
            <div className="row">
              <Field
                style={{ minHeight: 68 }}
                label="Your email"
                type="email"
                fullWidth
                margin="normal"
                name={EMAIL}
                component={TextField}
                validate={composeValidators(required, isEmail)}
              />
            </div>

            <div className="row">
              <Field
                style={{ minHeight: 68 }}
                label="Your full name"
                margin="normal"
                fullWidth
                name={DISPLAY_NAME}
                component={TextField}
                validate={required}
              />
            </div>

            <div className="row">
              <Field
                style={{ minHeight: 68 }}
                label="Your password"
                type="password"
                margin="normal"
                fullWidth
                name={PASSWORD}
                component={TextField}
                validate={composeValidators(required, minPasswordLength)}
              />
            </div>

            {
              // todo: add 'confirm password' field
            }
            <div className="mt-2 mb-2 text-center">
              By clicking “NEXT”, you agree to our{' '}
              <a href={TOS} target="_blank" rel="noopener noreferrer">
                terms of service
              </a>
              ,{' '}
              <a
                href={PRIVACY_POLICY}
                target="_blank"
                rel="noopener noreferrer"
              >
                privacy statement
              </a>{' '}
              and{' '}
              <a href={WAVER} target="_blank" rel="noopener noreferrer">
                release of liability
              </a>
              . We’ll occasionally send you account related emails.
            </div>
            <SignUpStepperButton
              handlePrimaryClicked={() => form.submit()}
              primaryText={isLast ? 'Create Account' : 'Next'}
              showPrimary
              primaryDisabled={isSigningUp}
            />
          </form>
        )}
      />
    </div>
  )
}

SignUpStepAuth.propTypes = {
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

export default compose(LoggedInState({ isRequiredToBeLoggedIn: false }))(
  SignUpStepAuth
)
