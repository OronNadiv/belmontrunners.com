import Button from '@material-ui/core/Button'
import React from 'react'
import PropTypes from 'prop-types'

class SignUpStepperButton extends React.Component {
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

SignUpStepperButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  onNextClicked: PropTypes.func.isRequired
}

export default SignUpStepperButton
