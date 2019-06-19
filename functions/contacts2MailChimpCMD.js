#!/usr/bin/env node

const admin = require('firebase-admin')
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com"
})

const contacts2MailChimp = require('./contacts2MailChimp')(admin)

const run = async () => {
  await contacts2MailChimp()
  console.info('done')
}

run()
