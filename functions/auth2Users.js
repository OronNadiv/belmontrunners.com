const moment = require('moment')
const Promise = require('bluebird')
const gravatar = require('gravatar')
const rp = require('request-promise')
const { GRAVATAR_URL } = require('./fields')

module.exports = admin => {
  const firestore = admin.firestore()
  const auth = admin.auth()

  const listAllUsers = async nextPageToken => {
    // List batch of users, 1000 at a time.
    const listUsersResult = await auth.listUsers(1000, nextPageToken)
    await Promise.each(listUsersResult.users, async userRecord => {
      try {
        const {
          uid,
          email,
          emailVerified,
          displayName,
          metadata: { creationTime, lastSignInTime }
        } = userRecord.toJSON()
        const gravatarUrl = gravatar.url(email, {
          protocol: 'https',
          default: '404'
        })
        let hasGravatar
        try {
          await rp(gravatarUrl)
          console.log('found gravatar:', gravatarUrl)
          hasGravatar = true
        } catch (error) {
          console.log('did not find gravatar:', gravatarUrl)
          hasGravatar = false
        }

        let createdAt = moment(creationTime)
          .utc()
          .format()
        let lastSignedInAt = moment(lastSignInTime)
          .utc()
          .format()
        const userRef = firestore.doc(`users/${uid}`)
        let data = {
          createdAt,
          email,
          emailVerified,
          displayName,
          lastSignedInAt,
          [GRAVATAR_URL]: hasGravatar ? gravatarUrl : null
        }
        await userRef.set(data, { merge: true })
        console.info(`Updated ${uid} ${createdAt} ${lastSignedInAt}`)
      } catch (err) {
        console.error(err)
      }
    })
    console.info(
      'checking listUsersResult.pageToken',
      listUsersResult.pageToken
    )
    if (listUsersResult.pageToken) {
      // List next batch of users.
      await listAllUsers(listUsersResult.pageToken)
    } else {
      console.info('Done.  Exiting...')
    }
  }

  // Start listing users from the beginning, 1000 at a time.

  return listAllUsers
}
