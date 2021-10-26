import { functions } from '../../firebase'
import React, { useEffect, useState } from 'react'
import { CardElement, injectStripe } from 'react-stripe-elements'
import SignUpStepperButton from './SignUpStepperButton'
import './Stripe.scss'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/HOC/LoggedInState'
import moment from 'moment'
import { ROOT } from '../../urls'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import UpdateUserData from '../../components/HOC/UpdateUserData'
import { animateScroll } from 'react-scroll'
import { compose } from 'underscore'
import calc from '../../utilities/membershipUtils'
import { IRedisState, IUser } from '../../entities/User'
import { IUpdateUserData } from '../../reducers/currentUser'
import { User } from '../../../functions/src/User';
import {FunctionsError, httpsCallable } from 'firebase/functions'

const MEMBERSHIP_FEE_ADULT = 20
const MEMBERSHIP_FEE_KID = 10

interface StripeTokenResponse {
  error?: { message: string }
}

interface StripeTransactionResponse {
  id: string
}

interface Props extends RouteComponentProps {
  firebaseUser: User
  needToPay: boolean
  totalAmount: number
  isLast: boolean
  onNextClicked: () => void
  youngerThan13: boolean
  membershipExpiresAt?: string
  stripe: { createToken: (arg0: { type: string }) => StripeTokenResponse }
  updateUserData: IUpdateUserData
}

function SignUpStepPayment({
                             firebaseUser: { displayName, uid, email },
                             history,
                             stripe,
                             isLast,
                             needToPay,
                             totalAmount,
                             membershipExpiresAt,
                             onNextClicked,
                             youngerThan13,
                             updateUserData
                           }: Props) {
  useEffect(() => {
    animateScroll.scrollToTop({ duration: 0 })
  }, [])

  const [errorMessage, setErrorMessage] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationNumber, setConfirmationNumber] = useState('')

  const createToken = async () => {
    try {
      const stripeTokenResponse: StripeTokenResponse = await stripe.createToken({ type: 'card' })
      console.log('stripeTokenResponse:', JSON.stringify(stripeTokenResponse, null, 2))
      if (stripeTokenResponse.error) {
        setErrorMessage(stripeTokenResponse.error.message)
        return
      }
      return stripeTokenResponse
    } catch (error) {
      throw new Error(
        `unknown stripe response.  response: ${JSON.stringify(error)}`
      )
    }
  }

  useEffect(() => {
    if (!isSubmitting) {
      return
    }

    ;(async function() {
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
        const stripeFunction = httpsCallable(functions, 'stripe')

        try {
          const response = await stripeFunction(body)
          const data : StripeTransactionResponse = response.data as StripeTransactionResponse
          const stripeConfirmationId = data.id
          setConfirmationNumber(stripeConfirmationId)
        } catch (error) {
          console.warn('Error from stripe.  error:', error)
          if (error) {
            const funcError = error as FunctionsError
            if (funcError.message) {
              const stripeError = JSON.parse(funcError.message)
              console.warn('stripeError:', stripeError)
              const message = stripeError.message || (stripeError.raw && stripeError.raw.message) || stripeError.code || 'Failed for unknown reason.\nPlease contact support.'
              setErrorMessage(message)
              return
            }
          }
          // todo: handle case where it's not stripe error.
          throw stripeResponse
        }
      } catch (error) {
        Sentry.captureException(error)
        // todo:handle case where charge failed by showing an error message
        console.error('stripeError:', error)
      } finally {
        setIsSubmitting(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitting])

  // we want to refresh UserData in case the confirmation number has changed.
  // This would let the components know the user became a member.
  useEffect(() => {
    if (!confirmationNumber) {
      return
    }
    ;(async function() {
      await updateUserData({}, { merge: true })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmationNumber])

  const getBody = () => {
    if (confirmationNumber) {
      return (
        <div className="text-success text-center mt-4">
          <div>
            <div>Complete successfully</div>
            <div>Confirmation: {confirmationNumber.substring(3)}</div>
          </div>
        </div>
      )
    }

    if (!needToPay) {
      if (youngerThan13) {
        return (
            <>
              <div className="text-justify mt-4">
                <p className="text-danger">
                  Kids 12 and under are welcome to join the club, as long as
                  they are accompanied by an Adult or Legal Guardian. However,
                  due to the California CCPA and COPPA, the club cannot allow
                  minors under 13 to register with our website.
                </p>
                <p>
                  If you and your child would like to join us on a run, please
                  talk to one of the Board Members or Run Leaders at a group run
                  in order to sign the liability waiver in person.
                </p>
                <p>
                  In order to keep your child&apos;s information safe, this account
                  will be automatically disabled within 24 hours.
                </p>
                <p>
                  Any questions, don&apos;t hesitate to contact us at <a
                    href='mailto://info@belmontrunners.com'
                    target='_blank'
                    rel='noreferrer noopener'>info@belmontrunners.com</a>.
                </p>
              </div>
            </>
        )
      }

      return (
        <>
          <div className="text-success text-center mt-4">
            Your membership expires on{' '}
            {moment(membershipExpiresAt).format('MMMM Do YYYY')}
          </div>
          <div className="text-success text-center">
            You can renew it after{' '}
            {moment(membershipExpiresAt)
              .subtract(1, 'month')
              .format('MMMM Do YYYY')}
          </div>
        </>
      )
    }

    // need to pay.
    return (
      <>
        <h6 className="mt-3">Membership fees</h6>
        &bull; Adult (18 and over): $20
        <br />
        &bull; Kids: $10.
        <br />
        <h4 className="my-4">
          Total amount: ${totalAmount > 0 ? totalAmount : ''}
        </h4>
        {membershipExpiresAt && (
          <div className="text-success mb-3 text-center">
            {moment(membershipExpiresAt).isAfter(moment())
              ? `Your current membership expires on ${moment(membershipExpiresAt).format(
                'MMMM Do YYYY'
              )}`
              : `Your membership expired on ${moment(membershipExpiresAt).format(
                'MMMM Do YYYY'
              )}`}
          </div>
        )}
        <h5 className="mb-2">Credit or debit card</h5>
        <CardElement onReady={el => el.focus()} />
        {errorMessage && (
          <div className="text-danger text-center">{errorMessage}</div>
        )}
      </>
    )
  }

  console.log('SignUpStepPayment.render() called.')

  const handleClose = () => {
    history.push(ROOT)
  }

  function handleNextClicked() {
    confirmationNumber || !needToPay
      ? onNextClicked()
      : setIsSubmitting(true)
  }

  return (
    <div className="justify-content-center">
      <h5 className="mt-5">Benefits to being part of Belmont Runners</h5>
      &bull; Training at group runs and walks
      <br />
      &bull; Free or discounted workshops, clinics, and classes
      <br />
      &bull; Discounted entry to other local races
      <br />
      &bull; Membership with the Road Runners Club of America
      <br />
      &bull; Liability insurance coverage
      <br />
      &bull; Social events with fun, active local runners and walkers
      <br />
      &bull; 10% discount at{' '}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://arunnersmind.com"
      >
        A Runner’s Mind
      </a>
      <br />
      {getBody()}
      {
        <SignUpStepperButton
          handlePrimaryClicked={handleNextClicked}
          primaryText={
            confirmationNumber || !needToPay
              ? isLast
              ? 'Finish'
              : 'Next'
              : 'Pay Now'
          }
          primaryDisabled={isSubmitting}
          showPrimary
          handleSecondaryClicked={handleClose}
          secondaryText={'Finish later'}
          secondaryDisabled={isSubmitting}
          showSecondary={needToPay && !confirmationNumber}
        />
      }
    </div>
  )
}

SignUpStepPayment.propTypes = {
  // from redux
  firebaseUser: PropTypes.object.isRequired,
  updateUserData: PropTypes.func.isRequired,
  needToPay: PropTypes.bool,
  membershipExpiresAt: PropTypes.string,
  totalAmount: PropTypes.number.isRequired,
  youngerThan13: PropTypes.bool.isRequired,

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

const mapStateToProps = ({ currentUser: { firebaseUser, userData } }: IRedisState) => {
  const userDataJS: IUser = userData ? userData.toJS() : {}
  let membershipExpiresAt = null
  let needToPay = false
  let totalAmount = -1
  let youngerThan13 = false

  if (firebaseUser) {
    if (!userDataJS.dateOfBirth) {
      console.error('missing userDataJS.dateOfBirth')
      totalAmount = MEMBERSHIP_FEE_ADULT
    } else {
      const dateOfBirth = moment(userDataJS.dateOfBirth)
      const isAdult = moment().diff(dateOfBirth, 'years') >= 18
      if (isAdult) {
        totalAmount = MEMBERSHIP_FEE_ADULT
      } else {
        totalAmount = MEMBERSHIP_FEE_KID
      }
    }
    const membershipData = calc(userDataJS)
    membershipExpiresAt = userDataJS.membershipExpiresAt
    if (
      !membershipData.isAMember ||
      membershipData.isMembershipExpiresSoon
    ) {
      needToPay = true
    }
    youngerThan13 =
      (userDataJS.dateOfBirth &&
        moment().diff(moment(userDataJS.dateOfBirth), 'years') < 13) ||
      false
    if (youngerThan13) {
      needToPay = false
    }
  }

  return {
    firebaseUser,

    needToPay,
    membershipExpiresAt,
    totalAmount,

    youngerThan13
  }
}

export default compose(
  UpdateUserData,
  withRouter,
  injectStripe,
  LoggedInState(),
  connect(mapStateToProps)
)(SignUpStepPayment)
