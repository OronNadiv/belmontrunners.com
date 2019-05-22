import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField/index'
import { connect } from 'react-redux'
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

  componentDidUpdate (prevProps1, prevState) {
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

  signUp (fullName, email, password) {
    this.setState({
      isSigningUp: true,
      signUpError: null
    })

    Promise.resolve(firebase.auth().createUserWithEmailAndPassword(email, password))
      .tap((user) => {
        console.log('calling updateProfile', user)
        const displayName = s.words(fullName).map((w) => s.capitalize(w)).join(" ")
        console.log('displayName:', displayName)
        return firebase.auth().currentUser.updateProfile({
          displayName
        })
      })
      .then(({ user }) => {
        const currentUser = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
        const { email, displayName, photoURL } = user
        return currentUser.set({
          email,
          displayName,
          photoURL
        })
      })
      .then(() => {
        this.setState({
          signUpError: null
        })
      })
      .catch((error) => {
        this.state({
          signUpError: error
        })
      })
      .finally(() => {
        this.setState({
          isSigningUp: false
        })
      })
  }

  handleSignUp () {
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
    this.signUp(fullName, email, password)
  }

  handleSignInWithProvider (providerName) {
    return () => this.signIn(providerName)
  }

  render () {
    const {
      generalErrorMessage,
      invalidEmailMessage,
      invalidFullNameMessage,
      invalidPasswordMessage,
      success,
      isSigningUp
    } = this.state

    const {
      isLast,
      onNextClicked
    } = this.props

    return (
      <div className='justify-content-center'>
        <div className='btn btn-block btn-social btn-twitter'
             onClick={this.handleSignInWithProvider('facebook')}>
          <span className='fab fa-facebook' /> Connect with Facebook
        </div>
        <div className='btn btn-block btn-social btn-google'
             onClick={this.handleSignInWithProvider('google')}>
          <span className='fab fa-google' /> Connect with Google
        </div>

        <div className='mt-4 text-center text-dark'>Or sign up with email</div>

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
              this.handleSignUp()
            }
          }}
        />
        <div className='mt-2 mb-2 text-center'>
          By clicking “NEXT”, you agree to our <a href='https://www.belmontrunners.com/documents/2019-04-01_tos.pdf'
                                                  target='_blank' rel='noopener noreferrer'>terms of service</a>, <a
          href='https://www.belmontrunners.com/documents/2019-05-18_privacy_policy.pdf' target='_blank'
          rel='noopener noreferrer'>privacy statement</a> and <a
          href='https://www.belmontrunners.com/documents/2019-05-18_waver.pdf' target='_blank'
          rel='noopener noreferrer'>release of liability</a>. We’ll occasionally send you account related emails.
        </div>
        <SignUpStepperButton
          isLast={isLast}
          onNextClicked={() => success ? onNextClicked() : this.handleSignUp()}
          disabled={isSigningUp}
        />
      </div>
    )
  }
}

View.propTypes = {
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired,
  currentUser: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps)(View)
