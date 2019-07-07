import 'firebase/functions'
import firebase from 'firebase'
import React, { useEffect, useState } from 'react'
import { CardElement, injectStripe } from 'react-stripe-elements'
import SignUpStepperButton from './SignUpStepperButton'
import './Stripe.scss'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/HOC/LoggedInState'
import moment from 'moment'
import Promise from 'bluebird'
import { ROOT } from '../../urls'
import { connect } from 'react-redux'
import { DATE_OF_BIRTH, MEMBERSHIP_EXPIRES_AT } from '../../fields'
import * as Sentry from '@sentry/browser'
import { withRouter } from 'react-router-dom'
import UpdateUserData from '../../components/HOC/UpdateUserData'
import { goToTop } from 'react-scrollable-anchor'
import { compose } from 'underscore'
import { calc, IS_A_MEMBER, IS_MEMBERSHIP_EXPIRES_SOON } from '../../utilities/membershipUtils'

const MEMBERSHIP_FEE_ADULT = 25
const MEMBERSHIP_FEE_KID = 15

function SignUpStepPayment ({
                              currentUser: { displayName, uid, email }, history,
                              updateUserData, stripe, isLast,
                              needToPay, totalAmount, membershipExpiresAt, onNextClicked
                            }) {
  useEffect(() => {
    goToTop()
  }, [])

  const [errorMessage, setErrorMessage] = useState()
  const [isSubmitting, setIsSubmitting] = useState()
  const [confirmationNumber, setConfirmationNumber] = useState()

  const createToken = async () => {
    try {
      const stripeResponse = await stripe.createToken({ type: 'card' })
      console.log('stripeResponse1:', JSON.stringify(stripeResponse, 0, 2))
      if (stripeResponse.error) {
        setErrorMessage(stripeResponse.error.message)
        return
      }
      return stripeResponse
    } catch (error) {
      throw new Error(`unknown stripe response.  response: ${JSON.stringify(error)}`)
    }
  }

  useEffect(() => {
    if (!isSubmitting) {
      return
    }

    const run = async () => {
      try {
        const stripeResponse = await createToken()
        console.log('stripeResponse2:', !!stripeResponse)
        if (!stripeResponse) {
          return
        }
        const body = {
          ...stripeResponse,
          origin: window.origin,
          description: `Annual membership for Belmont Runners. name: ${displayName} email: ${email}  uid: ${uid}`,
          amountInCents: totalAmount * 100
        }
        const stripeFunction = firebase.functions().httpsCallable('stripe')

        try {
          const response = await stripeFunction(body)

          const stripeConfirmationId = response.data.id
          setConfirmationNumber(stripeConfirmationId)

          const transactionsRef = firebase.firestore().doc(
            `users/${uid}/transactions/${moment().utc().format()}`)
          const transactionsLastRef = firebase.firestore().doc(
            `users/${uid}/transactions/latest`)

          let newMembershipExpiresAt
          const yearFromNow = moment().add(1, 'year')
          if (membershipExpiresAt) {
            const membershipExpiresAtPlusOneYear = moment(membershipExpiresAt).add(1, 'year')
            if (membershipExpiresAtPlusOneYear.isBefore(yearFromNow)) {
              newMembershipExpiresAt = yearFromNow
            } else {
              newMembershipExpiresAt = membershipExpiresAtPlusOneYear
            }
          } else {
            newMembershipExpiresAt = yearFromNow
          }

          const values = {
            // stripeResponse: JSON.stringify(stripeResponse),
            stripeResponse,
            paidAt: moment().utc().format(),
            paidAmount: totalAmount,
            confirmationNumber: stripeConfirmationId
          }
          await Promise.all([
            transactionsRef.set(values),
            transactionsLastRef.set(values)
          ])
          try {
            await updateUserData({
              [MEMBERSHIP_EXPIRES_AT]: newMembershipExpiresAt.utc().format()
            }, { merge: true })

          } catch (error) {
            Sentry.captureException(error)
            console.error('failed to update user data.', error)
            // note: update of userData failed, everything else complete successfully.
          }
        } catch (error) {
          console.warn('Error from stripe.  error:', error)
          if (error && error.message) {
            const stripeError = JSON.parse(error.message)
            console.warn('stripeError:', stripeError)
            setErrorMessage(stripeError.message)
            return
          }
          // todo: handle case where it's not stripe error.
          throw stripeResponse
        }
      } catch (error) {
        Sentry.captureException(error)
        // todo:handle case where charge failed by showing an error message
        console.error("stripeError:", error)
      } finally {
        setIsSubmitting(false)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting])

  const getBody = () => {
    if (confirmationNumber) {
      return <div className='text-success text-center mt-4'>
        <div>
          <div>Complete successfully</div>
          <div>Confirmation: {confirmationNumber.substring(3)}</div>
        </div>
      </div>
    }

    if (needToPay === false) {
      return (
        <>
          <div className='text-success text-center mt-4'>Your membership expires
            on {moment(membershipExpiresAt).format("MMMM Do YYYY")}</div>
          <div className='text-success text-center'>You can renew it
            after {moment(membershipExpiresAt).subtract(1, 'month').format("MMMM Do YYYY")}
          </div>
        </>
      )
    }

    // need to pay.
    return (<>
        <h6 className='mt-3'>Membership fees</h6>
        &bull; Adult (18 and over): $25<br />
        &bull; Kids: $15.<br />

        <h4 className='my-4'>Total amount:
          ${totalAmount > 0 ? totalAmount : ''}
        </h4>
        {
          membershipExpiresAt &&
          <div className='text-warning mb-2 text-center'>
            {
              moment(membershipExpiresAt).isAfter(moment()) ?
                `Membership will expire on ${moment(membershipExpiresAt).format("MMMM Do YYYY")}` :
                `Membership expired on ${moment(membershipExpiresAt).format("MMMM Do YYYY")}`
            }
          </div>
        }
        <h5 className='mb-2'>
          Credit or debit card
        </h5>
        <CardElement onReady={(el) => el.focus()} />
        {errorMessage && <div className='text-danger text-center'>{errorMessage}</div>}
      </>
    )
  }

  console.log('SignUpStepPayment.render() called.')

  const handleClose = () => {
    history.push(ROOT)
  }

  function handleNextClicked () {
    confirmationNumber || needToPay === false ? onNextClicked() : setIsSubmitting(true)
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

      {getBody()}
      {
        (needToPay === false || needToPay === true) &&
        <SignUpStepperButton
          handlePrimaryClicked={handleNextClicked}
          primaryText={confirmationNumber || needToPay === false ?
            (isLast ? 'Finish' : 'Next')
            : "Pay Now"}
          primaryDisabled={!!isSubmitting}
          showPrimary

          handleSecondaryClicked={handleClose}
          secondaryText={'Finish later'}
          secondaryDisabled={!!isSubmitting}
          showSecondary={needToPay === true && !confirmationNumber}
        />
      }
    </div>
  )
}

SignUpStepPayment.propTypes = {
  // from redux
  currentUser: PropTypes.object.isRequired,
  updateUserData: PropTypes.func.isRequired,
  needToPay: PropTypes.bool,
  membershipExpiresAt: PropTypes.string,
  totalAmount: PropTypes.number.isRequired,

  // from HOC
  stripe: PropTypes.shape({
    createToken: PropTypes.func.isRequired
  }).isRequired,

  // from parent
  isLast: PropTypes.bool,
  onNextClicked: PropTypes.func.isRequired,

  // from router-dom
  history: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser, userData } }) => {

  userData = userData ? userData.toJS() : {}
  let membershipExpiresAt = null
  let needToPay = false
  let totalAmount = -1

  if (currentUser) {
    const dateOfBirth = moment(userData[DATE_OF_BIRTH])
    const isAdult = moment().diff(dateOfBirth, 'years') >= 18
    if (isAdult) {
      totalAmount = MEMBERSHIP_FEE_ADULT
    } else {
      totalAmount = MEMBERSHIP_FEE_KID
    }

    const membershipData = calc(userData)
    membershipExpiresAt = userData[MEMBERSHIP_EXPIRES_AT]
    if (!membershipData[IS_A_MEMBER] || membershipData[IS_MEMBERSHIP_EXPIRES_SOON]) {
      needToPay = true
    }
  }

  return {
    currentUser,

    needToPay,
    membershipExpiresAt,
    totalAmount
  }
}

export default compose(
  UpdateUserData,
  withRouter,
  injectStripe,
  LoggedInState(),
  connect(mapStateToProps)
)(SignUpStepPayment)
