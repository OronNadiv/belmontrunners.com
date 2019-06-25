#!/usr/bin/env node

const admin = require('firebase-admin')
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const process = require('./addContact')(admin)

process({
  email: 'test@test.com'
})
