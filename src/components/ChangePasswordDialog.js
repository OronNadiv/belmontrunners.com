import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import { TextField } from 'final-form-material-ui'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import DialogTitle from '@material-ui/core/DialogTitle'
import { INVALID_PASSWORD_LENGTH, PASSWORDS_MISMATCH, WRONG_PASSWORD } from '../messages'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser'
import { PASSWORD } from '../fields'
import { Field, Form } from 'react-final-form'

const required = value => (value ? undefined : 'Required')
const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)
const minPasswordLength = value => (value.length < 6 ? INVALID_PASSWORD_LENGTH(6) : undefined)

const STATE_ERROR_MESSAGE = 'errorMessage'
const STATE_IS_SUBMITTING = 'isSubmitting'
const STATE_IS_SUCCESS = 'isSuccess'

const PASSWORD1 = 'password1'
const PASSWORD2 = 'password2'

class ChangePasswordDialog extends Component {

  constructor (props) {
    super(props)
    this.state = {
      [STATE_ERROR_MESSAGE]: '',
      [STATE_IS_SUBMITTING]: false,
      [STATE_IS_SUCCESS]: false
    }
  }

  async handleSubmit (values) {
    const password0 = values[PASSWORD]
    const password1 = values[PASSWORD1]
    const password2 = values[PASSWORD2]
    const { currentUser } = this.props

    if (password1 !== password2) {
      return { [PASSWORD2]: PASSWORDS_MISMATCH }
    }

    this.setState({
      [STATE_ERROR_MESSAGE]: '',
      [STATE_IS_SUBMITTING]: true
    })
    const credentials = firebase.auth.EmailAuthProvider.credential(currentUser.email, password0)
    try {
      await currentUser.reauthenticateWithCredential(credentials)
      try {
        await currentUser.updatePassword(password1)
        this.setState({
          [STATE_IS_SUCCESS]: true
        })
      } catch (error) {
        const { code, message } = error
        Sentry.captureException(error)
        console.error('currentUser.updatePassword.',
          'code:', code,
          'message:', message)
        this.setState({
          [STATE_ERROR_MESSAGE]: message
        })
      }
    } catch (error) {
      const { code, message } = error
      if (code === 'auth/wrong-password') {
        this.setState({
          [STATE_ERROR_MESSAGE]: WRONG_PASSWORD
        })
      } else {
        Sentry.captureException(error)
        console.error('currentUser.reauthenticateWithCredential.',
          'code:', code,
          'message:', message)
        this.setState({
          [STATE_ERROR_MESSAGE]: message
        })
      }
    } finally {
      this.setState({
        [STATE_IS_SUBMITTING]: false
      })
    }
  }

  handleClose () {
    this.props.onClose()
  }

  render () {
    console.log('ChangePasswordDialog render called.')

    const errorMessage = this.state[STATE_ERROR_MESSAGE]
    const isSubmitting = this.state[STATE_IS_SUBMITTING]
    const isSuccess = this.state[STATE_IS_SUCCESS]

    return (
      <Form
        onSubmit={(values) => this.handleSubmit(values)}
        render={({ handleSubmit, form }) => (
          <form onSubmit={handleSubmit}>

            <Dialog
              open
              fullWidth
              maxWidth='xs'
              onClose={() => this.handleClose()}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle>
                Change Password
              </DialogTitle>

              <DialogContent>
                {
                  errorMessage &&
                  <div className="mt-2 text-danger text-center">{errorMessage}</div>
                }
                {
                  isSuccess
                    ?
                    <div className='text-success text-center mt-4'>Password changed successfully.</div>
                    :
                    <div>
                      <Field
                        label='Current password'
                        type='password'
                        margin='normal'
                        fullWidth
                        name={PASSWORD}
                        component={TextField}
                        validate={composeValidators(required, minPasswordLength)}
                      />

                      <Field
                        label='New password'
                        type='password'
                        margin='normal'
                        fullWidth
                        name={PASSWORD1}
                        component={TextField}
                        validate={composeValidators(required, minPasswordLength)}
                      />

                      <Field
                        label='Confirm new password'
                        type='password'
                        margin='normal'
                        fullWidth
                        name={PASSWORD2}
                        component={TextField}
                        validate={composeValidators(required, minPasswordLength)}
                      />
                    </div>
                }
              </DialogContent>

              <DialogActions>
                {
                  isSuccess
                    ?
                    <Button
                      type="button"
                      color="primary"
                      onClick={() => this.handleClose()}
                    >
                      Close
                    </Button>
                    :
                    <div>
                      <Button
                        type="button"
                        onClick={() => this.handleClose()}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        color="primary"
                        disabled={isSubmitting}
                        onClick={() => form.submit()}
                      >
                        Submit
                      </Button>
                    </div>
                }
              </DialogActions>
            </Dialog>
          </form>
        )}
      />
    )
  }
}


ChangePasswordDialog.propTypes = {
  currentUser: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser } }) => {
  return {
    currentUser
  }
}

export default connect(mapStateToProps)(ChangePasswordDialog)
