#!/usr/bin/env node

import * as Admin from 'firebase-admin'
import SendMembershipReminders from './sendMembershipReminders'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})
SendMembershipReminders(admin)()
    .then((res) => {
      console.info('done', res)
      return
    })
    .catch((err) => {
      console.info('err', err)
    })
