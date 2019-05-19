const secretKey = process.env.STRIPE_SECRET_KEY
const amount = process.env.CHARGE_AMOUNT_IN_CENTS

const stripe = require('stripe')(secretKey)

const generateResponse = (body, statusCode) => {
  return {
    headers: {
      'access-control-allow-methods': 'POST',
      'access-control-allow-origin': '*',
      'content-type': 'Content-type: text/html',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    },
    statusCode,
    body
  }
}

exports.handler = async (event, context, callback) => {
  try {
    console.log('event:', event)
    console.log('context:', context)
    const { body } = event
    console.log('body:', body)

    if (event.httpMethod.toUpperCase() === 'OPTIONS') {
      {
        const response = generateResponse('', 200)
        return callback(null, response)
      }
    }
    const { token: { id } } = JSON.parse(body)

    let charge
    try {
      charge = await stripe.charges.create({
        amount: parseInt(amount),
        currency: 'usd',
        description: 'Example charge',
        source: id
      })
    } catch (err) {
      console.log('charge error:', JSON.stringify(err))
      const response = generateResponse(JSON.stringify(err), 400)
      return callback(null, response)
    }
    console.log('charge:', JSON.stringify(charge))

    const response = generateResponse(JSON.stringify(charge), 200)
    return callback(null, response)
  } catch (err) {
    console.log('err:', err)
    const response = generateResponse(JSON.stringify(err), 500)
    // todo: do not return the actual response.
    callback(null, response)
  }
}
