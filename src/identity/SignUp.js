import React, { Component } from 'react'

import './Signup.scss'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { signIn as signInAction, signUp as signUpAction } from './identityActions'
import { connect } from 'react-redux'

import SignUpStep1 from './SignUpStepAuth'
import SignUpStepper from './SignUpStepper'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'

class SignUpView extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fullName: '',
      email: '',
      password: '',
      invalidFullNameMessage: '',
      invalidEmailMessage: '',
      invalidPasswordMessage: '',
      generalErrorMessage: ''
    }
    this.steps = [SignUpStep1]
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
      <Dialog
        open
        // fullWidth
        maxWidth='sm'
        onClose={() => this.setState({ close: true })}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>
          Join Us
        </DialogTitle>

        <DialogContent>
          <SignUpStepper />
        </DialogContent>
      </Dialog>
    )
  }
}

SignUpView.propTypes = {
  signUp: PropTypes.func.isRequired,
  signInWithProvider: PropTypes.func.isRequired,
  signUpError: PropTypes.object
}

const mapDispatchToProps = {
  signUp: signUpAction,
  signIn: signInAction
}

const mapStateToProps = (state) => {
  return {
    signUpError: state.identity.get('signUpError'),
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignUpView)
