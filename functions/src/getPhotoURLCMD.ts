#!/usr/bin/env node

import * as Admin from 'firebase-admin'
import GetPhotoURL from './getPhotoURL'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})


GetPhotoURL(admin)()
  .then((res) => {
    console.info('GetPhotoUrl:', res)
    // const copyAuthValues = require('./setDefaultPhotoURL')
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
