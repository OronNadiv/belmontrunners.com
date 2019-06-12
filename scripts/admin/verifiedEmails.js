#!/usr/bin/env node

const admin = require("firebase-admin")
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com"
})

const auth = admin.auth()

const listAllUsers = async (nextPageToken) => {
  // List batch of users, 1000 at a time.
  const listUsersResult = await auth.listUsers(1000, nextPageToken)
  listUsersResult.users.forEach(async (userRecord) => {
    try {
      const { uid } = userRecord.toJSON()
      const emailVerified = false
      await auth.updateUser(uid, {
        emailVerified
      })
      console.log(`Updated ${uid} ${emailVerified}`)
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

