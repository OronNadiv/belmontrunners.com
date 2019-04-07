import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import './Signup.scss'
import { Link, Redirect } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import PropTypes from 'prop-types'
import { signUp as signUpAction } from './identityActions'
import { connect } from 'react-redux'
import isEmail from 'isemail'
import {
  EMAIL_ADDRESS_ALREADY_TAKEN,
  INVALID_EMAIL,
  INVALID_FIRST_NAME,
  INVALID_LAST_NAME,
  INVALID_PASSWORD_LENGTH,
  MISSING_PASSWORD
} from './messages'

class SignUpView extends Component {
  constructor (props) {
    super(props)
    console.log('Signup contor called')
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      invalidFirstNameMessage: '',
      invalidLastNameMessage: '',
      invalidEmailMessage: '',
      invalidPasswordMessage: '',
      generalErrorMessage: ''
    }
  }

  handleSignUp () {
    this.setState({ generalErrorMessage: '' })
    const { firstName, lastName, email, password } = this.state

    if (!firstName) {
      this.setState({ invalidFirstNameMessage: INVALID_FIRST_NAME })
      return
    }
    if (!lastName) {
      this.setState({ invalidLastNameMessage: INVALID_LAST_NAME })
      return
    }
    if (!email || !isEmail.validate(email)) {
      this.setState({ invalidEmailMessage: INVALID_EMAIL })
      return
    }
    if (!password) {
      this.setState({ invalidPasswordMessage: MISSING_PASSWORD })
      return
    }
    if (password.length < 4) {
      this.setState({ invalidPasswordMessage: INVALID_PASSWORD_LENGTH })
      return
    }
    this.props.signUp(firstName, lastName, email, password)
  }

  componentDidUpdate (prevProps) {
    if (this.props.signUpError && prevProps.signUpError !== this.props.signUpError) {
      const { code, message } = this.props.signUpError
      switch (code) {
        case 'auth/invalid-email':
          this.setState({ invalidEmailMessage: INVALID_EMAIL })
          break
        case 'auth/email-already-in-use':
          this.setState({ invalidEmailMessage: EMAIL_ADDRESS_ALREADY_TAKEN })
        default:
          console.log('signUpError', 'code:', code, 'message:', message)
          this.setState({ generalErrorMessage: message })
      }
    }
  }

  render () {
    console.log('Signup render called')
    if (this.props.currentUser || this.state.close) {
      return <Redirect
        to={{
          pathname: "/",
          state: { from: '/signup' }
        }}
      />
    }

    return (
      <Modal show className="modal fade" role="dialog" onHide={() => this.setState({ close: true })}>
        <Modal.Dialog className="modal-dialog form-elegant" role="document">
          <Modal.Header className="modal-header text-center">
            <h3 className="modal-title w-100 dark-grey-text font-weight-bold my-3" id="myModalLabel">
              <strong>Sign Up</strong>
            </h3>
            <Link to="/">
              <Button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </Button>
            </Link>
          </Modal.Header>

          <Modal.Body className="modal-body mx-4">

            <div className="mb-2">
              <TextField
                label="Your first name"
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true
                }}
                onChange={(event) => {
                  this.setState({
                    invalidFirstNameMessage: '',
                    firstName: event.target.value
                  })
                }}
                error={!!this.state.invalidFirstNameMessage}
                helperText={this.state.invalidFirstNameMessage}
              />
            </div>

            <div className="mb-2">
              <TextField
                label="Your last name"
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true
                }}
                onChange={(event) => {
                  this.setState({
                    invalidLastNameMessage: '',
                    lastName: event.target.value
                  })
                }}
                error={!!this.state.invalidLastNameMessage}
                helperText={this.state.invalidLastNameMessage}
              />
            </div>

            <div className="mb-2">
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

            <div className="pb-3">
              <TextField
                label="Your password"
                fullWidth
                margin="normal"
                variant="outlined"
                InputLabelProps={{
                  shrink: true
                }}
                type="password"
                onChange={(event) => {

                  this.setState({
                    invalidPasswordMessage: '',
                    password: event.target.value
                  })
                }}
                error={!!this.state.invalidPasswordMessage}
                helperText={this.state.invalidPasswordMessage}
              />
            </div>

            <div className="text-center mb-3">
              <Button type="button" className="btn blue-gradient btn-block btn-rounded z-depth-1a"
                      onClick={() => this.handleSignUp()}>Sign up</Button>
              <div className="text-danger text-center">{this.state.generalErrorMessage}</div>
            </div>

          </Modal.Body>
          <Modal.Footer className="modal-footer mx-5 pt-3 mb-1">
            <p className="font-small grey-text d-flex justify-content-end">
              Already a member?&nbsp;
              <Link to="/signin">Sign in</Link>
            </p>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>
    )
  }
}

SignUpView.propTypes = {
  signUp: PropTypes.func.isRequired,
  signUpError: PropTypes.object
}

const mapDispatchToProps = {
  signUp: signUpAction
}

const mapStateToProps = (state) => {
  return {
    signUpError: state.identity.get('signUpError'),
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUpView)
