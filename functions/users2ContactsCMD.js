#!/usr/bin/env node

const admin = require('firebase-admin')
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com"
})
const sync = require('./users2Contacts')(admin)

const run = async () => {
  try {
    await sync()
    console.info('done')
  } catch (err) {
    console.error('error:', err)
  }
}

run()
