import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField/index'
import Expiration from './Expiration'
import CreditCard from './CreditCard'
import CVC from './CVC'
import { injectStripe } from 'react-stripe-elements'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { submitPayment as submitPaymentAction } from './paymentActions'
import SignUpStepperButtons from '../identity/SignUpStepperButtons1'

class View extends Component {
  constructor (props) {
    super(props)
    this.initialValues = {
      name: "",
      cc: '    -    -    -    ',
      cvc: '    ',
      zip: "",
      expiration: '  /  '
    }
    this.state = {
      ...this.initialValues
    }
  }

  submitPayment () {
    console.log('submitPayment')
    const { stripe, name, cc, expiration, zip } = this.state
    this.props.submitPayment({ stripe, name, cc, expiration, zip })
  }

  handleChange = name => event => {
    console.log('handleChange', name, event.target.value)
    this.setState({
      [name]: name = 'name' ? event.target.value : event.target.value.replace(/\s/g, '')
    })
  }

  render () {
    const { name, cc, cvc, zip, expiration } = this.state

    return (
      <div className="container-fluid" style={{ maxWidth: 400 }}>
        <div className="row justify-content-center">
          <div className="checkout">
            <div className="row justify-content-start">
              <TextField
                label="Name on card"
                type='name'
                value={name}
                fullWidth
                margin="normal"
                onChange={this.handleChange('name')}
                error={!!this.state.invalidNameMessage}
                helperText={this.state.invalidNameMessage}
              />
            </div>
            <div className="row justify-content-start">
              <CreditCard
                onChange={this.handleChange('cc')}
                value={cc}
              />
            </div>
            <div className="row justify-content-between">
              <Expiration
                onChange={this.handleChange('expiration')}
                value={expiration}
              />
              <CVC
                onChange={this.handleChange('cvc')}
                value={cvc}
              />
            </div>
          </div>
        </div>
        <SignUpStepperButtons
          isFirst={this.props.isFirst}
          isLast={this.props.isLast}
          onBackClicked={() => this.setState(this.initialValues)}
          onNextClicked={() => this.submitPayment()}
        />
      </div>
    )
  }
}

View.propTypes = {
  submitPayment: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  submitPayment: submitPaymentAction
}

const mapStateToProps = (state) => {
  return {}
}

export default injectStripe(connect(mapStateToProps, mapDispatchToProps)(View))
