const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const generateThumbnail = require('./generateThumbnail')(admin)
const copyAuthValues = require('./copyAuthValues')(admin)

const runtimeOpts = {
  timeoutSeconds: 120,
  memory: '1GB'
}
exports.generateThumbnailHTTP = functions
  .runWith(runtimeOpts)
  .https.onCall(generateThumbnail)

exports.copyAuthValuesCrontab = functions.pubsub
  .schedule('0 * * * *')
  .onRun(copyAuthValues)
