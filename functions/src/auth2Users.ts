import * as Admin from 'firebase-admin'
import { UserRecord } from 'firebase-functions/lib/providers/auth'
import { info, error } from "firebase-functions/logger"
import { User } from './User'
import { each } from 'bluebird'
import got from 'got'

const moment = require('moment')
const gravatar = require('gravatar')

const Auth2Users = (admin: Admin.app.App) => {
  const firestore = admin.firestore()
  const auth = admin.auth()

  const listAllUsers = async (nextPageToken?: string) => {
    // List batch of users, 1000 at a time.
    const listUsersResult = await auth.listUsers(1000, nextPageToken)
    await each(listUsersResult.users, async (userRecord: UserRecord) => {
      try {
        const {
          uid,
          email,
          emailVerified,
          displayName,
          metadata: { creationTime, lastSignInTime },
        } = userRecord
        const gravatarUrl = gravatar.url(email, {
          protocol: 'https',
          default: '404'
        })
        let hasGravatar = false
        try {
          await got.get(gravatarUrl)
          info('found gravatar.', {gravatarUrl})
          hasGravatar = true
        } catch (err) {
          info('Error while fetching gravatar.', {gravatarUrl, error: err})
        }

        const createdAt = moment(creationTime)
          .utc()
          .format()
        const lastSignedInAt: string = moment(lastSignInTime)
          .utc()
          .format()
        const userRef = firestore.doc(`users/${uid}`)
        const data: User = {
          uid,
          createdAt,
          email: email || '',
          emailVerified,
          displayName: displayName || '',
          lastSignedInAt,
          gravatarUrl: hasGravatar ? gravatarUrl : null
        }
        await userRef.set(data, { merge: true })
        info(`Updated ${uid} ${createdAt} ${lastSignedInAt}`)
      } catch (err) {
        error('Error while syncing auth2user.', {'uid': userRecord.uid, 'error': err});
      }
    })
    info(
      'checking listUsersResult.pageToken:', listUsersResult.pageToken,
        'num of results previously found:', listUsersResult.users.length)
    if (listUsersResult.pageToken) {
      // List next batch of users.
      await listAllUsers(listUsersResult.pageToken)
    } else {
      info('Done.  Exiting...')
      return
    }
  }

  // Start listing users from the beginning, 1000 at a time.

  return listAllUsers
}

export default Auth2Users
