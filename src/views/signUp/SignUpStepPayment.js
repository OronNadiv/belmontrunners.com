import 'firebase/auth'
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
import { Redirect } from 'react-router-dom'
import { ROOT } from '../urls'
import { connect } from 'react-redux'

const MEMBERSHIP_FEE = 25
const NEED_TO_PAY = 'needToPay'
export const MEMBERSHIP_EXPIRES_AT = 'membershipExpiresAt'

class SignUpStepPayment extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  fetchLastTransactionInformation () {
    const transactionsLastRef = firebase.firestore().doc(
      `users/${firebase.auth().currentUser.uid}/transactions/latest`)

    transactionsLastRef.get()
      .then((values) => {
        let membershipExpiresAt = null
        let needToPay = true
        const documentData = values.data()

        if (documentData) {
          membershipExpiresAt = documentData[MEMBERSHIP_EXPIRES_AT]
          if (membershipExpiresAt && moment(membershipExpiresAt).isAfter(moment().add(1, 'month'))) {
            needToPay = false
          }
        }
        this.setState({
          [NEED_TO_PAY]: needToPay,
          [MEMBERSHIP_EXPIRES_AT]: membershipExpiresAt
        })
      })
      .catch((err) => {
        console.error('could not fetch user data.  err:', err)
        throw err
      })
  }

  componentDidMount () {
    window.scrollTo(0, 0)
    if (firebase.auth().currentUser) {
      this.fetchLastTransactionInformation()
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.lastChanged !== this.props.lastChanged) {
      if (firebase.auth().currentUser) {
        this.fetchLastTransactionInformation()
      }
    }
  }

  setMessage (errorMessage = '', successMessage = '') {
    this.setState({ successMessage, errorMessage })
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
            const userRef = firebase.firestore().doc(
              `users/${firebase.auth().currentUser.uid}`)

            let newMembershipExpiresAt
            const yearFromNow = moment().add(1, 'year')
            if (this.state[MEMBERSHIP_EXPIRES_AT]) {
              const membershipExpiresAtPlusOneYear = moment(this.state[MEMBERSHIP_EXPIRES_AT]).add(1, 'year')
              if (membershipExpiresAtPlusOneYear.isBefore(yearFromNow)) {
                newMembershipExpiresAt = yearFromNow
              } else {
                newMembershipExpiresAt = membershipExpiresAtPlusOneYear
              }
            } else {
              newMembershipExpiresAt = yearFromNow
            }
            let values = {
              // stripeResponse: JSON.stringify(stripeResponse),
              stripeResponse: stripeResponse,
              paidAt: moment().utc().format(),
              paidAmount: MEMBERSHIP_FEE,
              confirmationNumber: chargeResponse.id,
              [MEMBERSHIP_EXPIRES_AT]: newMembershipExpiresAt.utc().format()
            }
            this.setState({
              success: true,
              [NEED_TO_PAY]: false,
              [MEMBERSHIP_EXPIRES_AT]: newMembershipExpiresAt
            })
            return Promise.all([
              transactionsRef.set(values),
              transactionsLastRef.set(values),
              userRef.set({ [MEMBERSHIP_EXPIRES_AT]: newMembershipExpiresAt.utc().format() }, { merge: true })
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
    console.log('SignUpStepPayment.render() called.')
    const { successMessage, errorMessage, submitting, success, close } = this.state
    const { isLast } = this.props

    if (close) {
      return <Redirect to={ROOT} />
    }

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
            this.state[NEED_TO_PAY] === false && !success ?
              <div>
                <div className='text-success text-center mt-4'>Your membership expires
                  on {moment(this.state[MEMBERSHIP_EXPIRES_AT]).format("MMMM Do YYYY")}</div>
                <div className='text-success text-center'>You can renew it
                  after {moment(this.state[MEMBERSHIP_EXPIRES_AT]).subtract(1, 'month').format("MMMM Do YYYY")}
                </div>
              </div> :
              // need to pay.
              this.state[NEED_TO_PAY] === true && !success && (
                <div>
                  <h6 className='my-4'>Total amount: ${MEMBERSHIP_FEE}</h6>
                  {
                    // todo: add a few words on the shirt they'll get - what, how long to get it, etc.
                  }
                  {this.state[MEMBERSHIP_EXPIRES_AT] &&
                  <div className='text-warning'>
                    {
                      moment(this.state[MEMBERSHIP_EXPIRES_AT]).isAfter(moment()) ?
                        `Membership expired on ${moment(this.state[MEMBERSHIP_EXPIRES_AT]).format("MMMM Do YYYY")}` :
                        `Membership will expire on ${moment(this.state[MEMBERSHIP_EXPIRES_AT]).format("MMMM Do YYYY")}`
                    }
                  </div>
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
        {
          (this.state[NEED_TO_PAY] === false || this.state[NEED_TO_PAY] === true) &&
          <SignUpStepperButton
            handlePrimaryClicked={() => success || this.state[NEED_TO_PAY] === false ? this.props.onNextClicked() : this.handleSubmitPayment()}
            primaryText={success || this.state[NEED_TO_PAY] === false ?
              (isLast ? 'Finish' : 'Next')
              : "Pay Now"}
            primaryDisabled={!!submitting}
            showPrimary

            handleSecondaryClicked={() => this.setState({ close: true })}
            secondaryText={'Finish later'}
            secondaryDisabled={!!submitting}
            showSecondary={this.state[NEED_TO_PAY] === true && !success}
          />
        }
      </div>
    )
  }

}

SignUpStepPayment.propTypes = {
  lastChanged: PropTypes.number.isRequired,
  stripe: PropTypes.shape({
    createToken: PropTypes.func.isRequired
  }).isRequired,
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

const mapStateToProps = (state) => {
  return {
    lastChanged: state.currentUser.lastChanged
  }
}

export default injectStripe(LoggedInState({
  name: 'SignUpStepPayment',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps)(SignUpStepPayment)))
