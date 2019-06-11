import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import { TextField } from 'final-form-material-ui'
import isEmailComponent from 'isemail'
import {
  EMAIL_ALREADY_IN_USE,
  INVALID_EMAIL,
  INVALID_PASSWORD_LENGTH,
  POPUP_CLOSED_BEFORE_COMPLETION
} from '../../messages'
import * as PropTypes from 'prop-types'
import SignUpStepperButton from './SignUpStepperButton'
import Promise from 'bluebird'
import s from 'underscore.string'
import LoggedInState from '../../components/LoggedInState'
import { PRIVACY_POLICY, PRIVACY_POLICY_FILE_NAME, TOS, TOS_FILE_NAME, WAVER, WAVER_FILE_NAME } from '../../urls'
import moment from 'moment'
import * as Sentry from '@sentry/browser'
import { Field, Form } from 'react-final-form'
import { DISPLAY_NAME, EMAIL, PASSWORD } from '../../fields'

const required = value => (value ? undefined : 'Required')
const isEmail = value => (!value || !isEmailComponent.validate(value) ? INVALID_EMAIL : undefined)
const minPasswordLength = value => (value.length < 6 ? INVALID_PASSWORD_LENGTH(6) : undefined)
const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)

class View extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fullName: '',
      email: '',
      password: '',
      errorMessage: '',
      success: false
    }
  }

  componentDidMount () {
    window.scrollTo(0, 0)
  }

  async signUp (providerName, fullName, email, password) {
    const displayName = s(fullName).clean().words().map((w) => s.capitalize(w)).join(" ")

    const { onNextClicked } = this.props
    this.setState({
      errorMessage: '',
      isSigningUp: true
    })
    const providerGoogle = new firebase.auth.GoogleAuthProvider()
    const providerFacebook = new firebase.auth.FacebookAuthProvider()

    let promise
    switch (providerName.toLowerCase()) {
      case 'email':
        promise = Promise.resolve(firebase.auth().createUserWithEmailAndPassword(email, password))
          .tap((user) => {
            console.log('calling updateProfile', user)
            return firebase.auth().currentUser.updateProfile({
              displayName
            })
          })
        break
      case 'facebook':
        promise = firebase.auth().signInWithPopup(providerFacebook)
        break
      case 'google':
        promise = firebase.auth().signInWithPopup(providerGoogle)
        break
      default:
        console.error('missing default provider. returning facebook.')
        promise = firebase.auth().signInWithPopup(providerFacebook)
        break
    }
    try {
      await promise
      const currentUserRef = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
      const doc = await currentUserRef.get()
      let values = {}
      if (!doc.exists) {
        values = {
          ...values,
          tosUrl: TOS_FILE_NAME,
          tosAcceptedAt: moment().format(),
          waverUrl: WAVER_FILE_NAME,
          waverAcceptedAt: moment().utc().format(),
          privacyPolicyUrl: PRIVACY_POLICY_FILE_NAME,
          privacyPolicyAcceptedAt: moment().utc().format()
        }
      }
      const { email, displayName, photoURL } = firebase.auth().currentUser
      values = {
        ...values,
        email,
        displayName,
        photoURL
      }
      await currentUserRef.set(values, { merge: true })
      onNextClicked()
    } catch (error) {
      this.handleSignUpError(error)
    } finally {
      this.setState({
        isSigningUp: false
      })
    }
  }

  handleSignUpError (error) {
    window.scrollTo(0, 0)
    const {
      code,
      message
    } = error
    switch (code) {
      case 'auth/invalid-email':
        this.setState({ errorMessage: INVALID_EMAIL })
        break
      case 'auth/email-already-in-use':
        this.setState({ errorMessage: EMAIL_ALREADY_IN_USE })
        break
      case 'auth/popup-closed-by-user':
        this.setState({ errorMessage: POPUP_CLOSED_BEFORE_COMPLETION })
        break
      default:
        Sentry.captureException(error)
        console.error('signUpError', error)
        this.setState({ errorMessage: message })
    }
  }

  handleSignUpWithEmail (values) {
    console.log('handleSignUpWithEmail called.  Values:', values)
    this.signUp('email', values[DISPLAY_NAME], values[EMAIL], values[PASSWORD])
  }


  handleSignInWithProvider (providerName) {
    this.signUp(providerName)
  }

  render () {
    const {
      errorMessage,
      isSigningUp
    } = this.state

    const {
      isLast
    } = this.props

    return (
      <div style={{ maxWidth: 400 }}>
        {/*
        // TODO: enable providers.  Need to redirect to details and payment if seeing for the first time
        <div className='btn btn-block btn-social btn-twitter'
             onClick={() => this.handleSignInWithProvider('facebook')}>
          <span className='fab fa-facebook' /> Connect with Facebook
        </div>
        <div className='btn btn-block btn-social btn-google'
             onClick={() => this.handleSignInWithProvider('google')}>
          <span className='fab fa-google' /> Connect with Google
        </div>

        <div className='mt-4 text-center text-dark'>Or sign up with email</div>
*/}

        {
          errorMessage &&
          <div className='mt-2 text-danger text-center'>{errorMessage}</div>
        }

        <Form
          onSubmit={(values) => this.handleSignUpWithEmail(values)}
          render={({ handleSubmit, form }) => (
            <form onSubmit={handleSubmit} className='container-fluid'>

              <div className='row'>
                <Field
                  style={{ minHeight: 68 }}
                  label='Your email'
                  type='email'
                  fullWidth
                  margin='normal'
                  name={EMAIL}
                  component={TextField}
                  validate={composeValidators(required, isEmail)}
                />
              </div>

              <div className='row'>
                <Field
                  style={{ minHeight: 68 }}
                  label='Your full name'
                  margin='normal'
                  fullWidth
                  name={DISPLAY_NAME}
                  component={TextField}
                  validate={required}
                />
              </div>

              <div className='row'>
                <Field
                  style={{ minHeight: 68 }}
                  label='Your password'
                  type='password'
                  margin='normal'
                  fullWidth
                  name={PASSWORD}
                  component={TextField}
                  validate={composeValidators(required, minPasswordLength)}
                />
              </div>

              {
                // todo: add 'confirm password' field
              }
              <div className='mt-2 mb-2 text-center'>
                By clicking “NEXT”, you agree to our <a href={TOS}
                                                        target='_blank' rel='noopener noreferrer'>terms of
                service</a>, <a
                href={PRIVACY_POLICY} target='_blank'
                rel='noopener noreferrer'>privacy statement</a> and <a
                href={WAVER} target='_blank'
                rel='noopener noreferrer'>release of liability</a>. We’ll occasionally send you account related emails.
              </div>
              <SignUpStepperButton
                handlePrimaryClicked={() => form.submit()}
                primaryText={isLast ? 'Create Account' : 'Next'}
                showPrimary
                primaryDisabled={!!isSigningUp}
              />
            </form>
          )}
        />
      </div>
    )
  }
}

View.propTypes = {
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

export default LoggedInState({ name: 'SignUpStepAuth', isRequiredToBeLoggedIn: false, canSwitchToLogin: true })(View)
