import * as Admin from 'firebase-admin'
import { User } from './User'
import calc from './membershipUtils'

const _ = require('underscore')
const moment = require('moment')
const BPromise = require('bluebird')
const intervals = _.uniq([14, 7, 1, -3])
const max = _.max(intervals)

export interface OutgoingEmailsConfig {
  from: string
  to_uids: string | undefined // used for testing.  Do not use in production.
  reply_to: string | undefined
  bcc_uids: string | undefined
}

export default (admin: Admin.app.App, config: OutgoingEmailsConfig) => {
  const firestore = admin.firestore()

  const toUids: string[] | undefined = (config.to_uids && config.to_uids
    .split(',')
    .map((uid: string) => uid.trim())
    .filter((uid: string) => !!uid)) || undefined
  const bccUids: string[] | undefined = (config.bcc_uids && config.bcc_uids
    .split(',')
    .map((uid: string) => uid.trim())
    .filter((uid: string) => !!uid)) || undefined
  config.reply_to = config.reply_to && config.reply_to.length ? config.reply_to : undefined
  config.bcc_uids = config.bcc_uids && config.bcc_uids.length ? config.bcc_uids : undefined

  return async () => {
    const usersCollection: FirebaseFirestore.QuerySnapshot = await firestore.collection('users').get()
    const users: User[] = []
    usersCollection
      .forEach((userDoc: FirebaseFirestore.QueryDocumentSnapshot) => {
        users.push(userDoc.data() as User)
      })

    console.log('users loaded.  count:', users.length)

    interface MailDocument {
      from: string
      replyTo: string | undefined
      toUids: string[]
      bccUids: string[] | undefined
      template: {
        name: string,
        data: {}
      }
    }

    const mails: MailDocument[] = []
    users
      .forEach((user: User) => {
        if (!calc(user, moment.duration(max, 'days')).isMembershipExpiresSoon) {
          console.log('user membership does not expire soon. uid:', user.uid)
          return
        }

        console.log('found user whom membership expires soon.', user)

        intervals.forEach((interval: number) => {
          if (moment(user.membershipExpiresAt).diff(moment(), 'days') === interval) {
            const mail: MailDocument = {
              from: config.from,
              replyTo: config.reply_to,
              toUids: toUids || [user.uid],
              bccUids,
              template: {
                name: 'membershipExpires',
                data: {
                  ...user,
                  expiredFromNow: moment(user.membershipExpiresAt).fromNow()
                }
              }
            }
            mails.push(mail)
          }
        })
      })
    await BPromise.each(mails, (mail: MailDocument) => firestore.collection('mail').add(mail))
    return
  }
}
