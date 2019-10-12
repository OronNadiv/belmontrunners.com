const functions = require('firebase-functions')
const {
  membership_fee_in_cents,
  secret_keys: { live, test }
} = functions.config().stripe
const _ = require('underscore')

const stripeLive = require('stripe')(live)
const stripeTest = require('stripe')(test)

module.exports = async data => {
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
      amount: amountInCents || membership_fee_in_cents,
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
