import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import firebase from 'firebase'
import 'firebase/auth'
import './Signin.scss'
import { Link, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { sendPasswordResetEmail as sendPasswordResetEmailAction } from './identityActions'
import { connect } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import isEmail from 'isemail'
import { INVALID_EMAIL, NO_USER_WITH_GIVEN_EMAIL, RESET_PASSWORD_EMAIL_SENT } from './messages'

class ForgotPasswordView extends Component {
  constructor (props) {
    super(props)
    console.log('ForgotPassword contor called')
    this.state = {
      close: false,
      email: '',
      invalidEmailMessage: '',
      showSuccessMessage: false
    }
  }

  sendPasswordReset () {
    const { email } = this.state
    if (!email || !isEmail.validate(email)) {
      this.setState({ invalidEmailMessage: INVALID_EMAIL })
      return
    }

    this.props.sendPasswordResetEmail(email)
  }

  componentDidUpdate (prevProps) {
    if (this.props.sendPasswordResetEmailError && prevProps.sendPasswordResetEmailError !== this.props.sendPasswordResetEmailError) {
      const { code, message } = this.props.sendPasswordResetEmailError
      switch (code) {
        case 'auth/user-not-found':
          this.setState({ invalidEmailMessage: NO_USER_WITH_GIVEN_EMAIL })
          break
        case 'auth/invalid-email':
          this.setState({ invalidEmailMessage: INVALID_EMAIL })
          break
        default:
          console.log('sendPasswordResetEmailError', 'code:', code, 'message:', message)
          this.setState({ invalidEmailMessage: message })
      }
    } else if (!this.props.isSendingPasswordResetEmail && prevProps.isSendingPasswordResetEmail) {
      this.setState({ showSuccessMessage: true })
    }
  }


  render () {
    if (firebase.auth().currentUser || this.state.close) {
      return <Redirect
        to={{
          pathname: "/",
          state: { from: '/forgotpassword' }
        }}
      />
    }

    return (
      <Modal show className="modal fade" role="dialog" onHide={() => this.setState({ close: true })}>
        <Modal.Dialog className="modal-dialog form-elegant" role="document">
          <Modal.Header className="modal-header text-center">
            <h3 className="modal-title w-100 dark-grey-text font-weight-bold my-3" id="myModalLabel">
              <strong>
                Forgot Password
              </strong>
            </h3>
            <Link to="/">
              <Button type="button" className="close" data-dismiss="modal" aria-label="Close">
                &times;
              </Button>
            </Link>
          </Modal.Header>

          {
            this.state.showSuccessMessage ?
              <Modal.Body className="modal-body mx-4">
                <div className='text-success text-center'>
                  {RESET_PASSWORD_EMAIL_SENT}
                </div>
              </Modal.Body>
              :
              <Modal.Body className="modal-body mx-4">
                <div className="md-form mb-5">
                  <TextField
                    label="Your email"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true
                    }}
                    onChange={(event) => {
                      this.setState({
                        invalidEmailMessage: '',
                        email: event.target.value
                      })
                    }}
                    error={!!this.state.invalidEmailMessage}
                    helperText={this.state.invalidEmailMessage}
                  />
                </div>

                <div className="text-center mb-3">
                  <Button type="button" className="btn blue-gradient btn-block btn-rounded z-depth-1a"
                          onClick={() => this.sendPasswordReset()}
                          disabled={this.props.isSendingPasswordResetEmail}>
                    Send password reset email
                  </Button>
                </div>
              </Modal.Body>
          }
        </Modal.Dialog>
      </Modal>
    )
  }
}

ForgotPasswordView.propTypes = {
  sendPasswordResetEmail: PropTypes.func.isRequired,
  sendPasswordResetEmailError: PropTypes.object,
  currentUser: PropTypes.object
}

const mapDispatchToProps = {
  sendPasswordResetEmail: sendPasswordResetEmailAction
}

const mapStateToProps = (state) => {
  return {
    isSendingPasswordResetEmail: state.identity.get('isSendingPasswordResetEmail'),
    sendPasswordResetEmailError: state.identity.get('sendPasswordResetEmailError'),
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPasswordView)
