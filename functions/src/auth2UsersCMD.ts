#!/usr/bin/env node

import * as admin from 'firebase-admin'
import Auth2Users from './auth2Users'

const serviceAccount = require('../serviceAccountKey.json')

const a: admin.app.App = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})

const auth2Users = Auth2Users(a)
auth2Users()
  .then((res) => {
    console.info('done', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
