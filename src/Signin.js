import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import firebase from 'firebase'
import 'firebase/auth'
import './Signin.css'
import { Link, Redirect } from 'react-router-dom'

class Signin extends Component {
  constructor () {
    console.log('Signin contor called')
    super()
    this.state = {}
  }

  sendPasswordReset () {
    var email = this.state.email

    firebase.auth().sendPasswordResetEmail(email).then(function () {
      alert('Password Reset Email Sent!')
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

  handleSignIn () {
    console.log('toggleSignIn')

    var { email, password } = this.state

    if (!email || email.length < 4) {
      alert('Please enter an email address.')
      return
    }
    if (!password || password.length < 4) {
      alert('Please enter a password.')
      return
    }
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch((error) => {
        var errorCode = error.code
        var errorMessage = error.message
        if (errorCode === 'auth/wrong-password') {
          alert('Wrong password.')
        } else {
          alert(errorMessage)
        }
        console.log(error)
        this.setState({ signInDisabled: false })
      })
  }

  render () {
    console.log('Signin render called')

    if (firebase.auth().currentUser || this.state.close) {
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

            <div className="md-form pb-3">
              <input type="password" className="form-control validate" name='password'
                     onChange={(event) => this.setState({ password: event.target.value })}>
              </input>
              <label data-error="wrong" data-success="right">Your password</label>
              <p className="font-small blue-text d-flex justify-content-end">
                Forgot&nbsp;<Link className="blue-text ml-1" to="/forgotpassword">Password?</Link>
              </p>
            </div>

            <div className="text-center mb-3">
              <Button type="button" className="btn blue-gradient btn-block btn-rounded z-depth-1a"
                      onClick={() => this.handleSignIn()}>Sign in</Button>
            </div>
          </Modal.Body>
          <Modal.Footer className="modal-footer mx-5 pt-3 mb-1">
            <p className="font-small grey-text d-flex justify-content-end">Not a member?&nbsp;
              <Link to="/signup">Sign Up</Link>
            </p>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>
    )
  }
}

export default Signin
