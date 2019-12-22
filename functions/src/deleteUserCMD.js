#!/usr/bin/env node

import { EMAIL, UID } from './fields'

const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const process = require('./deleteUser')(admin)

const uid = '<ENTER UID>'
const email = '<ENTER EMAIL>'
const run = async () => {
  await process({ [UID]: uid, [EMAIL]: email })
  console.info('done')
}

run()
