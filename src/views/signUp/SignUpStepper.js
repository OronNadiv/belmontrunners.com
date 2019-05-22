import React, { Component } from 'react'

import './Signup.scss'
import { Redirect } from 'react-router-dom'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

import SignUpStepAuth from './SignUpStepAuth'
import SignUpStepPayment from './SignUpStepPayment'
import SignUpStepUserDetails from './SignUpStepUserDetails'

class SignUpStepper extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeStep: 0
    }
    this.handleNext = this.handleNext.bind(this)
    this.handleBack = this.handleBack.bind(this)
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
    const { activeStep, close } = this.state
    if (close) {
      return <Redirect
        to={{
          pathname: "/",
          state: { from: '/join' }
        }}
      />
    }

    return (
      <div>
        <Stepper alternativeLabel className="justify-content-center" activeStep={activeStep}>
          <Step key={0}>
            <StepLabel>
              User Details
            </StepLabel>
          </Step>

          <Step key={2}>
            <StepLabel>
              Membership
            </StepLabel>
          </Step>

          <Step key={1}>
            <StepLabel>
              Account
            </StepLabel>
          </Step>
        </Stepper>
        {

          activeStep === 0 ?
            <SignUpStepUserDetails isFirst onNextClicked={this.handleNext} /> :
            activeStep === 1 ?
              <SignUpStepPayment isFirst onNextClicked={this.handleNext} /> :
              <SignUpStepAuth onNextClicked={this.handleNext} />
        }
      </div>
    )
  }
}

export default SignUpStepper
