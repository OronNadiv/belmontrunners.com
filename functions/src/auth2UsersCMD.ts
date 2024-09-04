#!/usr/bin/env node

import * as Admin from 'firebase-admin'
import Auth2Users from './auth2Users'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})

const auth2Users = new Auth2Users(admin)
auth2Users.SyncAll({ syncGravatar: true })
  .then((res) => {
    console.info('done', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
