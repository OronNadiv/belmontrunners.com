import React, { Component } from 'react'

import './Signup.scss'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

import SignUpStepAuth from './SignUpStepAuth'
import SignUpStepPayment from './SignUpStepPayment'
import SignUpStepUserDetails from './SignUpStepUserDetails'
import { Redirect } from 'react-router-dom'
import { ROOT } from '../urls'
import PropTypes from 'prop-types'

export const STEP_AUTHENTICATION = 'STEP_AUTHENTICATION'
export const STEP_USER_DETAILS = 'STEP_USER_DETAILS'
export const STEP_MEMBERSHIP = 'STEP_MEMBERSHIP'

class SignUpStepper extends Component {
  constructor (props) {
    super(props)
    const steps = this.props.steps || [STEP_AUTHENTICATION, STEP_USER_DETAILS, STEP_MEMBERSHIP]

    this.state = {}
    this.state = {
      activeStep: 0,
      steps
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

  getStepsHeaders () {
    const { steps } = this.state
    if (steps.length < 2) {
      return null
    }
    return steps.map((step) => {
      switch (step) {
        case STEP_AUTHENTICATION:
          return <Step key={0}>
            <StepLabel>
              Account
            </StepLabel>
          </Step>

        case STEP_USER_DETAILS:
          return <Step key={1}>
            <StepLabel>
              User Details
            </StepLabel>
          </Step>

        case STEP_MEMBERSHIP:
          return <Step key={2}>
            <StepLabel>
              Membership
            </StepLabel>
          </Step>
        default:
          throw new Error("Unknown step.  step: " + step)
      }
    })
  }

  render () {
    const { activeStep } = this.state

    return (
      <div>
        <Stepper alternativeLabel className="justify-content-center" activeStep={activeStep}>
          {this.getStepsHeaders()}
        </Stepper>
        {
          this.getStep()
        }
      </div>
    )
  }

  getStep () {
    const { activeStep, steps } = this.state
    switch (steps[activeStep]) {
      case STEP_AUTHENTICATION:
        return <SignUpStepAuth isLast={activeStep === steps.length - 1} onNextClicked={this.handleNext} />
      case STEP_USER_DETAILS:
        return <SignUpStepUserDetails isLast={activeStep === steps.length - 1} onNextClicked={this.handleNext} />
      case STEP_MEMBERSHIP:
        return <SignUpStepPayment isLast={activeStep === steps.length - 1} onNextClicked={this.handleNext} />
      default:
        return <Redirect to={ROOT} />

    }
  }
}

SignUpStepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string)
}

export default SignUpStepper
