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
import { DISPLAY_NAME, EMAIL, PASSWORD } from '../../fields'
import { animateScroll } from 'react-scroll'
import { compose } from 'underscore'
import { required, isEmail, minPasswordLength, composeValidators } from '../../utilities/formValidators'
import { IUserOptionalProps } from '../../entities/User'

interface Props {
  onNextClicked: () => void
  isLast: boolean
}

function SignUpStepAuth({ onNextClicked, isLast }: Props) {
  const [errorMessage, setErrorMessage] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)

  useEffect(() => {
    animateScroll.scrollToTop({ duration: 0 })
  }, [])

  useEffect(() => {
    errorMessage && animateScroll.scrollToTop({ duration: 0 })
  }, [errorMessage])

  const signUp = async (fullName: string, email: string, password: string) => {
    const displayName = _s.words(_s.clean(fullName))
      .map((w) => _s.capitalize(w))
      .join(' ')

    setErrorMessage('')
    setIsSigningUp(true)

    try {
      const user = await auth.createUserWithEmailAndPassword(email, password)
      console.log('calling updateProfile', user)
      if (!auth.currentUser) {
        throw new Error('auth.currentUser is falsify')
      }
      await auth.currentUser.updateProfile({ displayName })
      const userRef = firestore
        .doc(`users/${auth.currentUser.uid}`)
      const values: IUserOptionalProps = {
        displayName,
        tosUrl: TOS_FILE_NAME,
        tosAcceptedAt: moment().format(),
        waverUrl: WAVER_FILE_NAME,
        waverAcceptedAt: moment().utc().format(),
        privacyPolicyUrl: PRIVACY_POLICY_FILE_NAME,
        privacyPolicyAcceptedAt: moment().utc().format()
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
    await signUp(values[DISPLAY_NAME], values[EMAIL], values[PASSWORD])
  }

  return (
    <div style={{ maxWidth: 400 }}>
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
