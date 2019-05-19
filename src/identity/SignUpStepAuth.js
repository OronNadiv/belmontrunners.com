import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
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
import * as PropTypes from 'prop-types'
import SignUpStepperButtons from './SignUpStepperButtons1'

class SignUpStepAuth extends Component {
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

  componentDidUpdate (prevProps) {
    const {
      signUpError
    } = this.props
    if (signUpError && prevProps.signUpError !== signUpError) {
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

  handleSignUp () {
    const { signUp } = this.props
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
    signUp(fullName, email, password)
  }

  handleSignInWithProvider (providerName) {
    return () => this.props.signIn(providerName)
  }

  render () {
    const {
      generalErrorMessage,
      invalidEmailMessage,
      invalidFullNameMessage,
      invalidPasswordMessage,
      success
    } = this.state
    const {
      isLast,
      onNextClicked
    } = this.props
    return (
      <div className='container-fluid'>
        <div className='row justify-content-center'>
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
          <SignUpStepperButtons
            className='mt-2'
            isLast={isLast}
            onNextClicked={() => success ? onNextClicked() : this.handleSignUp()}
            disable={!success}
          />

          <div className='mt-2 text-center'>
            By clicking “NEXT”, you agree to our <a href='https://www.belmontrunners.com/2019-04-01_tos.pdf'
                                                    target='_blank' rel='noopener noreferrer'>terms of service</a>, <a
            href='https://www.belmontrunners.com/2019-05-18_privacy_policy.pdf' target='_blank'
            rel='noopener noreferrer'>privacy statement</a> and <a
            href='https://www.belmontrunners.com/2019-05-18_waver.pdf' target='_blank'
            rel='noopener noreferrer'>release of liability</a>. We’ll occasionally send you account related emails.
          </div>
        </div>
      </div>
    )
  }
}

SignUpStepAuth.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(SignUpStepAuth)
