#!/usr/bin/env node

import * as Admin from 'firebase-admin'
import addContact from './addContact'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount)
})

const data = {
  email: 'test@test.com'
}
addContact(admin)(data)
  .then((res) => {
    console.info('done', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
