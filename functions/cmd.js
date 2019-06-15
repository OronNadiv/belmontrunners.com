#!/usr/bin/env node

const admin = require('firebase-admin')
const serviceAccount = require("../scripts/admin/serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com"
})

const process = require('./processImage')(admin)

process({
  doc: 'photos/items',
  fileName: 'edb1e972-7127-41e2-a249-4ed9a1c88573',
  downloadURL: 'https://firebasestorage.googleapis.com/v0/b/belmont-runners-1548537264040.appspot.com/o/edb1e972-7127-41e2-a249-4ed9a1c88573?alt=media&token=aeeabfb9-ad7e-4bc4-a424-17fa179b990b'
})
