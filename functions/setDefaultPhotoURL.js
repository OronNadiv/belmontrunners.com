const { PHOTO_URL } = require('./fields')
const Promise = require('bluebird')

module.exports = (admin) => {
  const auth = admin.auth()

  const listAllUsers = async (nextPageToken) => {
    // List batch of users, 1000 at a time.
    const listUsersResult = await auth.listUsers(1000, nextPageToken)
    await Promise.each(listUsersResult.users, async (userRecord) => {
      try {
        const { uid, providerData, photoURL } = userRecord.toJSON()
        if (!photoURL) {
          const foundProviderData = providerData.find(({ photoURL }) => {
            return Boolean(photoURL)
          })
          if (foundProviderData) {
            console.log('uid:', uid, 'photoURL:', photoURL, 'foundProviderData.photoURL:', foundProviderData.photoURL)
            await admin.auth().updateUser(uid, { [PHOTO_URL]: foundProviderData[PHOTO_URL] })
          }
        }
      } catch (err) {
        console.error(err)
      }
    })
    console.info('checking listUsersResult.pageToken', listUsersResult.pageToken)
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
