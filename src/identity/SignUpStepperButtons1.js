import Button from '@material-ui/core/Button'
import React from 'react'

class SignUpStepperButtons extends React.Component {
  render () {
    const { isFirst, isLast, onBackClicked, onNextClicked } = this.props
    return (
      <div>
        <Button
          disabled={isFirst}
          onClick={onBackClicked}
        >
          Back
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onNextClicked}
        >
          {isLast ? 'Finish' : 'Next'}
        </Button>
      </div>
    )
  }
}

export default SignUpStepperButtons
