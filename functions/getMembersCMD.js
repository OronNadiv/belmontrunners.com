#!/usr/bin/env node

const admin = require('firebase-admin')
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com"
})

const process = require('./getMembers')(admin)

const run = async () => {
  const res = await process({}, { auth: { uid: 'jL4tNueYfwYlVo32j2ydXCtepXJ3' } })
  console.info(res)
}
run()
