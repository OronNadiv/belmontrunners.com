#!/usr/bin/env node

const admin = require("firebase-admin")
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com"
})

const copyAuthValues = require('./copyAuthValues')

copyAuthValues(admin)()
  .then(() => {
    process.exit(0)
    return 0
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
