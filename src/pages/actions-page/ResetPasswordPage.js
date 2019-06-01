import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import '../sign-in-page/Signin.scss'
import { Redirect, withRouter } from 'react-router-dom'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import TextField from '@material-ui/core/TextField'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { ROOT } from '../../urls'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import { INVALID_PASSWORD_LENGTH, INVALID_URL, MISSING_PASSWORD, RESET_PASSWORD_SUCCESS } from '../../messages'

const WEAK_PASSWORD = 'Password is too weak.'

const CODE_KEY_NAME = 'oobCode'

class ResetPasswordPage extends Component {
  constructor (props) {
    super(props)
    console.log('ResetPassword constructor called')
    this.state = {
      close: false,
      newPassword: ''
    }
  }

  confirmPasswordReset () {
    const { newPassword } = this.state
    if (!newPassword) {
      this.setState({ error: { message: MISSING_PASSWORD } })
      return
    } else if (newPassword.length < 6) {
      this.setState({ error: { message: INVALID_PASSWORD_LENGTH(6) } })
      return
    }

    const { search } = this.props.location

    const parsed = queryString.parse(search) || {}
    const code = parsed[CODE_KEY_NAME]

    this.setState({ isRequesting: true })
    try {
      firebase.auth().confirmPasswordReset(code, newPassword)
        .then(() => {
          this.setState({
            isSuccess: true,
            error: null,
            errorMessage: null
          })
        })
        .catch((error) => {
          console.log('in catch', error)
          this.setState({
            isSuccess: false,
            error
          })
        })
        .finally(() => {
          this.setState({ isRequesting: false })
        })
    } catch (error) {
      this.setState({ error })
    }
  }

  componentDidMount () {
    const { search } = this.props.location

    const parsed = queryString.parse(search) || {}
    const code = parsed[CODE_KEY_NAME]

    if (!code || code.length < 10) {
      this.setState({
        errorMessage: INVALID_URL,
        isDone: true
      })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    const { error } = this.state
    if (!error || prevState.error === error) {
      return
    }

    const { code, message } = error
    if (code === 'auth/weak-password') {
      this.setState({ errorMessage: WEAK_PASSWORD })
    } else {
      console.error('confirmPasswordReset', 'code:', code, 'message:', message)
      this.setState({ errorMessage: message })
    }
  }

  render () {
    const { isSuccess, isDone, isRequesting, errorMessage, close } = this.state

    if (close) {
      console.log('redirecting to root', close)
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
          Reset Password
        </DialogTitle>

        <DialogContent>
          {
            isSuccess &&

            <DialogContentText>
              <div className='text-success text-center'>
                {RESET_PASSWORD_SUCCESS}
              </div>
            </DialogContentText>
          }
          {
            !isSuccess && isDone &&
            <DialogContentText>
              <div className='text-danger text-center'>
                {errorMessage}
              </div>
            </DialogContentText>

          }
          {
            !isSuccess && !isDone &&
            <TextField
              label="New password"
              type="password"
              margin="normal"
              fullWidth
              onChange={(event) => {
                this.setState({
                  newPassword: event.target.value
                })

              }}
              error={!!errorMessage}
              helperText={errorMessage}
              onKeyPress={(ev) => {
                console.log(`Pressed keyCode ${ev.key}`)
                if (ev.key === 'Enter') {
                  ev.preventDefault()
                  this.confirmPasswordReset()
                }
              }}
            />
          }
        </DialogContent>
        {
          isSuccess || isDone ?
            <DialogActions>
              <Button onClick={() => this.setState({ close: true })} color="primary">
                Close
              </Button>
            </DialogActions>
            :
            <DialogActions>
              <Button onClick={() => this.setState({ close: true })}>
                Cancel
              </Button>
              <Button type="button" color="primary"
                      onClick={() => this.confirmPasswordReset()}
                      disabled={isRequesting}>
                Set new password
              </Button>
            </DialogActions>
        }
      </Dialog>
    )
  }
}

ResetPasswordPage.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired
  }).isRequired
}

export default withRouter(ResetPasswordPage)
