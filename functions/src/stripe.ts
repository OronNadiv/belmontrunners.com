import { https } from 'firebase-functions'
import * as Admin from 'firebase-admin'
import { User } from './User'
import StripeAPI from 'stripe'
import calc from './membershipUtils'

const {
  info,
  warn,
} = require("firebase-functions/logger");
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

const Stripe = (admin: Admin.app.App, config: StripeConfig) => {
  const stripeLive = new StripeAPI(config.secretKeys.live, {
    apiVersion: '2020-08-27'
  })
  const stripeTest = new StripeAPI(config.secretKeys.test, {
    apiVersion: '2020-08-27'
  })

  const firestore = admin.firestore()

  return async (data: StripeParams, context?: https.CallableContext) => {

    info('stripe() called.', 'data:', data)

    if (!context || !context.auth || !context.auth.uid) {
      throw new https.HttpsError(
        'unauthenticated',
        'unauthenticated.'
      )
    }
    const { uid } = context.auth

    const userDataRef = firestore.doc(`users/${uid}`)
    const transactionsRef = firestore.doc(`users/${uid}/transactions/${moment().utc().format()}`)
    const transactionsLastRef = firestore.doc(`users/${uid}/transactions/latest`)

    const {
      token,
      description,
      amountInCents,
      origin
    } = data

    const { id } = token

    const userDoc = await userDataRef.get()
    if (!userDoc.data()) {
      throw new https.HttpsError(
        'internal',
        'Something went wrong...'
      )
    }
    const userDataJS: User = userDoc.data() as User
    const isAMember = calc(userDataJS).isAMember
    const isMembershipExpiresSoon = calc(userDataJS).isMembershipExpiresSoon
    if (isAMember && !isMembershipExpiresSoon){
      warn('member has a valid membership that does not expire soon.', {
        membershipExpiresAt: userDataJS.membershipExpiresAt,
        isAMember,
        isMembershipExpiresSoon
      })
      throw new https.HttpsError(
          'internal',
          'Already a member.'
      )
    }

    const { membershipExpiresAt } = userDataJS

    let charge
    const amount: number = amountInCents || parseInt(config.membershipFeeInCents)
    try {
      const isLocal =
        _.isString(origin) &&
        (origin.indexOf('localhost') > -1 || origin.indexOf('127.0.0.1') > -1)
      const isProduction = !isLocal
      info({isProduction,  origin})
      const stripe = isProduction ? stripeLive : stripeTest
      charge = await stripe.charges.create({
        amount,
        currency: 'usd',
        description: description || 'Annual membership for Belmont Runners',
        source: id
      })
    } catch (err) {
      warn('charge error.', {err})
      throw new https.HttpsError(
        'invalid-argument',
        JSON.stringify(err)
      )
    }
    info('charge complete successfully.', {charge})


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
    userDataJS.notInterestedInBecomingAMember = false
    userDataJS.membershipExpiresAt = newMembershipExpiresAt.utc().format()

    await Promise.all([
          transactionsRef.set(values),
          transactionsLastRef.set(values),
          userDataRef.set({
            notInterestedInBecomingAMember: userDataJS.notInterestedInBecomingAMember,
            membershipExpiresAt: userDataJS.membershipExpiresAt
          }, {merge: true})
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
    return charge
  }
}

export default Stripe
