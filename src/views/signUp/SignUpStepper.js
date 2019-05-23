import React, { Component } from 'react'

import './Signup.scss'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

import SignUpStepAuth from './SignUpStepAuth'
import SignUpStepPayment from './SignUpStepPayment'
import SignUpStepUserDetails from './SignUpStepUserDetails'
import { Redirect } from 'react-router-dom'
import { JOIN, ROOT } from '../urls'

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
    console.log('handleNext called')
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
    const { activeStep } = this.state

    return (
      <div>
        <Stepper alternativeLabel className="justify-content-center" activeStep={activeStep}>
          <Step key={0}>
            <StepLabel>
              Account
            </StepLabel>
          </Step>

          <Step key={1}>
            <StepLabel>
              User Details
            </StepLabel>
          </Step>

          <Step key={2}>
            <StepLabel>
              Membership
            </StepLabel>
          </Step>

        </Stepper>
        {
          this.getStep()
        }
      </div>
    )
  }

  getStep () {
    const { activeStep } = this.state
    switch (activeStep) {
      case 0:
        return <SignUpStepAuth onNextClicked={this.handleNext} />
      case 1:
        return <SignUpStepUserDetails onNextClicked={this.handleNext} />
      case 2:
        return <SignUpStepPayment isLast onNextClicked={this.handleNext} />
      case 3:
        return <Redirect
          to={{
            pathname: ROOT,
            state: { from: JOIN }
          }}
        />
      default:
        throw new Error("Unknown active step.  Active step: " + activeStep)
    }
  }
}

export default SignUpStepper
