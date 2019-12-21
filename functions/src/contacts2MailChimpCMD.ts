#!/usr/bin/env node
import * as admin from 'firebase-admin'
import contacts2MailChimp from './contacts2MailChimp'

const serviceAccount = require('../serviceAccountKey.json')

const a: admin.app.App = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})


const apiKey: string | undefined = process.env['mailchimp.apikey']
if (apiKey === undefined) {
  throw new Error('process.env[\'mailchimp.apikey\'] is missing.')
}

contacts2MailChimp(a, apiKey)()
  .then((res) => {
    console.info('done', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
