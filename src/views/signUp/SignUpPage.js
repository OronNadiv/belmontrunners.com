import React, { Component } from 'react'

import './Signup.scss'
import SignUpStepper from './SignUpStepper'

class SignUp extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    return (
      <div className='container-fluid mx-3'>
        <div className='d-flex justify-content-center'>
          <SignUpStepper />
        </div>
      </div>
    )
  }
}

export default SignUp
