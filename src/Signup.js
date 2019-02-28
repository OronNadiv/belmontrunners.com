import React, { Component } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

import firebase from 'firebase'
import 'firebase/auth'
import './Signup.css'
import { Link, Redirect } from 'react-router-dom'

class Signup extends Component {
  constructor () {
    console.log('Signup contor called')
    super()
    this.state = {
      user: firebase.auth().currentUser
    }
  }

  handleSignUp () {
    console.log('handleSignUp called')
    var { firstname, lastname, email, password } = this.state

    if (!firstname) {
      alert('Please enter a first name.')
      return
    }
    if (!lastname) {
      alert('Please enter a last name.')
      return
    }
    if (!email || email.length < 4) {
      alert('Please enter an email address.')
      return
    }
    if (!password || password.length < 4) {
      alert('Please enter a password.')
      return
    }
    firebase.auth().createUserWithEmailAndPassword(email, password).then(() => {
      console.log('calling updateProfile')
      return firebase.auth().currentUser.updateProfile({
        displayName: `${this.state.firstname} ${this.state.lastname}`
      })
        .then(() => {
          this.setState({ user: firebase.auth().currentUser })
        })
    }).catch(function (error) {
      var errorCode = error.code
      var errorMessage = error.message
      if (errorCode === 'auth/weak-password') {
        alert('The password is too weak.')
      } else {
        alert(errorMessage)
      }
      console.log(error)
    })
  }

  render () {
    console.log('Signup render called')
    if (this.state.user || this.state.close) {
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
              <input type="text" className="form-control validate" name="firstname"
                     onChange={(event) => this.setState({ firstname: event.target.value })} />
              <label data-error="wrong" data-success="right">Your first name</label>
            </div>

            <div className="mb-2">
              <input type="text" className="form-control validate" name="lastname"
                     onChange={(event) => this.setState({ lastname: event.target.value })} />
              <label data-error="wrong" data-success="right">Your last name</label>
            </div>

            <div className="mb-2">
              <input type="email" className="form-control validate" name="email"
                     onChange={(event) => this.setState({ email: event.target.value })} />
              <label data-error="wrong" data-success="right">Your email</label>
            </div>

            <div className="pb-3">
              <input type="password" className="form-control validate" name="password"
                     onChange={(event) => this.setState({ password: event.target.value })}>
              </input>
              <label data-error="wrong" data-success="right">Your password</label>
            </div>

            <div className="text-center mb-3">
              <Button type="button" className="btn blue-gradient btn-block btn-rounded z-depth-1a"
                      onClick={() => this.handleSignUp()}>Sign up</Button>
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

export default Signup
