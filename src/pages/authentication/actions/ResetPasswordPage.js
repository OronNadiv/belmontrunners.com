// import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import { Redirect, withRouter } from 'react-router-dom'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { TextField } from 'final-form-material-ui'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import { ROOT } from '../../../urls'
import PropTypes from 'prop-types'
import { INVALID_PASSWORD_LENGTH, RESET_PASSWORD_SUCCESS } from '../../../messages'
import * as Sentry from '@sentry/browser'
import { PASSWORD } from '../../../fields'
import { Field, Form } from 'react-final-form'

const WEAK_PASSWORD = 'Password is too weak.'

const required = value => (value ? undefined : 'Required')
const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)
const minPasswordLength = value => {
  const res = value.length < 6 ? INVALID_PASSWORD_LENGTH(6) : undefined
  console.log('res', value, res)
  return res
}

const STATE_CLOSE = 'close'
const STATE_ERROR_MESSAGE = 'errorMessage'
const STATE_IS_SUBMITTING = 'isSubmitting'
const STATE_IS_SUCCESS = 'isSuccess'

class ResetPasswordPage extends Component {
  constructor (props) {
    super(props)
    console.log('ResetPassword constructor called')
    this.state = {
      [STATE_CLOSE]: false,
      [STATE_ERROR_MESSAGE]: '',
      [STATE_IS_SUBMITTING]: false,
      [STATE_IS_SUCCESS]: false
    }
  }

  handleError (error) {
    window.scrollTo(0, 0)
    const { code, message } = error
    if (code === 'auth/weak-password') {
      this.setState({
        [STATE_ERROR_MESSAGE]: WEAK_PASSWORD
      })
    } else {
      Sentry.captureException(error)
      console.error('ResetPasswordPage',
        'code:', code,
        'message:', message)
      this.setState({
        [STATE_ERROR_MESSAGE]: message
      })
    }
  }

  async handleSubmit (values) {
    const newPassword = values[PASSWORD]

    const oobCode = this.props.location.state.query.oobCode

    this.setState({
      [STATE_ERROR_MESSAGE]: '',
      [STATE_IS_SUBMITTING]: true
    })
    try {
      await firebase.auth().confirmPasswordReset(oobCode, newPassword)
      this.setState({
        [STATE_IS_SUCCESS]: true
      })
    } catch (error) {
      this.handleError(error)
    } finally {
      this.setState({
        [STATE_IS_SUBMITTING]: false
      })
    }
  }

  render () {
    const close = this.state[STATE_CLOSE]
    const errorMessage = this.state[STATE_ERROR_MESSAGE]
    const isSubmitting = this.state[STATE_IS_SUBMITTING]
    const isSuccess = this.state[STATE_IS_SUCCESS]

    if (close) {
      console.log('redirecting to root', close)
      return <Redirect to={ROOT} />
    }

    return (
      <Form
        onSubmit={(values) => this.handleSubmit(values)}
        render={({ handleSubmit, form }) => (
          <form onSubmit={handleSubmit}>

            <Dialog
              open
              fullWidth
              maxWidth='xs'
              onClose={() => this.setState({ [STATE_CLOSE]: true })}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle>
                Reset Password
              </DialogTitle>

              <DialogContent>
                {
                  errorMessage &&
                  <DialogContentText>
                    <div className='text-danger text-center'>
                      {errorMessage}
                    </div>
                  </DialogContentText>
                }
                {
                  isSuccess
                    ?
                    <DialogContentText>
                      <div className='text-success text-center'>
                        {RESET_PASSWORD_SUCCESS}
                      </div>
                    </DialogContentText>
                    :
                    <Field
                      label='New password'
                      type='password'
                      margin='normal'
                      fullWidth
                      name={PASSWORD}
                      component={TextField}
                      validate={composeValidators(required, minPasswordLength)}
                    />
                }
              </DialogContent>
              {
                isSuccess
                  ?
                  <DialogActions>
                    <Button onClick={() => this.setState({ [STATE_CLOSE]: true })} color="primary">
                      Close
                    </Button>
                  </DialogActions>
                  :
                  <DialogActions>
                    <Button onClick={() => this.setState({ [STATE_CLOSE]: true })}>
                      Cancel
                    </Button>
                    <Button type="button" color="primary"
                            onClick={() => form.submit()}
                            disabled={isSubmitting}>
                      Set new password
                    </Button>
                  </DialogActions>
              }
            </Dialog>
          </form>
        )}
      />
    )
  }
}

ResetPasswordPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      info: PropTypes.shape({
        data: PropTypes.shape({
          email: PropTypes.string.isRequired
        }).isRequired
      }).isRequired,
      query: PropTypes.shape({
        oobCode: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }).isRequired
}

export default withRouter(ResetPasswordPage)
