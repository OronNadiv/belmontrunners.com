#!/usr/bin/env node

import DeleteUser from './deleteUser'
import * as Admin from 'firebase-admin'

const serviceAccount = require('../serviceAccountKey.json')
const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount)
})

const apiKey: string | undefined = process.env['mailchimp.apikey']
if (apiKey === undefined) {
  throw new Error('process.env[\'mailchimp.apikey\'] is missing.')
}

const deleteUser = DeleteUser(admin, apiKey)

const uid = '<ENTER UID>'
const email = '<ENTER EMAIL>'

deleteUser({ uid, email })
  .then((res) => {
    console.info('done', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
