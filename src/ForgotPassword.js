import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import firebase from 'firebase'
import 'firebase/auth'
import './Signin.css'
import { Link, Redirect } from 'react-router-dom'

class ForgotPassword extends Component {
  constructor () {
    console.log('ForgotPassword contor called')
    super()
    this.state = {}
  }

  sendPasswordReset () {
    var email = this.state.email
    if (!email || email.length < 4) {
      alert('Please enter an email address.')
      return
    }

    firebase.auth().sendPasswordResetEmail(email).then(() => {
      alert('Password Reset Email Sent!')
      this.setState({ close: true })
    }).catch(function (error) {
      var errorCode = error.code
      var errorMessage = error.message
      if (errorCode === 'auth/invalid-email') {
        alert(errorMessage)
      } else if (errorCode === 'auth/user-not-found') {
        alert(errorMessage)
      }
      console.log(error)
    })
  }

  render () {
    console.log('forgotpassword render called')

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

          <Modal.Body className="modal-body mx-4">

            <div className="md-form mb-5">
              <input type="email" className="form-control validate" name='email'
                     onChange={(event) => this.setState({ email: event.target.value })} />
              <label data-error="wrong" data-success="right">Your email</label>
            </div>

            <div className="text-center mb-3">
              <Button type="button" className="btn blue-gradient btn-block btn-rounded z-depth-1a"
                      onClick={() => this.sendPasswordReset()}>Send password reset email</Button>
            </div>
          </Modal.Body>
        </Modal.Dialog>
      </Modal>
    )
  }
}

export default ForgotPassword
