import React, { useState } from 'react'

import { Stepper, Step, StepLabel } from '@material-ui/core'

import SignUpStepAuth from './SignUpStepAuth'
import SignUpStepPayment from './SignUpStepPayment'
import SignUpStepUserProfile from './SignUpStepUserProfile'
import { Redirect } from 'react-router-dom'
import { ROOT } from '../../urls'
import * as PropTypes from 'prop-types'
import SignUpStepFreeMembership from "./SignUpStepFreeMembership";

export const STEP_AUTHENTICATION = 'STEP_AUTHENTICATION'
export const STEP_USER_DETAILS = 'STEP_USER_DETAILS'
export const STEP_MEMBERSHIP = 'STEP_MEMBERSHIP'
export const STEP_FREE_MEMBERSHIP = 'STEP_FREE_MEMBERSHIP'

interface Props {
  steps: string[]
}

function SignUpStepper({ steps }: Props) {
  const [activeStep, setActiveStep] = useState(0)

  const handleNext = () => {
    setActiveStep(activeStep + 1)
  }

  const getStepsHeaders = () => {
    return steps.map(step => {
      switch (step) {
        case STEP_AUTHENTICATION:
          return (
            <Step key={0}>
              <StepLabel>Account</StepLabel>
            </Step>
          )

        case STEP_USER_DETAILS:
          return (
            <Step key={1}>
              <StepLabel>Profile</StepLabel>
            </Step>
          )

        case STEP_MEMBERSHIP:
          return (
            <Step key={2}>
              <StepLabel>Membership</StepLabel>
            </Step>
          )

        case STEP_FREE_MEMBERSHIP:
          return (
            <Step key={2}>
              <StepLabel>Membership (FREE until summer 2021)</StepLabel>
            </Step>
          )
        default:
          throw new Error('Unknown step.  step: ' + step)
      }
    })
  }

  const getStep = () => {
    switch (steps[activeStep]) {
      case STEP_AUTHENTICATION:
        return (
          <SignUpStepAuth
            isLast={activeStep === steps.length - 1}
            onNextClicked={handleNext}
          />
        )
      case STEP_USER_DETAILS:
        return (
          <SignUpStepUserProfile
            isLast={activeStep === steps.length - 1}
            onNextClicked={handleNext}
          />
        )
      case STEP_MEMBERSHIP:
        return (
          <SignUpStepPayment
            isLast={activeStep === steps.length - 1}
            onNextClicked={handleNext}
          />
        )
      case STEP_FREE_MEMBERSHIP:
        return (
          <SignUpStepFreeMembership
            isLast={activeStep === steps.length - 1}
            onNextClicked={handleNext}
          />
        )
      default:
        return <Redirect to={ROOT} />
    }
  }

  return (
    <>
      {steps.length > 1 && (
        <Stepper alternativeLabel activeStep={activeStep}>
          {getStepsHeaders()}
        </Stepper>
      )}
      {getStep()}
    </>
  )
}

SignUpStepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default SignUpStepper
