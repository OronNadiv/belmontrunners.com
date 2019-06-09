#!/usr/bin/env node

const admin = require("firebase-admin")
const serviceAccount = require("./serviceAccountKey.json")
const moment = require('moment')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com"
})

const firestore = admin.firestore()
const auth = admin.auth()

const listAllUsers = async (nextPageToken) => {
  // List batch of users, 1000 at a time.
  const listUsersResult = await auth.listUsers(1000, nextPageToken)
  listUsersResult.users.forEach(async (userRecord) => {
    try {
      const { uid, metadata: { creationTime, lastSignInTime } } = userRecord.toJSON()
      let createdAt = moment(creationTime).utc().format()
      let lastSignedInAt = moment(lastSignInTime).utc().format()
      const userRef = firestore.doc(`users/${uid}`)
      await userRef.set({ createdAt, lastSignedInAt }, { merge: true })
      console.log(`Updated ${uid} ${createdAt} ${lastSignedInAt}`)
    } catch (err) {
      console.error(err)
    }
  })
  if (listUsersResult.pageToken) {
    // List next batch of users.
    listAllUsers(listUsersResult.pageToken)
  }
  // process.exit(0)
}

// Start listing users from the beginning, 1000 at a time.
listAllUsers()

