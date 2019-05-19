import Button from '@material-ui/core/Button'
import React from 'react'

class SignUpStepperButtons extends React.Component {
  render () {
    const { isLast, onNextClicked, disabled } = this.props
    return (
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={onNextClicked}
        disabled={disabled}
      >
        {isLast ? 'Finish' : 'Next'}
      </Button>
    )
  }
}

export default SignUpStepperButtons
