import * as Admin from 'firebase-admin'
import { UserRecord } from 'firebase-functions/lib/providers/auth'
import { User } from './User'

const moment = require('moment')
const BPromise = require('bluebird')
const gravatar = require('gravatar')
const rp = require('request-promise')

const Auth2Users = (admin: Admin.app.App) => {
  const firestore = admin.firestore()
  const auth = admin.auth()

  const listAllUsers = async (nextPageToken?: string) => {
    // List batch of users, 1000 at a time.
    const listUsersResult = await auth.listUsers(1000, nextPageToken)
    await BPromise.each(listUsersResult.users, async (userRecord: UserRecord) => {
      try {
        const {
          uid,
          email,
          emailVerified,
          displayName,
          metadata: { creationTime, lastSignInTime }
        } = userRecord
        const gravatarUrl = gravatar.url(email, {
          protocol: 'https',
          default: '404'
        })
        let hasGravatar
        try {
          await rp(gravatarUrl)
          console.log('found gravatar:', gravatarUrl)
          hasGravatar = true
        } catch (error) {
          console.log('did not find gravatar:', gravatarUrl)
          hasGravatar = false
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
        console.info(`Updated ${uid} ${createdAt} ${lastSignedInAt}`)
      } catch (err) {
        console.error('Error while syncing auth2user.',
            'uid:', userRecord.uid,
            'error:',err);
      }
    })
    console.info(
      'checking listUsersResult.pageToken:', listUsersResult.pageToken,
        'num of results previously found:', listUsersResult.users.length)
    if (listUsersResult.pageToken) {
      // List next batch of users.
      await listAllUsers(listUsersResult.pageToken)
    } else {
      console.info('Done.  Exiting...')
      return
    }
  }

  // Start listing users from the beginning, 1000 at a time.

  return listAllUsers
}

export default Auth2Users
