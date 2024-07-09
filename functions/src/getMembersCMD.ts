#!/usr/bin/env node
import * as Admin from 'firebase-admin'
import getMembers from './getMembers'
import { User } from './User'
import { https } from 'firebase-functions'

const serviceAccount = require('../serviceAccountKey.json')

const admin: Admin.app.App = Admin.initializeApp({
  credential: Admin.credential.cert(serviceAccount),
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com'
})

const token: any = {}
const rawRequest: any = {}

const context: https.CallableContext = {
  rawRequest,
  auth: {
    uid: 'jL4tNueYfwYlVo32j2ydXCtepXJ3',
    token
  }
}

getMembers(admin)(
  {},
  context
)
  .then((res: User[]) => {
    console.info('getMembers:', res)
    return
  })
  .catch((err) => {
    console.info('err', err)
  })
