#!/usr/bin/env node

import * as admin from 'firebase-admin'
import GetPhotoUrl from './getPhotoUrl'

const serviceAccount = require('../serviceAccountKey.json')

const a: admin.app.App = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})


GetPhotoUrl(a)()
  .then((res) => {
    console.info('GetPhotoUrl:', res)
    // const copyAuthValues = require('./setDefaultPhotoURL')
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
