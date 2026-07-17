import { https } from 'firebase-functions/v1'
import * as Admin from 'firebase-admin'
import { User } from './User'
import StripeAPI from 'stripe'
import calc from './membershipUtils'

const {
  info,
  warn,
} = require("firebase-functions/logger");
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)
const _ = require('underscore')

interface CreateCheckoutSessionParams {
  amountInCents: number
  description: string
  origin: string
  returnUrl: string
  customerEmail: string
}

interface ConfirmCheckoutSessionParams {
  sessionId: string
  origin: string
}

interface StripeConfig {
  membershipFeeInCents: string
  secretKeys: {
    test: string
    live: string
  }
}

const Stripe = (admin: Admin.app.App, config: StripeConfig) => {
  const stripeLive = new StripeAPI(config.secretKeys.live, {
    apiVersion: '2026-06-24.dahlia'
  })
  const stripeTest = new StripeAPI(config.secretKeys.test, {
    apiVersion: '2026-06-24.dahlia'
  })

  const firestore = admin.firestore()

  const getStripeInstance = (origin: string) => {
    const isLocal =
      _.isString(origin) &&
      (origin.indexOf('localhost') > -1 || origin.indexOf('127.0.0.1') > -1)
    const isProduction = !isLocal
    info({ isProduction, origin })
    return isProduction ? stripeLive : stripeTest
  }

  const assertAuth = (context?: https.CallableContext): string => {
    if (!context || !context.auth || !context.auth.uid) {
      throw new https.HttpsError('unauthenticated', 'unauthenticated.')
    }
    return context.auth.uid
  }

  const createCheckoutSession = async (data: CreateCheckoutSessionParams, context?: https.CallableContext) => {
    info('createCheckoutSession() called.', 'data:', data)

    const uid = assertAuth(context)
    const { amountInCents, description, origin, returnUrl, customerEmail } = data

    const userDataRef = firestore.doc(`users/${uid}`)
    const userDoc = await userDataRef.get()
    if (!userDoc.data()) {
      throw new https.HttpsError('internal', 'Something went wrong...')
    }
    const userDataJS: User = userDoc.data() as User
    const isAMember = calc(userDataJS).isAMember
    const isMembershipExpiresSoon = calc(userDataJS).isMembershipExpiresSoon
    if (isAMember && !isMembershipExpiresSoon) {
      warn('member has a valid membership that does not expire soon.', {
        membershipExpiresAt: userDataJS.membershipExpiresAt,
        isAMember,
        isMembershipExpiresSoon
      })
      throw new https.HttpsError('internal', 'Already a member.')
    }

    const amount: number = amountInCents || parseInt(config.membershipFeeInCents)
    const stripe = getStripeInstance(origin)

    try {
      const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded_page',
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Belmont Runners Annual Membership',
              description: description || 'Annual membership for Belmont Runners',
            },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        customer_email: customerEmail,
        metadata: { uid },
        return_url: returnUrl,
      })
      info('checkout session created.', { id: session.id })
      return { clientSecret: session.client_secret }
    } catch (err) {
      warn('checkout session create error.', { err })
      throw new https.HttpsError('invalid-argument', JSON.stringify(err))
    }
  }

  const confirmCheckoutSession = async (data: ConfirmCheckoutSessionParams, context?: https.CallableContext) => {
    info('confirmCheckoutSession() called.', 'data:', data)

    const uid = assertAuth(context)
    const { sessionId, origin } = data
    const stripe = getStripeInstance(origin)

    let session
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId)
    } catch (err) {
      warn('checkout session retrieve error.', { err })
      throw new https.HttpsError('not-found', 'Payment session not found.')
    }

    if (session.metadata?.uid !== uid) {
      throw new https.HttpsError('permission-denied', 'Payment does not belong to this user.')
    }

    if (session.payment_status !== 'paid') {
      throw new https.HttpsError('failed-precondition',
        `Payment has not succeeded. Status: ${session.payment_status}`)
    }

    const confirmationNumber = session.payment_intent as string

    // Idempotency: check if this payment was already confirmed
    const userDataRef = firestore.doc(`users/${uid}`)
    const transactionsRef = firestore.doc(`users/${uid}/transactions/${dayjs().utc().format()}`)
    const transactionsLastRef = firestore.doc(`users/${uid}/transactions/latest`)

    const existingLatest = await transactionsLastRef.get()
    if (existingLatest.exists && existingLatest.data()?.confirmationNumber === confirmationNumber) {
      info('Payment already confirmed.', { confirmationNumber })
      return { confirmationNumber }
    }

    const userDoc = await userDataRef.get()
    const userDataJS: User = userDoc.data() as User
    const { membershipExpiresAt } = userDataJS

    let newMembershipExpiresAt
    const yearFromNow = dayjs().add(1, 'year')
    if (membershipExpiresAt) {
      const membershipExpiresAtPlusOneYear = dayjs(membershipExpiresAt).add(1, 'year')
      if (membershipExpiresAtPlusOneYear.isBefore(yearFromNow)) {
        newMembershipExpiresAt = yearFromNow
      } else {
        newMembershipExpiresAt = membershipExpiresAtPlusOneYear
      }
    } else {
      newMembershipExpiresAt = yearFromNow
    }

    const amount = session.amount_total || 0
    const values = {
      stripeResponse: { sessionId: session.id, paymentIntentId: confirmationNumber },
      paidAt: dayjs().utc().format(),
      paidAmount: amount / 100,
      confirmationNumber
    }

    await Promise.all([
      transactionsRef.set(values),
      transactionsLastRef.set(values),
      userDataRef.set({
        notInterestedInBecomingAMember: false,
        membershipExpiresAt: newMembershipExpiresAt.utc().format()
      }, { merge: true })
    ])
      .then(() =>
        firestore.collection('mail').add({
          toUids: [userDataJS.uid],
          bcc: 'membership@belmontrunners.com',
          template: {
            name: "welcome",
            data: {
              displayName: userDataJS.displayName,
            },
          },
        })
      )

    info('checkout session confirmed.', { confirmationNumber })
    return { confirmationNumber }
  }

  return { createCheckoutSession, confirmCheckoutSession }
}

export default Stripe
