#!/usr/bin/env node

const admin = require("firebase-admin")
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com"
})

const copyAuthValues = require('./setDefaultPhotoURL')

const run = async () => {
  await copyAuthValues(admin)()
  console.info('done')
  process.exit(0)
}

run()
