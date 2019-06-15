const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const process = require('./processImage')

const runtimeOpts = {
  timeoutSeconds: 120,
  memory: '1GB'
}
exports.updatePhotosHTTP = functions
  .runWith(runtimeOpts)
  .https.onCall(process(admin))
