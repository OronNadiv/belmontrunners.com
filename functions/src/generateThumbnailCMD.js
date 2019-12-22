#!/usr/bin/env node

const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})

const process = require('./processImage')(admin)

process({
  doc: 'photos/items',
  fileName: 'edb1e972-7127-41e2-a249-4ed9a1c88573'
})
