import { https } from 'firebase-functions'
import * as Admin from 'firebase-admin'
import { User } from './User'

const moment = require('moment')
const _ = require('underscore')

interface StripeParams {
  token: { id: string }
  description: string
  amountInCents: number
  origin: string
}

interface StripeConfig {
  membershipFeeInCents: string
  secretKeys: {
    test: string
    live: string
  }
}

export default (admin: Admin.app.App, config: StripeConfig) => {
  const stripeLive = require('stripe')(config.secretKeys.live)
  const stripeTest = require('stripe')(config.secretKeys.test)
  const firestore = admin.firestore()

  return async (data: StripeParams, context?: https.CallableContext) => {

    console.info('stripe() called.', 'data:', data)

    if (!context || !context.auth || !context.auth.uid) {
      throw new https.HttpsError(
        'unauthenticated',
        'unauthenticated.'
      )
    }
    const { uid } = context.auth

    const currentUserRef = firestore.doc(`users/${uid}`)
    const transactionsRef = firestore.doc(`users/${uid}/transactions/${moment().utc().format()}`)
    const transactionsLastRef = firestore.doc(`users/${uid}/transactions/latest`)

    const {
      token,
      description,
      amountInCents,
      origin
    } = data

    const { id } = token

    const userDoc = await currentUserRef.get()
    if (!userDoc.data()) {
      throw new https.HttpsError(
        'internal',
        'Something went wrong...'
      )
    }
    const currentUser: User = userDoc.data() as User
    const { membershipExpiresAt } = currentUser

    let charge
    const amount: number = amountInCents || parseInt(config.membershipFeeInCents)
    try {
      const isLocal =
        _.isString(origin) &&
        (origin.indexOf('localhost') > -1 || origin.indexOf('127.0.0.1') > -1)
      const isProduction = !isLocal
      console.info('isProduction:', isProduction, 'origin:', origin)
      const stripe = isProduction ? stripeLive : stripeTest
      charge = await stripe.charges.create({
        amount,
        currency: 'usd',
        description: description || 'Annual membership for Belmont Runners',
        source: id
      })
    } catch (err) {
      console.warn('charge error:', JSON.stringify(err))
      throw new https.HttpsError(
        'invalid-argument',
        JSON.stringify(err)
      )
    }
    console.info('charge:', JSON.stringify(charge))


    const confirmationNumber = charge.id

    let newMembershipExpiresAt
    const yearFromNow = moment().add(1, 'year')
    if (membershipExpiresAt) {
      const membershipExpiresAtPlusOneYear = moment(
        membershipExpiresAt
      ).add(1, 'year')
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
      stripeResponse: { token },
      paidAt: moment().utc().format(),
      paidAmount: amount / 100,
      confirmationNumber: confirmationNumber
    }
    currentUser.notInterestedInBecomingAMember = false
    currentUser.membershipExpiresAt = newMembershipExpiresAt.utc().format()
    await Promise.all([
      transactionsRef.set(values),
      transactionsLastRef.set(values),
      currentUserRef.set({
        notInterestedInBecomingAMember: currentUser.notInterestedInBecomingAMember,
        membershipExpiresAt: currentUser.membershipExpiresAt
      }, { merge: true })
    ])
    return charge
  }
}