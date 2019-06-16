#!/usr/bin/env node

const moment = require('moment')
const Promise = require('bluebird')


module.exports = (admin) => {
  const firestore = admin.firestore()
  const auth = admin.auth()

  const listAllUsers = async (nextPageToken) => {
    // List batch of users, 1000 at a time.
    const listUsersResult = await auth.listUsers(1000, nextPageToken)
    await Promise.each(listUsersResult.users, async (userRecord) => {
      try {
        const { uid, emailVerified, metadata: { creationTime, lastSignInTime } } = userRecord.toJSON()
        let createdAt = moment(creationTime).utc().format()
        let lastSignedInAt = moment(lastSignInTime).utc().format()
        const userRef = firestore.doc(`users/${uid}`)
        await userRef.set({ createdAt, lastSignedInAt, emailVerified }, { merge: true })
        console.info(`Updated ${uid} ${createdAt} ${lastSignedInAt}`)
      } catch (err) {
        console.error(err)
      }
    })
    console.info('checking listUsersResult.pageToken', listUsersResult.pageToken)
    if (listUsersResult.pageToken) {
      // List next batch of users.
      await listAllUsers(listUsersResult.pageToken)
    } else {
      console.info('Done.  Exiting...')
    }
  }

// Start listing users from the beginning, 1000 at a time.


  return listAllUsers
}
