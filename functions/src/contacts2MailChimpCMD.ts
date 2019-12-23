#!/usr/bin/env node
import * as Admin from 'firebase-admin'
import contacts2MailChimp from './contacts2MailChimp'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})


const apiKey: string | undefined = process.env['mailchimp.apikey']
if (apiKey === undefined) {
  throw new Error('process.env[\'mailchimp.apikey\'] is missing.')
}

contacts2MailChimp(admin, apiKey)()
  .then((res) => {
    console.info('done', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
