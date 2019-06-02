import 'firebase/firestore'
import firebase from 'firebase'
import React, { Component } from 'react'
import { CardElement, injectStripe } from 'react-stripe-elements'
import rp from 'request-promise'
import SignUpStepperButton from './SignUpStepperButton'
import './Stripe.scss'
import PropTypes from 'prop-types'
import LoggedInState from '../../components/LoggedInState'
import moment from 'moment'
import Promise from 'bluebird'
import { Redirect } from 'react-router-dom'
import { ROOT } from '../../urls'
import { connect } from 'react-redux'
import { DATE_OF_BIRTH, MEMBERSHIP_EXPIRES_AT } from '../../fields'
import { updateUserData as updateUserDataAction } from '../../reducers/currentUser'

const MEMBERSHIP_FEE_ADULT = 25
const MEMBERSHIP_FEE_KID = 15
const NEED_TO_PAY = 'needToPay'
const CONFIRMATION_NUMBER = 'CONFIRMATION_NUMBER'
const TOTAL_AMOUNT_IN_DOLLARS = 'TOTAL_AMOUNT_IN_DOLLARS'

// TODO: allow the user to change their personal information.
class SignUpStepPayment extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    window.scrollTo(0, 0)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.userDataUpdating && !this.props.userDataUpdating) {
      if (!this.props.userDataUpdateError) {
        this.setMessage('',
          <div>
            <div>Complete successfully</div>
            <div>Confirmation: {this.state[CONFIRMATION_NUMBER].substring(3)}</div>
          </div>)
      } else {
        // todo: show message if user data update failed.
      }
    }
  }

  setMessage (errorMessage = '', successMessage = '') {
    this.setState({
      successMessage,
      errorMessage,
      success: !!successMessage
    })
  }

  handleSubmitPayment () {
    const { currentUser: { displayName, uid, email }, updateUserData } = this.props

    this.setState({
      submitting: true
    })

    return this.props.stripe
      .createToken({ type: 'card' })
      .then(stripeResponse => {
        console.log('stripeResponse:', JSON.stringify(stripeResponse, 0, 2))
        if (stripeResponse.error) {
          this.setMessage(stripeResponse.error.message)
          throw stripeResponse.error
        }
        const body = {
          ...stripeResponse,
          description: `Annual membership for Belmont Runners. name: ${displayName} email: ${email}  uid: ${uid}`,
          amountInCents: this.props[TOTAL_AMOUNT_IN_DOLLARS] * 100
        }
        const options = {
          method: 'POST',
          uri: 'https://c0belq1th0.execute-api.us-west-1.amazonaws.com/default/stripe',
          body,
          json: true
        }
        return rp(options)
          .then(chargeResponse => {
            const transactionsRef = firebase.firestore().doc(
              `users/${uid}/transactions/${moment().utc().format()}`)
            const transactionsLastRef = firebase.firestore().doc(
              `users/${uid}/transactions/latest`)

            let newMembershipExpiresAt
            const yearFromNow = moment().add(1, 'year')
            if (this.props[MEMBERSHIP_EXPIRES_AT]) {
              const membershipExpiresAtPlusOneYear = moment(this.props[MEMBERSHIP_EXPIRES_AT]).add(1, 'year')
              if (membershipExpiresAtPlusOneYear.isBefore(yearFromNow)) {
                newMembershipExpiresAt = yearFromNow
              } else {
                newMembershipExpiresAt = membershipExpiresAtPlusOneYear
              }
            } else {
              newMembershipExpiresAt = yearFromNow
            }
            this.setState({
              [CONFIRMATION_NUMBER]: chargeResponse.id
            })

            let values = {
              // stripeResponse: JSON.stringify(stripeResponse),
              stripeResponse: stripeResponse,
              paidAt: moment().utc().format(),
              paidAmount: this.props[TOTAL_AMOUNT_IN_DOLLARS],
              confirmationNumber: chargeResponse.id
            }
            return Promise.all([
              transactionsRef.set(values),
              transactionsLastRef.set(values)
            ])
              .then(() => {
                updateUserData({
                  [MEMBERSHIP_EXPIRES_AT]: newMembershipExpiresAt.utc().format()
                }, { merge: true })
              })
          })
          .catch(stripeResponse => {
            if (stripeResponse.error) {
              this.setMessage(stripeResponse.error.message)
              return
            }
            // todo: handle case where it's not stripe error.
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

  getBody () {
    const { success, errorMessage, successMessage } = this.state
    if (!success) {
      if (this.props[NEED_TO_PAY] === false) {
        return (
          <div>
            <div className='text-success text-center mt-4'>Your membership expires
              on {moment(this.props[MEMBERSHIP_EXPIRES_AT]).format("MMMM Do YYYY")}</div>
            <div className='text-success text-center'>You can renew it
              after {moment(this.props[MEMBERSHIP_EXPIRES_AT]).subtract(1, 'month').format("MMMM Do YYYY")}
            </div>
          </div>
        )
      } else if (this.props[NEED_TO_PAY] === true) {
        // need to pay.
        return (<div>
            <h6 className='mt-3'>Membership fees</h6>
            &bull; Adult (18 and over): $25<br />
            &bull; Kids: $15.<br />

            <h4 className='my-4'>Total amount: ${this.props[TOTAL_AMOUNT_IN_DOLLARS] || ''}</h4>
            {this.props[MEMBERSHIP_EXPIRES_AT] &&
            <div className='text-warning mb-2 text-center'>
              {
                moment(this.props[MEMBERSHIP_EXPIRES_AT]).isAfter(moment()) ?
                  `Membership will expire on ${moment(this.props[MEMBERSHIP_EXPIRES_AT]).format("MMMM Do YYYY")}` :
                  `Membership expired on ${moment(this.props[MEMBERSHIP_EXPIRES_AT]).format("MMMM Do YYYY")}`
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
    } else if (this.state.success) {
      return <div className='text-success text-center mt-4'>{successMessage}</div>
    }
  }

  render () {
    console.log('SignUpStepPayment.render() called.')
    const { submitting, success, close } = this.state
    const { isLast, userDataUpdating } = this.props

    if (close) {
      return <Redirect to={ROOT} />
    }

    return (
      <div className="justify-content-center">
        <h5 className='mt-5'>
          Benefits to being part of Belmont Runners
        </h5>
        &bull; Each member receives the Belmont Runners official&nbsp;<a
        target='_blank' rel='noopener noreferrer'
        href={`https://www.belmontrunners.com/documents/running-shirt.png`}>Running Shirt</a>
        <br />
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
            this.getBody()
          }
        </div>
        {
          (this.props[NEED_TO_PAY] === false || this.props[NEED_TO_PAY] === true) &&
          <SignUpStepperButton
            handlePrimaryClicked={() => success || this.props[NEED_TO_PAY] === false ? this.props.onNextClicked() : this.handleSubmitPayment()}
            primaryText={success || this.props[NEED_TO_PAY] === false ?
              (isLast ? 'Finish' : 'Next')
              : "Pay Now"}
            primaryDisabled={!!submitting || userDataUpdating}
            showPrimary

            handleSecondaryClicked={() => this.setState({ close: true })}
            secondaryText={'Finish later'}
            secondaryDisabled={!!submitting || userDataUpdating}
            showSecondary={this.props[NEED_TO_PAY] === true && !success}
          />
        }
      </div>
    )
  }

}

SignUpStepPayment.propTypes = {
  // from redux
  currentUser: PropTypes.object,
  userDataUpdating: PropTypes.bool.isRequired,
  userDataUpdateError: PropTypes.object,
  updateUserData: PropTypes.func.isRequired,
  [NEED_TO_PAY]: PropTypes.bool,
  [MEMBERSHIP_EXPIRES_AT]: PropTypes.string,
  totalAmount: PropTypes.number.isRequired,

  // from HOC
  stripe: PropTypes.shape({
    createToken: PropTypes.func.isRequired
  }).isRequired,

  // from parent
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired
}

const mapDispatchToProps = {
  updateUserData: updateUserDataAction
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, currentUser, userData, userDataUpdating, userDataUpdateError } }) => {

  let membershipExpiresAt = null
  let needToPay
  let totalAmount = 0

  if (isCurrentUserLoaded && currentUser) {
    const dateOfBirth = moment(userData[DATE_OF_BIRTH])
    const isAdult = moment().diff(dateOfBirth, 'years') >= 18
    if (isAdult) {
      totalAmount = MEMBERSHIP_FEE_ADULT
    } else {
      totalAmount = MEMBERSHIP_FEE_KID
    }

    membershipExpiresAt = userData[MEMBERSHIP_EXPIRES_AT]
    if (membershipExpiresAt && moment(membershipExpiresAt).isAfter(moment().add(1, 'month'))) {
      needToPay = false
    } else {
      needToPay = true
    }
  }


  return {
    currentUser,
    userDataUpdating,
    userDataUpdateError,

    [NEED_TO_PAY]: needToPay,
    [MEMBERSHIP_EXPIRES_AT]: membershipExpiresAt,
    [TOTAL_AMOUNT_IN_DOLLARS]: totalAmount
  }
}

export default injectStripe(LoggedInState({
  name: 'SignUpStepPayment',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps, mapDispatchToProps)(SignUpStepPayment)))
