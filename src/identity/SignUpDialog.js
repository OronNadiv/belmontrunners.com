import React, { Component } from 'react'

import './Signup.scss'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { signIn as signInAction, signUp as signUpAction } from './identityActions'
import { connect } from 'react-redux'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

import SignUpStep1 from './SignUpStepAuth'
import StepContent from '@material-ui/core/StepContent'

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

  handleNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1
    }))
  }

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1
    }))
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
        fullWidth
        maxWidth=''
        onClose={() => this.setState({ close: true })}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>
          Join Us
        </DialogTitle>


        <DialogContent>

          <Stepper activeStep={this.state.activeStep} orientation="vertical">
            {
              <Step key={0}>
                <StepLabel>
                  {SignUpStep1.getLabel()}
                </StepLabel>
                <StepContent>
                  <SignUpStep1 />
                </StepContent>
              </Step>
            }
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({ close: true })}>
            Cancel
          </Button>
          <Button type="button" color="primary"
                  onClick={() => this.handleSignUp()}
                  disabled={this.props.isSendingPasswordResetEmail}>
            Sign up
          </Button>
        </DialogActions>
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
