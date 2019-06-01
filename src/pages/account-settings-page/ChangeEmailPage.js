import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import { ROOT } from '../../urls'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import { Redirect } from 'react-router-dom'
import LoggedInState from '../../components/LoggedInState'
import Button from '@material-ui/core/Button'
import DialogTitle from '@material-ui/core/DialogTitle'
import isEmail from 'isemail'
import {
  EMAIL_ALREADY_IN_USE,
  EMAILS_DONT_MATCH,
  INVALID_EMAIL,
  MISSING_PASSWORD,
  WRONG_PASSWORD
} from '../../messages'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

class ChangeEmailPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      successMessage: '',
      generalErrorMessage: '',
      errorEmailMessage1: '',
      errorEmailMessage2: '',
      errorPasswordMessage: ''
    }
  }

  resetErrors () {
    this.setState({
      generalErrorMessage: '',
      errorEmailMessage1: '',
      errorEmailMessage2: '',
      errorPasswordMessage: ''
    })

  }

  handleSubmit () {
    const { email1, email2, password } = this.state
    const { currentUser } = this.props

    if (!email1 || !isEmail.validate(email1)) {
      this.setState({ errorEmailMessage1: INVALID_EMAIL })
      return
    }
    if (email1 !== email2) {
      this.setState({ errorEmailMessage2: EMAILS_DONT_MATCH })
      return
    }
    if (!password) {
      this.setState({ errorPasswordMessage: MISSING_PASSWORD })
      return
    }

    this.setState({ isSubmitting: true })
    this.resetErrors()
    const credentials = firebase.auth.EmailAuthProvider.credential(currentUser.email, password)
    currentUser.reauthenticateWithCredential(credentials)
      .then(() => {
        return currentUser.updateEmail(email1)
          .then(() => {
            this.setState({ successMessage: 'Email changed successfully.' })
          })
          .catch((error) => {
            const { code, message } = error
            switch (code) {
              case 'auth/invalid-email':
                this.setState({
                  errorEmailMessage1: INVALID_EMAIL
                })
                return
              case 'auth/email-already-in-use':
                this.setState({
                  errorEmailMessage1: EMAIL_ALREADY_IN_USE
                })
                return
              default:
                console.error('unexpected code.',
                  'code:', code,
                  'message:', message)
                this.setState({
                  generalErrorMessage: message
                })
            }
          })
      })
      .catch((error) => {
        const { code, message } = error
        if (code === 'auth/wrong-password') {
          this.setState({
            errorPasswordMessage: WRONG_PASSWORD
          })
        } else {
          this.setState({
            generalErrorMessage: message
          })
        }
      })
      .finally(() => {
        this.setState({ isSubmitting: false })
      })
  }

  render () {
    console.log('ChangeEmailPage render called')

    const {
      close, isSubmitting,
      successMessage,
      errorEmailMessage1,
      errorEmailMessage2,
      generalErrorMessage,
      errorPasswordMessage
    } = this.state

    if (close) {
      return <Redirect to={ROOT} />
    }

    if (successMessage) {
      return <div className='text-success text-center mt-4'>{successMessage}</div>
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
          Change Email
        </DialogTitle>

        <DialogContent>
          {
            generalErrorMessage &&
            <div className="mt-2 text-danger text-center">{generalErrorMessage}</div>
          }

          {
            successMessage ?
              <div className='text-success text-center mt-4'>{successMessage}</div> :
              <div>
                <TextField
                  label="New email"
                  margin="normal"
                  type='email'
                  fullWidth
                  onChange={(event) => {
                    this.resetErrors()
                    this.setState({
                      email1: event.target.value
                    })
                  }}
                  error={!!errorEmailMessage1}
                  helperText={errorEmailMessage1}
                />

                <TextField
                  label="Confirm email"
                  margin="normal"
                  type='email'
                  fullWidth
                  onChange={(event) => {
                    this.resetErrors()
                    this.setState({
                      email2: event.target.value
                    })
                  }}
                  error={!!errorEmailMessage2}
                  helperText={errorEmailMessage2}
                />

                <TextField
                  label="Current password"
                  margin="normal"
                  type='password'
                  fullWidth
                  onKeyPress={(ev) => {
                    console.log(`Pressed keyCode ${ev.key}`)
                    if (ev.key === 'Enter') {
                      // Do code here
                      ev.preventDefault()
                      this.handleSubmit()
                    }
                  }}
                  onChange={(event) => {
                    this.resetErrors()
                    this.setState({
                      password: event.target.value
                    })
                  }}
                  error={!!errorPasswordMessage}
                  helperText={errorPasswordMessage}
                />
              </div>
          }
        </DialogContent>

        <DialogActions>
          {
            successMessage ?
              <Button
                type="button"
                color="primary"
                onClick={() => this.setState({ close: true })}
              >
                Close
              </Button> :
              <div>
                <Button
                  type="button"
                  onClick={() => this.setState({ close: true })}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  color="primary"
                  disabled={isSubmitting}
                  onClick={() => this.handleSubmit()}
                >
                  Submit
                </Button>
              </div>
          }
        </DialogActions>
      </Dialog>
    )
  }
}


ChangeEmailPage.propTypes = {
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser } }) => {
  return {
    currentUser
  }
}

export default connect(mapStateToProps)(LoggedInState({
  name: 'ChangeEmailPage',
  isRequiredToBeLoggedIn: true
})(ChangeEmailPage))
