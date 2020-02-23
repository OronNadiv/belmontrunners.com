#!/usr/bin/env node

import * as Admin from 'firebase-admin'
import updateEvents from './updateEvents'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})
updateEvents(admin)()
  .then((res: any) => {
    console.info('done', res)
    return
  })
  .catch((err: any) => {
    console.info('err', err)
  })
