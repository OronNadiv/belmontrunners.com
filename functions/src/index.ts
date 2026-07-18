import AddContact from './addContact'
import Auth2Users from './auth2Users'
import Contacts2MailChimp from './contacts2MailChimp'
import DeleteUser from './deleteUser'
import GenerateICal from './generateICal'
import GetMembers from './getMembers'
import SendMembershipReminders from './sendMembershipReminders'
import Stripe from './stripe'
import UpdateEvents from './updateEvents'
import Users2Contacts from './users2Contacts'
import * as functions from 'firebase-functions/v1'
import { info, error } from "firebase-functions/logger"
import { defineString, defineSecret } from 'firebase-functions/params'
import { UserRecord } from 'firebase-functions/v1/auth'
import * as Admin from 'firebase-admin'
import { EMAIL } from './fields'
import { props } from 'bluebird'
import { Firestore } from 'firebase-admin/firestore'

const admin: Admin.app.App = Admin.initializeApp()
const firestore: Firestore = admin.firestore()

// Environment parameters (replaces functions.config())
const mailchimpApiKey = defineSecret('MAILCHIMP_APIKEY')
const openweathermapAppId = defineSecret('OPENWEATHERMAP_APP_ID')
const openweathermapCityId = defineString('OPENWEATHERMAP_CITY_ID')
const stripeMembershipFeeInCents = defineString('STRIPE_MEMBERSHIP_FEE_IN_CENTS')
const stripeSecretKeyLive = defineSecret('STRIPE_SECRET_KEY_LIVE')
const stripeSecretKeyTest = defineSecret('STRIPE_SECRET_KEY_TEST')

const auth2Users = new Auth2Users(admin)
const generateICal = GenerateICal()

const ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS = 180

export const auth2UsersCronJob = functions
  .runWith({ timeoutSeconds: ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS })
  .pubsub
  .schedule('20 */6 * * *')
  .onRun(async () => await auth2Users.SyncAll({ syncGravatar: true }))

export const auth2UsersOnCreate = functions
  .runWith({ timeoutSeconds: ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS })
  .auth
  .user()
  .onCreate(async (userRecord: UserRecord) => await auth2Users.Sync(userRecord, { syncGravatar: false }))

export const users2ContactsCronJob = functions
  .runWith({ timeoutSeconds: ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS })
  .pubsub
  .schedule('30 */6 * * *')
  .onRun(async () => {
    try {
      const users2Contacts = Users2Contacts(admin)
      await users2Contacts()
      info('users2ContactsCronJob: done')
    } catch (err) {
      error('While calling users2ContactsCronJob.', { err })
    }
  })

export const contacts2MailChimpCronJob = functions
  .runWith({ timeoutSeconds: ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS, secrets: [mailchimpApiKey] })
  .pubsub
  .schedule('40 */6 * * *')
  .onRun(async () => {
    try {
      const contacts2MailChimp = Contacts2MailChimp(admin, mailchimpApiKey.value())
      await contacts2MailChimp()
      info('Calling process.exit(0)')
      setTimeout(function () {
        process.exit(0)
      }, 5000)
    } catch (err) {
      error('While calling contacts2MailChimpCronJob', { err })
      info('Calling process.exit(1)')
      setTimeout(function () {
        process.exit(1)
      }, 5000)
    }
  })

export const updateEventsCronJob = functions
  .runWith({ secrets: [openweathermapAppId] })
  .pubsub
  .schedule('*/20 * * * *')
  .onRun(async () => {
    const updateEvents = UpdateEvents(admin, openweathermapAppId.value(), openweathermapCityId.value())
    await updateEvents()
  })

export const waiver = functions
  .https
  .onRequest(async (req: functions.https.Request, res: functions.Response) => {
    res.redirect('https://docs.google.com/forms/d/e/1FAIpQLSfYxlbWAzK1jAcdE_5-ijxORNVz2YU4BdSVt2Dk-DByncIEkw/viewform')
  })

export const ical = functions
  .runWith({ memory: '512MB' })
  .https
  .onRequest(async (req: functions.https.Request, res: functions.Response) => {
    try {
      const body = await generateICal()
      res.set({
        'cache-control': 'no-cache, no-store, max-age=0, must-revalidate',
        'content-type': 'text/calendar; charset=UTF-8',
        expires: 'Mon, 01 Jan 1990 00:00:00 GMT',
        pragma: 'no-cache',
        'strict-transport-security':
          'max-age=31536000; includeSubDomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'SAMEORIGIN',
        'x-xss-protection': '1; mode=block'
      })
      res.send(Buffer.from(body))
    } catch (err) {
      error('While calling ical.', { err })
      res.status(500).send('Internal Server Error')
    }
  })

const stripeConfig = () => Stripe(admin, {
  membershipFeeInCents: stripeMembershipFeeInCents.value(),
  secretKeys: { live: stripeSecretKeyLive.value(), test: stripeSecretKeyTest.value() }
})

export const createCheckoutSession = functions
  .runWith({ memory: '512MB', secrets: [stripeSecretKeyLive, stripeSecretKeyTest] })
  .https.onCall((data, context) => stripeConfig().createCheckoutSession(data, context))

export const confirmCheckoutSession = functions
  .runWith({ memory: '512MB', secrets: [stripeSecretKeyLive, stripeSecretKeyTest] })
  .https.onCall((data, context) => stripeConfig().confirmCheckoutSession(data, context))

export const addContact = functions
  .runWith({ memory: '512MB' })
  .https
  .onCall((data, context) => {
    const addContactImpl = AddContact(admin)
    return addContactImpl(data, context)
  })

export const getMembers = functions
  .runWith({ timeoutSeconds: 30, memory: '512MB' })
  .https
  .onCall((data, context) => {
    const getMembersImpl = GetMembers(admin)
    return getMembersImpl(data, context)
  })

export const deleteUser = functions
  .runWith({ timeoutSeconds: 30, memory: '512MB', secrets: [mailchimpApiKey] })
  .https
  .onCall(async (data, context) => {
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
      const { docUsersDelete, docUser } = await props({
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
      // @ts-ignore
      targetEmail = docUser.data() && docUser.data()[EMAIL]
      if (!targetEmail) {
        throw new functions.https.HttpsError('not-found', 'not-found.')
      }
    } else {
      targetEmail = context.auth.token[EMAIL]
    }
    const deleteUserImpl = DeleteUser(admin, mailchimpApiKey.value())
    await deleteUserImpl({ uid: targetUID, email: targetEmail })
  })

export const sendMembershipRemindersCronJob = functions
  .runWith({ timeoutSeconds: ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS })
  .pubsub
  .schedule('0 19 * * *')
  .onRun(async () => {
    const sendMembershipReminders = SendMembershipReminders(admin)
    await sendMembershipReminders()
  })
