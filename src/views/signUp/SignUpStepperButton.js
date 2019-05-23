import Button from '@material-ui/core/Button/index'
import React from 'react'
import PropTypes from 'prop-types'

class SignUpStepperButton extends React.Component {
  render () {
    const { isLast, onNextClicked, disabled, nextText } = this.props
    let text = nextText
    if (!text) {
      text = isLast ? 'Finish' : 'Next'
    }
    return (
      <Button
        className='my-5'
        variant="contained"
        color="primary"
        fullWidth
        onClick={onNextClicked}
        disabled={disabled}
      >
        {text}
      </Button>
    )
  }
}

SignUpStepperButton.propTypes = {
  nextText: PropTypes.string,
  disabled: PropTypes.bool.isRequired,
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

export default SignUpStepperButton
