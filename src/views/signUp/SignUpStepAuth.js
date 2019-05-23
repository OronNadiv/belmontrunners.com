import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField/index'
import isEmail from 'isemail/lib/index'
import {
  EMAIL_ADDRESS_ALREADY_TAKEN,
  INVALID_EMAIL,
  INVALID_FULL_NAME,
  INVALID_PASSWORD_LENGTH,
  MISSING_PASSWORD,
  POPUP_CLOSED_BEFORE_COMPLETION
} from '../messages'
import * as PropTypes from 'prop-types'
import SignUpStepperButton from './SignUpStepperButton'
import Promise from 'bluebird'
import s from 'underscore.string'
import 'firebase/auth'
import firebase from 'firebase'
import LoggedInState from '../HOC/LoggedInState'
import { PRIVACY_POLICY, PRIVACY_POLICY_FILE_NAME, TOS, TOS_FILE_NAME, WAVER, WAVER_FILE_NAME } from '../urls'
import moment from 'moment'

class View extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fullName: '',
      email: '',
      password: '',
      invalidFullNameMessage: '',
      invalidEmailMessage: '',
      invalidPasswordMessage: '',
      generalErrorMessage: '',
      success: false
    }
  }

  componentDidMount () {
    window.scrollTo(0, 0)
  }

  componentDidUpdate (prevProps, prevState) {
    const {
      signUpError
    } = this.state
    if (signUpError && prevState.signUpError !== signUpError) {
      const {
        code,
        message
      } = signUpError
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

  signUp (providerName, fullName, email, password) {
    console.log('signUp  called')
    const { onNextClicked } = this.props
    this.setState({
      isSigningUp: true,
      signUpError: null
    })
    const providerGoogle = new firebase.auth.GoogleAuthProvider()
    const providerFacebook = new firebase.auth.FacebookAuthProvider()

    let promise
    switch (providerName.toLowerCase()) {
      case 'email':
        promise = Promise.resolve(firebase.auth().createUserWithEmailAndPassword(email, password))
          .tap((user) => {
            console.log('calling updateProfile', user)
            const displayName = s.words(fullName).map((w) => s.capitalize(w)).join(" ")
            console.log('displayName:', displayName)
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

    promise
      .then(() => {
        const currentUserRef = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
        return currentUserRef.get()
      })
      .then((doc) => {
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
        const currentUserRef = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
        return currentUserRef.set(values, { merge: true })
      })
      .then(() => {
        this.setState({
          signUpError: null
        })
        onNextClicked()
      })
      .catch((error) => {
        this.setState({
          signUpError: error
        })
      })
      .finally(() => {
        this.setState({
          isSigningUp: false
        })
      })
  }

  handleSignUpWithEmail () {
    this.setState({ generalErrorMessage: '' })
    const { fullName, email, password } = this.state

    if (!email || !isEmail.validate(email)) {
      this.setState({ invalidEmailMessage: INVALID_EMAIL })
    }
    if (!fullName) {
      this.setState({ invalidFullNameMessage: INVALID_FULL_NAME })
    }
    if (!password) {
      this.setState({ invalidPasswordMessage: MISSING_PASSWORD })
    } else if (password.length < 6) {
      this.setState({ invalidPasswordMessage: INVALID_PASSWORD_LENGTH(6) })
    }
    this.signUp('email', fullName, email, password)
  }


  handleSignInWithProvider (providerName) {
    this.signUp(providerName)
  }

  render () {
    const {
      generalErrorMessage,
      invalidEmailMessage,
      invalidFullNameMessage,
      invalidPasswordMessage,
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
          generalErrorMessage &&
          <div className='mt-2 text-danger text-center'>{generalErrorMessage}</div>
        }

        <TextField
          style={{ minHeight: 68 }}
          label='Your email'
          type='email'
          fullWidth
          margin='normal'
          onChange={(event) => {
            this.setState({
              invalidEmailMessage: '',
              email: event.target.value
            })
          }}
          error={!!invalidEmailMessage}
          helperText={invalidEmailMessage}
        />

        <TextField
          style={{ minHeight: 68 }}
          label='Your full name'
          margin='normal'
          fullWidth
          onChange={(event) => {
            this.setState({
              invalidFullNameMessage: '',
              fullName: event.target.value
            })
          }}
          error={!!invalidFullNameMessage}
          helperText={invalidFullNameMessage}
        />

        <TextField
          style={{ minHeight: 68 }}
          label='Your password'
          type='password'
          margin='normal'
          fullWidth
          onChange={(event) => {
            this.setState({
              invalidPasswordMessage: '',
              password: event.target.value
            })
          }}
          error={!!invalidPasswordMessage}
          helperText={invalidPasswordMessage}
          onKeyPress={(ev) => {
            console.log(`Pressed keyCode ${ev.key}`)
            if (ev.key === 'Enter') {
              ev.preventDefault()
              this.handleSignUpWithEmail()
            }
          }}
        />
        {
          // todo: add 'confirm password' field
        }
        <div className='mt-2 mb-2 text-center'>
          By clicking “NEXT”, you agree to our <a href={TOS}
                                                  target='_blank' rel='noopener noreferrer'>terms of service</a>, <a
          href={PRIVACY_POLICY} target='_blank'
          rel='noopener noreferrer'>privacy statement</a> and <a
          href={WAVER} target='_blank'
          rel='noopener noreferrer'>release of liability</a>. We’ll occasionally send you account related emails.
        </div>
        <SignUpStepperButton
          handlePrimaryClicked={() => this.handleSignUpWithEmail()}
          primaryText={isLast ? 'Finish' : 'Next'}
          showPrimary
          primaryDisabled={!!isSigningUp}
        />
      </div>
    )
  }
}

View.propTypes = {
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

export default LoggedInState({ name: 'SignUpStepAuth', isRequiredToBeLoggedIn: false, isAllowStateChange: true })(View)
