import 'firebase/functions'
import firebase from 'firebase'
import React, { useEffect, useState } from 'react'
import { CardElement, injectStripe } from 'react-stripe-elements'
import SignUpStepperButton from './SignUpStepperButton'
import './Stripe.scss'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/LoggedInState'
import moment from 'moment'
import Promise from 'bluebird'
import { ROOT } from '../../urls'
import { connect } from 'react-redux'
import { DATE_OF_BIRTH, MEMBERSHIP_EXPIRES_AT } from '../../fields'
import { updateUserData as updateUserDataAction } from '../../reducers/currentUser'
import * as Sentry from '@sentry/browser'
import { withRouter } from 'react-router-dom'
import usePrevious from '../../components/usePrevious'

const MEMBERSHIP_FEE_ADULT = 25
const MEMBERSHIP_FEE_KID = 15

function SignUpStepPayment ({
                              currentUser: { displayName, uid, email }, history,
                              updateUserData, stripe, isLast, userDataUpdating, userDataUpdateError,
                              needToPay, totalAmount, membershipExpiresAt, onNextClicked
                            }) {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const [successMessage, setSuccessMessage] = useState()
  const [errorMessage, setErrorMessage] = useState()
  const [success, setSuccess] = useState()
  const [isSubmitting, setIsSubmitting] = useState()
  const [confirmationNumber, setConfirmationNumber] = useState()

  const prevUserDataUpdating = usePrevious(userDataUpdating)
  useEffect(() => {
    if (prevUserDataUpdating && !userDataUpdating) {
      if (!userDataUpdateError && confirmationNumber) {
        setMessage('',
          <div>
            <div>Complete successfully</div>
            <div>Confirmation: {confirmationNumber.substring(3)}</div>
          </div>)
      } else {
        // todo: show message if user data update failed.
      }
    }

  }, [prevUserDataUpdating, userDataUpdating, userDataUpdateError, confirmationNumber])

  const setMessage = (errorMessage = '', successMessage = '') => {
    setSuccessMessage(successMessage)
    setErrorMessage(errorMessage)
    setSuccess(!!successMessage)
  }

  const handleSubmitPayment = async () => {
    setIsSubmitting(true)

    try {
      const stripeResponse = await stripe.createToken({ type: 'card' })
      console.log('stripeResponse:', JSON.stringify(stripeResponse, 0, 2))
      if (stripeResponse.error) {
        setMessage(stripeResponse.error.message)
        throw stripeResponse.error
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
        console.log('response:', response)
        setConfirmationNumber(response.data.id)

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
          confirmationNumber
        }
        await Promise.all([
          transactionsRef.set(values),
          transactionsLastRef.set(values)
        ])
        try {
          updateUserData({
            [MEMBERSHIP_EXPIRES_AT]: newMembershipExpiresAt.utc().format()
          }, { merge: true })
        } catch (error) {
          Sentry.captureException(error)
          console.error('failed to update user data.', error)
        }
      } catch (error) {
        console.warn('Error from stripe.  error:', error)
        if (error && error.message) {
          const stripeError = JSON.parse(error.message)
          console.warn('stripeError:', stripeError)
          setMessage(stripeError.message)
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

  const getBody = () => {
    if (!success) {
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
      } else if (needToPay === true) {
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
    } else if (success) {
      return <div className='text-success text-center mt-4'>{successMessage}</div>
    }
  }

  console.log('SignUpStepPayment.render() called.')

  const handleClose = () => {
    history.push(ROOT)
  }

  function handleNextClicked () {
    success || needToPay === false ? onNextClicked() : handleSubmitPayment()
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
          primaryText={success || needToPay === false ?
            (isLast ? 'Finish' : 'Next')
            : "Pay Now"}
          primaryDisabled={!!isSubmitting || userDataUpdating}
          showPrimary

          handleSecondaryClicked={handleClose}
          secondaryText={'Finish later'}
          secondaryDisabled={!!isSubmitting || userDataUpdating}
          showSecondary={needToPay === true && !success}
        />
      }
    </div>
  )
}

SignUpStepPayment.propTypes = {
  // from redux
  currentUser: PropTypes.object,
  userDataUpdating: PropTypes.bool.isRequired,
  userDataUpdateError: PropTypes.object,
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

const mapDispatchToProps = {
  updateUserData: updateUserDataAction
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, currentUser, userData, userDataUpdating, userDataUpdateError } }) => {

  userData = userData ? userData.toJS() : userData
  let membershipExpiresAt = null
  let needToPay = false
  let totalAmount = -1

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

    needToPay,
    membershipExpiresAt,
    totalAmount
  }
}

export default withRouter(injectStripe(LoggedInState({
  name: 'SignUpStepPayment',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps, mapDispatchToProps)(SignUpStepPayment))))
