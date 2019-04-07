import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import PropTypes from 'prop-types'
import isEmail from 'isemail'
import './Signin.scss'
import { Link, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { signIn as signInAction } from './identityActions'
import TextField from '@material-ui/core/TextField'
import { INVALID_EMAIL, INVALID_EMAIL_OR_PASSWORD, INVALID_PASSWORD_LENGTH, MISSING_PASSWORD } from './messages'

class SignInView extends Component {

  constructor (props) {
    super(props)
    this.state = {
      invalidEmailMessage: '',
      invalidPasswordMessage: '',
      generalErrorMessage: ''
    }
  }

  handleSignIn () {
    this.setState({ generalErrorMessage: '' })

    const { email, password } = this.state

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
    this.props.signIn(email, password)
  }

  componentDidUpdate (prevProps) {
    if (this.props.signInError && prevProps.signInError !== this.props.signInError) {
      const { code, message } = this.props.signInError
      switch (code) {
        case 'auth/invalid-email':
          this.setState({ invalidEmailMessage: INVALID_EMAIL })
          break
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          this.setState({ generalErrorMessage: INVALID_EMAIL_OR_PASSWORD })
          break
        default:
          console.log('signInError', 'code:', code, 'message:', message)
          this.setState({ generalErrorMessage: message })
      }
    }
  }

  render () {
    console.log('Signin render called')

    if (this.props.currentUser || this.state.close) {
      return <Redirect
        to={{
          pathname: "/",
          state: { from: '/signin' }
        }}
      />
    }

    return (
      <Modal show className="modal fade" role="dialog" onHide={() => this.setState({ close: true })}>
        <Modal.Dialog className="modal-dialog form-elegant" role="document">
          <Modal.Header className="modal-header text-center">
            <h3 className="modal-title w-100 dark-grey-text font-weight-bold my-3" id="myModalLabel">
              <strong>
                Sign In
              </strong>
            </h3>
            <Link to="/">
              <Button type="button" className="close" data-dismiss="modal" aria-label="Close"
                      onClick={() => this.setState({ close: true })}>
                &times;
              </Button>
            </Link>
          </Modal.Header>

          <Modal.Body className="modal-body mx-4">

            <div className="mb-3">
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

            <div className="mb-3">
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
                onKeyPress={(ev) => {
                  console.log(`Pressed keyCode ${ev.key}`)
                  if (ev.key === 'Enter') {
                    // Do code here
                    ev.preventDefault()
                    this.handleSignIn()
                  }
                }}
                error={!!this.state.invalidPasswordMessage}
                helperText={this.state.invalidPasswordMessage}
              />
            </div>

            <div className="text-center mb-3">
              <Button type="button" className="btn blue-gradient btn-block btn-rounded z-depth-1a"
                      onClick={() => this.handleSignIn()}>Sign in</Button>
            </div>
            <div className="text-danger text-center">{this.state.generalErrorMessage}</div>
          </Modal.Body>
          <Modal.Footer className="modal-footer mx-5 pt-3 mb-1">
            <p className="font-small grey-text d-flex justify-content-end">Not a member?&nbsp;
              <Link to="/signup">Sign Up</Link>
            </p>
            <p className="font-small blue-text d-flex justify-content-end">
              Forgot&nbsp;<Link className="blue-text ml-1" to="/forgotpassword">Password?</Link>
            </p>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>
    )
  }
}

SignInView.propTypes = {
  signIn: PropTypes.func.isRequired,
  signInError: PropTypes.object
}

const mapDispatchToProps = {
  signIn: signInAction
}

const mapStateToProps = (state) => {
  return {
    signInError: state.identity.get('signInError'),
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInView)
