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
import { INVALID_PASSWORD_LENGTH, MISSING_PASSWORD, PASSWORDS_MISMATCH, WRONG_PASSWORD } from '../../messages'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

class ChangePasswordPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      successMessage: '',
      generalErrorMessage: '',
      errorPasswordMessage0: '',
      errorPasswordMessage1: '',
      errorPasswordMessage2: '',
      password0: '',
      password1: '',
      password2: ''
    }
  }

  resetErrors () {
    this.setState({
      generalErrorMessage: '',
      errorPasswordMessage0: '',
      errorPasswordMessage1: '',
      errorPasswordMessage2: ''
    })

  }

  handleSubmit () {
    const { password0, password1, password2 } = this.state
    const { currentUser } = this.props

    if (!password0) {
      this.setState({ errorPasswordMessage0: MISSING_PASSWORD })
      return
    }
    if (!password1) {
      this.setState({ errorPasswordMessage1: MISSING_PASSWORD })
      return
    }
    if (!password2) {
      this.setState({ errorPasswordMessage2: MISSING_PASSWORD })
      return
    }

    if (password1 !== password2) {
      this.setState({ errorPasswordMessage2: PASSWORDS_MISMATCH })
      return
    }

    console.log('password1.length:', password1.length)
    if (password1.length < 6) {
      this.setState({ errorPasswordMessage1: INVALID_PASSWORD_LENGTH(6) })
      return
    }


    this.setState({ isSubmitting: true })
    this.resetErrors()
    const credentials = firebase.auth.EmailAuthProvider.credential(currentUser.email, password0)
    currentUser.reauthenticateWithCredential(credentials)
      .then(() => {
        return currentUser.updatePassword(password1)
          .then(() => {
            this.setState({ successMessage: 'Password changed successfully.' })
          })
          .catch((error) => {
            const { code, message } = error
            console.error('unexpected code.',
              'code:', code,
              'message:', message)
            this.setState({
              generalErrorMessage: message
            })
          })
      })
      .catch((error) => {
        const { code, message } = error
        if (code === 'auth/wrong-password') {
          this.setState({
            errorPasswordMessage0: WRONG_PASSWORD
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
    console.log('ChangePasswordPage render called.  close:', close)

    const {
      close, isSubmitting,
      successMessage,
      errorPasswordMessage0,
      errorPasswordMessage1,
      errorPasswordMessage2,
      generalErrorMessage
    } = this.state

    if (close) {
      return <Redirect to={ROOT} />
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
          Change Password
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
                  label="Current password"
                  margin="normal"
                  type='password'
                  fullWidth
                  onChange={(event) => {
                    this.resetErrors()
                    this.setState({
                      password0: event.target.value
                    })
                  }}
                  error={!!errorPasswordMessage0}
                  helperText={errorPasswordMessage0}
                />

                <TextField
                  label="New password"
                  margin="normal"
                  type='password'
                  fullWidth
                  onChange={(event) => {
                    this.resetErrors()
                    this.setState({
                      password1: event.target.value
                    })
                  }}
                  error={!!errorPasswordMessage1}
                  helperText={errorPasswordMessage1}
                />

                <TextField
                  label="Confirm new password"
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
                      password2: event.target.value
                    })
                  }}
                  error={!!errorPasswordMessage2}
                  helperText={errorPasswordMessage2}
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


ChangePasswordPage.propTypes = {
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser } }) => {
  return {
    currentUser
  }
}

export default connect(mapStateToProps)(LoggedInState({
  name: 'ChangePasswordPage',
  isRequiredToBeLoggedIn: true
})(ChangePasswordPage))
