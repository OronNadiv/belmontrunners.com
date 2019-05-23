import 'firebase/firestore'
import firebase from 'firebase'
import React, { Component } from 'react'
import { CardElement, injectStripe } from 'react-stripe-elements'
import rp from 'request-promise'
import SignUpStepperButton from './SignUpStepperButton'
import './Stripe.scss'
import PropTypes from 'prop-types'
import LoggedInState from '../HOC/LoggedInState'
import moment from 'moment'
import Promise from 'bluebird'

const MEMBERSHIP_FEE = 25

class SignUpStepPayment extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  setMessage (errorMessage = '', successMessage = '') {
    this.setState({ successMessage, errorMessage })
    if (!errorMessage) {
      this.setState({ success: true })
    }
  }

  handleSubmitPayment () {
    this.setState({ submitting: true })

    return this.props.stripe
      .createToken({ type: 'card' })
      .then(stripeResponse => {
        console.log('stripeResponse:', JSON.stringify(stripeResponse, 0, 2))
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
        return Promise
          .resolve(rp(options))
          .tap(chargeResponse => {
            const transactionsRef = firebase.firestore().doc(
              `users/${firebase.auth().currentUser.uid}/transactions/${moment().utc().format()}`)
            const transactionsLastRef = firebase.firestore().doc(
              `users/${firebase.auth().currentUser.uid}/transactions/latest`)
            let values = {
              // stripeResponse: JSON.stringify(stripeResponse),
              stripeResponse: stripeResponse,
              paidAt: moment().utc().format(),
              paidAmount: MEMBERSHIP_FEE,
              confirmationNumber: chargeResponse.id
            }
            return Promise.all([
              transactionsRef.set(values),
              transactionsLastRef.set(values)
            ])
          })
          .then((chargeResponse) => {
            this.setMessage('',
              <div>
                <div>Complete successfully</div>
                <div>Confirmation: {chargeResponse.id.substring(3)}</div>
              </div>)
          })
          .catch(stripeResponse => {
            if (stripeResponse.error) {
              this.setMessage(stripeResponse.error.message)
              throw stripeResponse.error
            }
            throw stripeResponse
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
    const { successMessage, errorMessage, submitting, success } = this.state
    const { isLast } = this.props
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

        <div>
          {
            !success && (
              <div>
                <h6 className='my-4'>Total amount: ${MEMBERSHIP_FEE}</h6>
                {
                  // todo: add a few words on the shirt they'll get - what, how long to get it, etc.
                }
                <h5 className='mb-2'>
                  Credit or debit card
                </h5>
                <CardElement onReady={(el) => el.focus()} />
                {errorMessage && <div className='text-danger text-center'>{errorMessage}</div>}
              </div>
            )
          }
          {successMessage && <div className='text-success text-center mt-4'>{successMessage}</div>}
        </div>
        <SignUpStepperButton
          nextText={success ? '' : "Pay Now"}
          isLast={!!isLast}
          onNextClicked={() => success ? this.props.onNextClicked() : this.handleSubmitPayment()}
          disabled={!!submitting}
        />
      </div>
    )
  }
}

SignUpStepPayment.propTypes = {
  stripe: PropTypes.shape({
    createToken: PropTypes.func.isRequired
  }).isRequired,
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

export default injectStripe(LoggedInState({
  name: 'SignUpStepPayment',
  isRequiredToBeLoggedIn: true
})(SignUpStepPayment))
