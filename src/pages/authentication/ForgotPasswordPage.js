import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import isEmailComponent from 'isemail'
import { INVALID_EMAIL, USER_NOT_FOUND_EXPLICIT } from '../../messages'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'
import { TextField } from 'final-form-material-ui'
import { ROOT } from '../../urls'
import LoggedInState from '../../components/HOC/LoggedInState'
import { Field, Form } from 'react-final-form'
import { EMAIL } from '../../fields'
import * as Sentry from '@sentry/browser'

const required = value => (value ? undefined : 'Required')
const isEmail = value => (!value || !isEmailComponent.validate(value) ? INVALID_EMAIL : undefined)
const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)

const STATE_CLOSE = 'close'
const STATE_ERROR_MESSAGE = 'errorMessage'
const STATE_IS_SUBMITTING = 'isSubmitting'
const STATE_IS_SUCCESS = 'isSuccess'

class ForgotPasswordPage extends Component {
  constructor (props) {
    super(props)
    console.log('ForgotPasswordPage ctor called')
    this.state = {
      [STATE_CLOSE]: false,
      [STATE_ERROR_MESSAGE]: '',
      [STATE_IS_SUBMITTING]: false,
      [STATE_IS_SUCCESS]: false
    }
  }

  handleError (error) {
    const { code, message } = error
    switch (code) {
      case 'auth/user-not-found':
        this.setState({ [STATE_ERROR_MESSAGE]: USER_NOT_FOUND_EXPLICIT })
        break
      case 'auth/invalid-email':
        this.setState({ [STATE_ERROR_MESSAGE]: INVALID_EMAIL })
        break
      default:
        Sentry.captureException(error)
        console.error('forgotPasswordPage',
          'code:', code,
          'message:', message)
        this.setState({ [STATE_ERROR_MESSAGE]: message })
    }
  }

  async handleSubmit (values) {
    const email = values[EMAIL]

    this.setState({
      [STATE_ERROR_MESSAGE]: '',
      [STATE_IS_SUBMITTING]: true
    })
    try {
      await firebase.auth().sendPasswordResetEmail(email)
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
          <form onSubmit={handleSubmit} method='POST'>

            <Dialog
              open
              fullWidth
              maxWidth='xs'
              onClose={() => this.setState({ [STATE_CLOSE]: true })}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle>
                Forgot Password
              </DialogTitle>

              <DialogContent>
                {
                  errorMessage &&
                  <div className="mt-2 text-danger text-center">{errorMessage}</div>
                }
                {
                  isSuccess
                    ?
                    <DialogContentText>
                      <div className='text-success text-center'>
                        We have sent you an e-mail. Please contact us if you do not receive it within a few minutes.
                      </div>
                    </DialogContentText>
                    :
                    <Field
                      label='Your email'
                      margin='normal'
                      type='email'
                      fullWidth
                      name={EMAIL}
                      component={TextField}
                      validate={composeValidators(required, isEmail)}
                    />
                }
              </DialogContent>
              {
                isSuccess
                  ?
                  <DialogActions>
                    <Button
                      onClick={() => this.setState({ [STATE_CLOSE]: true })}
                      color="primary">
                      Close
                    </Button>
                  </DialogActions>
                  :
                  <DialogActions>
                    <Button
                      onClick={() => this.setState({ [STATE_CLOSE]: true })}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="button" color="primary"
                            onClick={() => form.submit()}
                            disabled={isSubmitting}>
                      Send password reset email
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

export default LoggedInState({ isRequiredToBeLoggedIn: false })(ForgotPasswordPage)
