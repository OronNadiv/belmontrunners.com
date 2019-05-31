import React, { Component } from 'react'

import './Signup.scss'
import SignUpStepper from './SignUpStepper'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'

class SignUpPage extends Component {
  render () {
    let steps = null
    if (this.props.location.state) {
      steps = this.props.location.state.steps
    }
    return (
      <div className='container-fluid'>
        <div className='d-flex justify-content-center'>
          <SignUpStepper activeStep={this.props.activeStep} steps={steps} />
        </div>
      </div>
    )
  }
}

SignUpPage.propTypes = {
  activeStep: PropTypes.number,
  location: PropTypes.shape({
    state: PropTypes.shape.isRequired
  }).isRequired
}


export default withRouter(SignUpPage)
