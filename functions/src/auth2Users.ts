import * as Admin from 'firebase-admin'
import { Firestore } from 'firebase-admin/firestore'
import { Auth } from 'firebase-admin/auth'
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

export default class Auth2Users {
  private firestore: Firestore
  private auth: Auth

  constructor(admin: Admin.app.App) {
    this.firestore = admin.firestore()
    this.auth = admin.auth()
  }

  async Sync(userRecord: UserRecord, options: Auth2UsersOptions) {
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
      const userRef = this.firestore.doc(`users/${uid}`)
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
  }

  async SyncAll(options: Auth2UsersOptions) {

    const listAllUsers = async (nextPageToken?: string) => {
      // List batch of users, 1000 at a time.
      const listUsersResult = await this.auth.listUsers(1000, nextPageToken)
      // We want to sync the most active acccounts first.
      listUsersResult.users.sort((userRecord1: UserRecord, userRecord2: UserRecord) => {
        const lastSignInTime1 = moment(userRecord1.metadata.lastSignInTime)
        const lastSignInTime2 = moment(userRecord2.metadata.lastSignInTime)
        return lastSignInTime2.diff(lastSignInTime1)
      })
      await each(listUsersResult.users, async (userRecord: UserRecord) => {
        await this.Sync(userRecord, options);
      })
      info(
        `checking listUsersResult.pageToken: ${listUsersResult.pageToken} num of results previously found: ${listUsersResult.users.length}`)
      if (listUsersResult.pageToken) {
        // List next batch of users.
        await listAllUsers(listUsersResult.pageToken)
      } else {
        info('Done.  Exiting...')
        return
      }
    }

    // Start listing users from the beginning, 1000 at a time.

    return listAllUsers()
  }
}


