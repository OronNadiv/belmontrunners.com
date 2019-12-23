#!/usr/bin/env node

import * as admin from 'firebase-admin'
import purgeUsersUnder13 from './purgeUsersUnder13'

const serviceAccount = require('../serviceAccountKey.json')

const a: admin.app.App = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})
const apiKey: string | undefined = process.env['mailchimp.apikey']
if (apiKey === undefined) {
  throw new Error('process.env[\'mailchimp.apikey\'] is missing.')
}

purgeUsersUnder13(a, apiKey, false)()
  .then((res) => {
    console.info('done', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
