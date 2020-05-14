#!/usr/bin/env node

import * as Admin from 'firebase-admin'
import updateEvents from './updateEvents'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})

const appId: string | undefined = process.env['openweathermap.app_id']
const cityId: string | undefined = process.env['openweathermap.city_id']
if (!appId) {
  throw new Error('process.env[\'openweathermap.app_id\'] is missing.')
}
if (!cityId) {
  throw new Error('process.env[\'openweathermap.city_id\'] is missing.')
}

updateEvents(admin, appId, cityId)()
  .then((res: any) => {
    console.info('done', res)
    return
  })
  .catch((err: any) => {
    console.info('err', err)
  })
