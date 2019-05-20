import React, { Component } from 'react'
import { CardElement, injectStripe } from 'react-stripe-elements'
import rp from 'request-promise'
import SignUpStepperButton from '../identity/SignUpStepperButton'
import './Stripe.scss'
import PropTypes from 'prop-types'

class View extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  setMessage (errorMessage = '', successMessage = '') {
    this.setState({ successMessage, errorMessage })
  }

  submitPayment () {

    this.setState({ submitting: true })

    return this.props.stripe
      .createToken({ type: 'card' })
      .then(stripeResponse => {
        console.log('stripeResponse:', stripeResponse)
        if (stripeResponse.error) {
          this.setMessage(stripeResponse.error.message)
          throw stripeResponse.error
        }
        const options = {
          method: 'POST',
          uri: 'https://c0belq1th0.execute-api.us-west-1.amazonaws.com/default/stripe',
          body: stripeResponse,
          json: true
        }
        return rp(options)
          .then(chargeResponse => {
            console.log('chargeResponse:', chargeResponse)
            return this.props.onNextClicked()
          }).catch(err => {
            // todo:handle case where charge failed by showing an error message
            console.error("chargeError:", err)
          })
      })
      .catch(err => {
        // todo:handle case where charge failed by showing an error message
        console.error("stripeError:", err)
      })
      .finally(() => {
        this.setState({
          submitting: false
        })
      })
  }

  render () {
    const { errorMessage, submitting, success } = this.state
    const { isLast, onNextClicked } = this.props
    return (
      <div className="justify-content-center">
        <h5 className='mt-1'>
          Benefits to being part of Belmont Runners
        </h5>
        &bull; Training at group runs and walks<br />
        &bull; Free or discounted workshops, clinics, and classes<br />
        &bull; Discounted entry to the Belmont Water Dog Run<br />
        &bull; Discounted entry to other local races<br />
        &bull; Membership with the Road Runners Club of America<br />
        &bull; Liability insurance coverage<br />
        &bull; Discounts at local restaurants<br />
        &bull; Social events with fun, active local runners and walkers<br />
        &bull; 10% discount at <a target='_blank' rel='noopener noreferrer' href='https://arunnersmind.com'>A Runner’s
        Mind</a><br />

        {
          // todo: add amount that will be charged.
        }
        <h5 className='mt-4 mb-1'>
          Credit or debit card
        </h5>
        <div className='mb-3' style={{ minHeight: 64 }}>
          <CardElement className='mt-3' onReady={(el) => el.focus()} />
          {
            errorMessage && <div className='text-danger text-center'>{errorMessage}</div>
          }
        </div>
        <SignUpStepperButton
          isLast={isLast}
          onNextClicked={() => success ? onNextClicked() : this.submitPayment()}
          disabled={submitting && !success}
        />
      </div>
    )
  }
}

View.propTypes = {
  stripe: PropTypes.shape({
    createToken: PropTypes.func.isRequired
  }).isRequired,
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

export default injectStripe(View)
