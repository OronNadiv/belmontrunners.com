#!/usr/bin/env node

import * as Admin from 'firebase-admin'
import sendMembershipRenewalEmails from './sendMembershipRenewalEmails'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})
const from: string | undefined = process.env['outgoing_emails.from']
const to_uids: string | undefined = process.env['outgoing_emails.to_uids']
const bcc_uids: string | undefined = process.env['outgoing_emails.bcc_uids']
const reply_to: string | undefined = process.env['outgoing_emails.reply_to']

if (!from) {
  throw new Error('process.env[\'outgoing_emails.from\'] is missing.')
}
if (!to_uids) {
  throw new Error('process.env[\'outgoing_emails.to_uids\'] is missing.')
}

sendMembershipRenewalEmails(admin, { from, to_uids, bcc_uids, reply_to })()
  .then((res) => {
    console.info('done', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
