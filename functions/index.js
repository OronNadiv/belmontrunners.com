const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const generateThumbnail = require('./generateThumbnail')(admin)
const auth2Users = require('./auth2Users')(admin)
const users2Contacts = require('./users2Contacts')(admin)
const contacts2MailChimp = require('./contacts2MailChimp')(admin)
const generateICal = require('./generateICal')(admin)
const stripe = require('./stripe')

const runtimeOpts = {
  timeoutSeconds: 120,
  memory: '1GB'
}
exports.generateThumbnailHTTP = functions
  .runWith(runtimeOpts)
  .https.onCall(generateThumbnail)

exports.auth2UsersCronJob = functions.pubsub
  .schedule('0 */6 * * *')
  .onRun(async () => {
    try {
      await auth2Users()
      console.info('Calling process.exit(0)')
      process.exit(0)
    } catch (err) {
      console.error(err)
      console.info('Calling process.exit(1)')
      process.exit(1)
    }
  })

exports.users2ContactsCronJab = functions.pubsub
  .schedule('20 */6 * * *')
  .onRun(async () => {
    try {
      await users2Contacts()
      console.info('users2ContactsCronJab: done')
    } catch (err) {
      console.error('users2ContactsCronJab: error:', err)
    }
  })

exports.contacts2MailChimpCronJab = functions.pubsub
  .schedule('40 */6 * * *')
  .onRun(async () => {
    try {
      await contacts2MailChimp()
      console.info('Calling process.exit(0)')
      process.exit(0)
    } catch (err) {
      console.error(err)
      console.info('Calling process.exit(1)')
      process.exit(1)
    }
  })

exports.ical = functions.https.onRequest(async (req, res) => {
  try {
    const body = await generateICal(req)
    res.set({
      'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
      // 'content-security-policy': "script-src 'report-sample' 'nonce-b3O76BbGW8VYkTGK5Nxtvw' 'unsafe-inline' 'strict-dynamic' https: http: 'unsafe-eval';object-src 'none';base-uri 'self';report-uri /calendar/cspreport",
      'content-type': 'text/calendar; charset=UTF-8',
      // 'date': 'Sat, 15 Jun 2019 22:23:46 GMT',
      'expires': 'Mon, 01 Jan 1990 00:00:00 GMT',
      'pragma': 'no-cache',
      // 'server': 'GSE',
      'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN',
      'x-xss-protection': '1; mode=block'
    })
    res.send(Buffer.from(body))
  } catch (err) {
    console.error('ical generation got an err:', err)
    res.status(500).send('Internal Server Error')
  }
})

exports.stripe = functions
  .https.onCall(stripe)
