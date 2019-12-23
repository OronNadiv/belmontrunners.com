const functions = require('firebase-functions')
const _ = require('underscore')

interface StripeParams {
  token: {id: string}
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
export default (config: StripeConfig) => {
  const stripeLive = require('stripe')(config.secretKeys.live)
  const stripeTest = require('stripe')(config.secretKeys.test)

  return async (data: StripeParams) => {

    console.info('stripe() called.', 'data:', data)

    const {
      token: { id },
      description,
      amountInCents,
      origin
    } = data

    let charge
    try {
      const isLocal =
        _.isString(origin) &&
        (origin.indexOf('localhost') > -1 || origin.indexOf('127.0.0.1') > -1)
      const isProduction = !isLocal
      console.info('isProduction:', isProduction, 'origin:', origin)
      const stripe = isProduction ? stripeLive : stripeTest
      charge = await stripe.charges.create({
        amount: amountInCents || config.membershipFeeInCents,
        currency: 'usd',
        description: description || 'Annual membership for Belmont Runners',
        source: id
      })
    } catch (err) {
      console.warn('charge error:', JSON.stringify(err))
      throw new functions.https.HttpsError(
        'invalid-argument',
        JSON.stringify(err)
      )
    }
    console.info('charge:', JSON.stringify(charge))

    return charge
  }
}
