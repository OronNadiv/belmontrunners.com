import AddContact from './addContact'
import Auth2Users from './auth2Users'
import Contacts2MailChimp from './contacts2MailChimp'
import DeleteUser from './deleteUser'
import GenerateICal from './GenerateICal'
import GetMembers from './getMembers'
import Users2Contacts from './users2Contacts'

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()

const apiKey = functions.config().mailchimp.apikey

const addContact = AddContact(admin)
const auth2Users = Auth2Users(admin)
const contacts2MailChimp = Contacts2MailChimp(admin, apiKey)
const deleteUser = DeleteUser(admin, apiKey)
const generateICal = GenerateICal()
const getMembers = GetMembers(admin)
const users2Contacts = Users2Contacts(admin)

const stripe = require('./stripe')
const purgeUsersUnder13 = require('./purgeUsersUnder13')(admin)
const Promise = require('bluebird')
const { EMAIL } = require('./fields')

const auth2UsersExec = async () => {
  try {
    await auth2Users()
    console.info('Calling process.exit(0)')
    process.exit(0)
  } catch (err) {
    console.error(err)
    console.info('Calling process.exit(1)')
    process.exit(1)
  }
}

exports.purgeUsersUnder13CronJob = functions.pubsub
  .schedule('10 */6 * * *')
  .onRun(async () => await purgeUsersUnder13())
exports.auth2UsersCronJob = functions.pubsub
  .schedule('20 */6 * * *')
  .onRun(async () => await auth2UsersExec)
exports.auth2UsersOnCreate = functions.auth.user().onCreate(auth2UsersExec)

exports.users2ContactsCronJob = functions.pubsub
  .schedule('30 */6 * * *')
  .onRun(async () => {
    try {
      await users2Contacts()
      console.info('users2ContactsCronJob: done')
    } catch (err) {
      console.error('users2ContactsCronJob: error:', err)
    }
  })

exports.contacts2MailChimpCronJob = functions
  .runWith({ timeoutSeconds: 180 })
  .pubsub.schedule('40 */6 * * *')
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

exports.ical = functions
  .runWith({ memory: '512MB' })
  .https.onRequest(async (req, res) => {
    try {
      const body = await generateICal(req)
      res.set({
        'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
        // 'content-security-policy': "script-src 'report-sample' 'nonce-b3O76BbGW8VYkTGK5Nxtvw' 'unsafe-inline' 'strict-dynamic' https: http: 'unsafe-eval';object-src 'none';base-uri 'self';report-uri /calendar/cspreport",
        'content-type': 'text/calendar; charset=UTF-8',
        // 'date': 'Sat, 15 Jun 2019 22:23:46 GMT',
        expires: 'Mon, 01 Jan 1990 00:00:00 GMT',
        pragma: 'no-cache',
        // 'server': 'GSE',
        'strict-transport-security':
          'max-age=31536000; includeSubDomains; preload',
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

exports.stripe = functions.runWith({ memory: '512MB' }).https.onCall(stripe)

exports.addContact = functions
  .runWith({ memory: '512MB' })
  .https.onCall(addContact)

exports.getMembers = functions
  .runWith({ timeoutSeconds: 30, memory: '512MB' })
  .https.onCall(getMembers)

exports.deleteUser = functions
  .runWith({ timeoutSeconds: 30, memory: '512MB' })
  .https.onCall(async (data, context) => {
    if (!context || !context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'unauthenticated.'
      )
    }
    const currentUID = context.auth.uid
    const targetUID = data.uid
    let targetEmail
    if (targetUID !== currentUID) {
      const { docUsersDelete, docUser } = await Promise.props({
        docUsersDelete: firestore.doc('permissions/usersDelete').get(),
        docUser: firestore.doc(`users/${targetUID}`).get()
      })
      const usersDelete = docUsersDelete.data()
      const allowDelete = usersDelete && usersDelete[currentUID]
      if (!allowDelete) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'permission-denied.'
        )
      }
      targetEmail = docUser.data() && docUser.data()[EMAIL]
      if (!targetEmail) {
        throw new functions.https.HttpsError('not-found', 'not-found.')
      }
    } else {
      targetEmail = context.auth.token[EMAIL]
    }
    await deleteUser({ uid: targetUID, email: targetEmail })
  })
