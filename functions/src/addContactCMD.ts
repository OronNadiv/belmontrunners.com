#!/usr/bin/env node

import * as admin from 'firebase-admin'
import addContact from './addContact'

const serviceAccount = require('../serviceAccountKey.json')

const a: admin.app.App = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const data = {
  email: 'test@test.com'
}
addContact(a)(data)
  .then((res) => {
    console.info('done', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
