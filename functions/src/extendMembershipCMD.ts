#!/usr/bin/env node
import * as Admin from 'firebase-admin'
import extendMembership from './extendMembership'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})

extendMembership(admin)()
  .then(() => {
    console.info('extendMembership is done.')
  })
  .catch((err) => {
    console.info('err', err)
  })
