import React, { Component } from 'react'
import SignUpStepperButtons from './SignUpStepperButtons1'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'

class SignUpStepTerms extends Component {
  constructor (props) {
    super(props)
    this.state = {
      privacy: false,
      waver: false
    }
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  render () {
    return (
      <div className='container-fluid'>
        <div className='row justify-content-center'>
          <FormGroup column>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.privacy}
                  onChange={this.handleChange('privacy')}
                  value="Privacy Policy"
                />
              }
              label="I accept the privacy policy"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.waver}
                  onChange={this.handleChange('waver')}
                  value="Waver"
                />
              }
              label="I accept the agreement and release of liability"
            />

            <SignUpStepperButtons
              className='mt-2'
              isLast={this.props.isLast}
              onNextClicked={() => this.state.waver && this.state.privacy && this.props.onNextClicked()}
            />
          </FormGroup>
        </div>
      </div>
    )

  }
}

export default SignUpStepTerms
