const moment = require('moment')
const { DATE_OF_BIRTH, UID } = require('./fields')

module.exports = (admin) => {
  // const deleteUser = require('./deleteUser')(admin)
  const firestore = admin.firestore()
  return async () => {
    const usersCollection = await firestore.collection('users').get()

    const usersToDelete = []
    usersCollection.forEach(userDoc => {
      const user = userDoc.data()
      user[UID] = userDoc.id
      if (user[DATE_OF_BIRTH] && moment().diff(moment(user[DATE_OF_BIRTH]), 'years') < 13) {
        usersToDelete.push(user)
      }
    })

    usersToDelete.forEach(async (user) => {
      console.error('would have deleted:', JSON.stringify(user))
      // see which one were about to be deleted.  you may need to communicate it with their parents.
      // await deleteUser(user)
    })
  }
}
