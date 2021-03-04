import * as Admin from 'firebase-admin'
import DeleteUser from './deleteUser'
import { User } from './User'

const BPromise = require('bluebird')
const moment = require('moment')

const PurgeUsersUnder13 = (admin: Admin.app.App, apiKey: string, shouldDelete: boolean) => {
  const firestore = admin.firestore()
  const deleteUser = DeleteUser(admin, apiKey)
  return async () => {
    const usersCollection: FirebaseFirestore.QuerySnapshot = await firestore.collection('users').get()

    const usersToDelete: User[] = []
    usersCollection.forEach((userDoc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const user: User = userDoc.data() as User
      user.uid = userDoc.id
      if (
        user.dateOfBirth &&
        moment().diff(moment(user.dateOfBirth), 'years') < 13
      ) {
        usersToDelete.push(user)
      }
    })

    await BPromise.each(usersToDelete, (async (user: User) => {
      console.error('Will be deleted:', JSON.stringify(user))
      // see which one were about to be deleted.  you may need to communicate it with their parents.
      shouldDelete ? await deleteUser(user) : await Promise.resolve()
    }))
  }
}

export default PurgeUsersUnder13
