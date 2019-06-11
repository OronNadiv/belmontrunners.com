import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import { ROOT } from '../../urls'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import { TextField } from 'final-form-material-ui'
import DialogActions from '@material-ui/core/DialogActions'
import { Redirect } from 'react-router-dom'
import LoggedInState from '../../components/LoggedInState'
import Button from '@material-ui/core/Button'
import DialogTitle from '@material-ui/core/DialogTitle'
import isEmailComponent from 'isemail'
import {
  EMAIL_ALREADY_IN_USE,
  EMAILS_DONT_MATCH,
  INVALID_EMAIL,
  INVALID_PASSWORD_LENGTH,
  WRONG_PASSWORD
} from '../../messages'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser'
import { Field, Form } from 'react-final-form'
import { PASSWORD } from '../../fields'

const required = value => (value ? undefined : 'Required')
const isEmail = value => (!value || !isEmailComponent.validate(value) ? INVALID_EMAIL : undefined)
const composeValidators = (...validators) => value => validators.reduce((error, validator) => error || validator(value), undefined)
const minPasswordLength = value => (value.length < 6 ? INVALID_PASSWORD_LENGTH(6) : undefined)

const STATE_CLOSE = 'close'
const STATE_ERROR_MESSAGE = 'errorMessage'
const STATE_IS_SUBMITTING = 'isSubmitting'
const STATE_IS_SUCCESS = 'isSuccess'

const EMAIL1 = 'email1'
const EMAIL2 = 'email2'

class ChangeEmailPage extends Component {

  constructor (props) {
    super(props)
    this.state = {
      [STATE_CLOSE]: false,
      [STATE_ERROR_MESSAGE]: '',
      [STATE_IS_SUBMITTING]: false,
      [STATE_IS_SUCCESS]: false
    }
  }

  async handleSubmit (values) {
    const email1 = values[EMAIL1]
    const email2 = values[EMAIL2]
    const password = values[PASSWORD]
    const { currentUser } = this.props

    if (email1 !== email2) {
      return { [EMAIL2]: EMAILS_DONT_MATCH }
    }

    this.setState({
      [STATE_ERROR_MESSAGE]: '',
      [STATE_IS_SUBMITTING]: true
    })

    const credentials = firebase.auth.EmailAuthProvider.credential(currentUser.email, password)
    try {
      await currentUser.reauthenticateWithCredential(credentials)
      try {
        await currentUser.updateEmail(email1)
        this.setState({
          [STATE_IS_SUCCESS]: true
        })
      } catch (error) {
        Sentry.captureException(error)
        console.error(error)

        const { code, message } = error
        switch (code) {
          case 'auth/invalid-email':
            this.setState({
              [STATE_ERROR_MESSAGE]: INVALID_EMAIL
            })
            return
          case 'auth/email-already-in-use':
            this.setState({
              [STATE_ERROR_MESSAGE]: EMAIL_ALREADY_IN_USE
            })
            return
          default:
            Sentry.captureException(error)
            console.error('ChangeEmailPage.',
              'code:', code,
              'message:', message)
            this.setState({
              [STATE_ERROR_MESSAGE]: message
            })
        }
      }
    } catch (error) {
      const { code, message } = error
      if (code === 'auth/wrong-password') {
        this.setState({
          [STATE_ERROR_MESSAGE]: WRONG_PASSWORD
        })
      } else {
        Sentry.captureException(error)
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

  render () {
    console.log('ChangeEmailPage render called')

    const close = this.state[STATE_CLOSE]
    const errorMessage = this.state[STATE_ERROR_MESSAGE]
    const isSubmitting = this.state[STATE_IS_SUBMITTING]
    const isSuccess = this.state[STATE_IS_SUCCESS]

    if (close) {
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
                Change Email
              </DialogTitle>

              <DialogContent>
                {
                  errorMessage &&
                  <div className="mt-2 text-danger text-center">{errorMessage}</div>
                }

                {
                  isSuccess ?
                    <div className='text-success text-center mt-4'>Email changed successfully.</div> :
                    <div>
                      <Field
                        label='New email'
                        margin='normal'
                        type='email'
                        fullWidth
                        name={EMAIL1}
                        component={TextField}
                        validate={composeValidators(required, isEmail)}
                      />
                      <Field
                        label='Confirm email'
                        margin='normal'
                        type='email'
                        fullWidth
                        name={EMAIL2}
                        component={TextField}
                        validate={composeValidators(required, isEmail)}
                      />

                      <Field
                        label='Current password'
                        type='password'
                        margin='normal'
                        fullWidth
                        name={PASSWORD}
                        component={TextField}
                        validate={composeValidators(required, minPasswordLength)}
                      />
                    </div>
                }
              </DialogContent>

              <DialogActions>
                {
                  isSuccess ?
                    <Button
                      type="button"
                      color="primary"
                      onClick={() => this.setState({ [STATE_CLOSE]: true })}
                    >
                      Close
                    </Button> :
                    <div>
                      <Button
                        type="button"
                        onClick={() => this.setState({ [STATE_CLOSE]: true })}
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
