#!/usr/bin/env node

const admin = require('firebase-admin')
const serviceAccount = require("./serviceAccountKey.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const process = require('./deleteUser')(admin)

const data = {
  uid: 'TpcFxzs0lnVgwzkozrB7g1xGjS13'
}
const context = { auth: { uid: 'jL4tNueYfwYlVo32j2ydXCtepXJ3' } }
process(data, context)
