import AddContact from './addContact'
import Auth2Users from './auth2Users'
import Contacts2MailChimp from './contacts2MailChimp'
import DeleteUser from './deleteUser'
import GenerateICal from './generateICal'
import GetMembers from './getMembers'
import PurgeUsersUnder13 from './purgeUsersUnder13'
import SendMembershipReminders from './sendMembershipReminders'
import Stripe from './stripe'
import UpdateEvents from './updateEvents'
import Users2Contacts from './users2Contacts'
import * as functions from 'firebase-functions'
import { info, error } from "firebase-functions/logger"
import { UserRecord } from 'firebase-functions/lib/providers/auth'
import * as Admin from 'firebase-admin'
import { EMAIL } from './fields'
import { props } from 'bluebird'
import { Firestore } from 'firebase-admin/firestore'

const admin: Admin.app.App = Admin.initializeApp()
const firestore: Firestore = admin.firestore()

const apiKey = functions.config().mailchimp.apikey
const { app_id, city_id } = functions.config().openweathermap
const {
  membership_fee_in_cents,
  secret_keys: { live, test }
} = functions.config().stripe

const addContactImpl = AddContact(admin)
const auth2Users = new Auth2Users(admin)
const contacts2MailChimp = Contacts2MailChimp(admin, apiKey)
const deleteUserImpl = DeleteUser(admin, apiKey)
const generateICal = GenerateICal()
const getMembersImpl = GetMembers(admin)
const purgeUsersUnder13 = PurgeUsersUnder13(admin, apiKey, false)
const sendMembershipReminders = SendMembershipReminders(admin)
const stripeImpl = Stripe(admin, {
  membershipFeeInCents: membership_fee_in_cents,
  secretKeys: { live, test }
})
const users2Contacts = Users2Contacts(admin)
const updateEvents = UpdateEvents(admin, app_id, city_id)

const ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS = 180

export const purgeUsersUnder13CronJob = functions
  .runWith({ timeoutSeconds: ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS })
  .pubsub
  .schedule('10 */6 * * *')
  .onRun(async () => await purgeUsersUnder13())

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
      await users2Contacts()
      info('users2ContactsCronJob: done')
    } catch (err) {
      error('While calling users2ContactsCronJob.', { err })
    }
  })

export const contacts2MailChimpCronJob = functions
  .runWith({ timeoutSeconds: ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS })
  .pubsub
  .schedule('40 */6 * * *')
  .onRun(async () => {
    try {
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
  .pubsub
  .schedule('*/20 * * * *')
  .onRun(async () => await updateEvents())

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
      error('While calling ical.', { err })
      res.status(500).send('Internal Server Error')
    }
  })

export const stripe = functions
  .runWith({ memory: '512MB' })
  .https.onCall(stripeImpl)

export const addContact = functions
  .runWith({ memory: '512MB' })
  .https
  .onCall(addContactImpl)

export const getMembers = functions
  .runWith({ timeoutSeconds: 30, memory: '512MB' })
  .https
  .onCall(getMembersImpl)

export const deleteUser = functions
  .runWith({ timeoutSeconds: 30, memory: '512MB' })
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
    await deleteUserImpl({ uid: targetUID, email: targetEmail })
  })

export const sendMembershipRemindersCronJob = functions
  .runWith({ timeoutSeconds: ITERATION_ON_ACCOUNTS_TIMEOUT_IN_SECONDS })
  .pubsub
  .schedule('0 19 * * *')
  .onRun(async () => await sendMembershipReminders())
