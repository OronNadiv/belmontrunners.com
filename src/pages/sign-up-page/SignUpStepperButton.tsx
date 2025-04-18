import { Button } from '@material-ui/core'
import React from 'react'
import * as PropTypes from 'prop-types'

interface Props {
  primaryText: string
  secondaryText?: string
  primaryDisabled: boolean
  secondaryDisabled?: boolean
  handlePrimaryClicked: () => void
  handleSecondaryClicked?: () => void
  showPrimary: boolean
  showSecondary?: boolean
}

function SignUpStepperButton({
                               primaryText,
                               secondaryText,
                               primaryDisabled,
                               secondaryDisabled,
                               handlePrimaryClicked,
                               handleSecondaryClicked,
                               showPrimary,
                               showSecondary
                             }: Props) {
  return (
    <div className="d-flex justify-content-between my-5">
      {showSecondary && (
        <Button
          className="mr-4"
          variant="contained"
          color="default"
          fullWidth
          onClick={handleSecondaryClicked}
          disabled={secondaryDisabled}
        >
          {secondaryText}
        </Button>
      )}
      {showPrimary && (
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handlePrimaryClicked}
          disabled={primaryDisabled}
        >
          {primaryText}
        </Button>
      )}
    </div>
  )
}

SignUpStepperButton.propTypes = {
  primaryText: PropTypes.string.isRequired,
  primaryDisabled: PropTypes.bool,
  showPrimary: PropTypes.bool.isRequired,
  handlePrimaryClicked: PropTypes.func.isRequired,

  secondaryText: PropTypes.string,
  secondaryDisabled: PropTypes.bool,
  showSecondary: PropTypes.bool,
  handleSecondaryClicked: PropTypes.func
}

export default SignUpStepperButton
