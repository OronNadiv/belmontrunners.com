import * as Admin from 'firebase-admin'
import { UserRecord } from 'firebase-functions/lib/providers/auth'
import { info, error } from "firebase-functions/logger"
import { User } from './User'
import { each } from 'bluebird'
import got from 'got'

const moment = require('moment')
const gravatar = require('gravatar')


export interface Auth2UsersOptions {
  syncGravatar: boolean
}

const Auth2Users = (admin: Admin.app.App) => {
  const firestore = admin.firestore()
  const auth = admin.auth()

  const listAllUsers = async (options: Auth2UsersOptions, nextPageToken?: string) => {
    // List batch of users, 1000 at a time.
    const listUsersResult = await auth.listUsers(1000, nextPageToken)
    // Since this function is called upon creation of a new account, we want to
    // sync the newest acccounts first.
    listUsersResult.users.sort((userRecord1: UserRecord, userRecord2: UserRecord) => {
      const createdAt1 = moment(userRecord1.metadata.creationTime)
      const createdAt2 = moment(userRecord2.metadata.creationTime)
      return createdAt2.diff(createdAt1)
    })
    await each(listUsersResult.users, async (userRecord: UserRecord) => {
      try {
        const {
          uid,
          email,
          emailVerified,
          displayName,
          metadata: { creationTime, lastSignInTime },
        } = userRecord


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
          lastSignedInAt
        }

        if (options.syncGravatar) {
          let hasGravatar = false
          const gravatarUrl = gravatar.url(email, {
            protocol: 'https',
            default: '404'
          })
          try {
            await got.get(gravatarUrl)
            info('found gravatar.', { gravatarUrl })
            hasGravatar = true
          } catch (err) {
            info('Error while fetching gravatar.', { gravatarUrl, error: err })
          }
          data.gravatarUrl = hasGravatar ? gravatarUrl : null
        }

        await userRef.set(data, { merge: true })
        info(`Updated ${uid} ${createdAt} ${lastSignedInAt}`)
      } catch (err) {
        error('Error while syncing auth2user.', { 'uid': userRecord.uid, 'error': err });
      }
    })
    info(
      `checking listUsersResult.pageToken: ${listUsersResult.pageToken} num of results previously found: ${listUsersResult.users.length}`)
    if (listUsersResult.pageToken) {
      // List next batch of users.
      await listAllUsers(options, listUsersResult.pageToken)
    } else {
      info('Done.  Exiting...')
      return
    }
  }

  // Start listing users from the beginning, 1000 at a time.

  return listAllUsers
}

export default Auth2Users
