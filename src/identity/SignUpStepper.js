import React, { Component } from 'react'

import './Signup.scss'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { signIn as signInAction, signUp as signUpAction } from './identityActions'
import { connect } from 'react-redux'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

import SignUpStepAuth from './SignUpStepAuth'
import SignUpStepTerms from './SignUpStepTerms'
import StepContent from '@material-ui/core/StepContent'
import Button from '@material-ui/core/Button'

class SignUpStepper extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeStep: 0
    }
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
      <Stepper activeStep={this.state.activeStep} orientation="vertical">
        <Step key={1}>
          <StepLabel>
            {SignUpStepAuth.getLabel()}
          </StepLabel>
          <StepContent>
            <SignUpStepAuth />
            {this.getButtons()}
          </StepContent>
        </Step>

        <Step key={0}>
          <StepLabel>
            {SignUpStepTerms.getLabel()}
          </StepLabel>
          <StepContent>
            <SignUpStepTerms />
            {this.getButtons()}
          </StepContent>
        </Step>


      </Stepper>
    )
  }

  getButtons () {
    return <div>
      <div>
        <Button
          disabled={this.state.activeStep === 0}
          onClick={this.handleBack}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleNext}
        >
          {this.state.activeStep === 2 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  }

  getLabel () {
    switch (this.state.activeStep) {
      case 0:
        return SignUpStepTerms.getLabel()
      case 1:
        return SignUpStepAuth.getLabel()
    }
  }

  getContent () {
    switch (this.state.activeStep) {
      case 0:
        return <SignUpStepTerms />
      case 1:
        return <SignUpStepAuth />
    }
  }
}

SignUpStepper.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(SignUpStepper)
