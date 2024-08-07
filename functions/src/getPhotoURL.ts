import * as Admin from 'firebase-admin'
import { each } from 'bluebird'

const GetPhotoUrl = (admin: Admin.app.App) => {
  const auth = admin.auth()

  const listAllUsers = async (nextPageToken?: string) => {
    // List batch of users, 1000 at a time.
    const listUsersResult = await auth.listUsers(1000, nextPageToken)
    await each(listUsersResult.users, async (userRecord: Admin.auth.UserRecord) => {
      try {
        const foundProviderData = userRecord.providerData.find(({ photoURL }) => {
          return Boolean(photoURL)
        })
        if (foundProviderData) {
          console.log(`uid: ${userRecord.uid}
photoURL: ${userRecord.photoURL}
foundProviderData.photoURL: ${foundProviderData.photoURL}
`)
        }
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

export default GetPhotoUrl
