const {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  DISPLAY_NAME,
  EMAIL,
  GENDER,
  MEMBERS,
  MEMBERSHIP_EXPIRES_AT,
  PHONE,
  PHOTO_URL,
  ONLY_ME,
  STATE,
  UID,
  ZIP
} = require('./fields')

const moment = require('moment')
const _ = require('underscore')
const functions = require('firebase-functions')
const IS_MEMBER = 'isMember'
const isMember = (user) => user[MEMBERSHIP_EXPIRES_AT] && moment(user[MEMBERSHIP_EXPIRES_AT]).isAfter(moment())

const defaultVisibility = {
  [UID]: MEMBERS,
  [DISPLAY_NAME]: MEMBERS,
  [EMAIL]: ONLY_ME,
  [PHOTO_URL]: MEMBERS,
  [PHONE]: ONLY_ME,
  [ADDRESS1]: ONLY_ME,
  [ADDRESS2]: ONLY_ME,
  [CITY]: ONLY_ME,
  [STATE]: ONLY_ME,
  [ZIP]: ONLY_ME,
  [GENDER]: ONLY_ME,
  [DATE_OF_BIRTH]: ONLY_ME,
  [IS_MEMBER]: MEMBERS
}
module.exports = (admin) => {
  const firestore = admin.firestore()
  return async (data, context) => {
    if (!context || !context.auth || !context.auth.uid) {
      throw new functions.https.HttpsError('unauthenticated', 'unauthenticated.')
    }

    const applyFilters = (user) => {
      if (context.auth.uid === user.uid) {
        if (!user.isMember) {
          throw new functions.https.HttpsError('permission-denied', JSON.stringify({
            status: 403,
            message: 'user is not a member.'
          }))
        }
        return user
      }
      const filteredUser = {}
      const { visibility = {} } = user
      _.forEach(user, (value, key) => {
        const currVisibility = visibility[key] || defaultVisibility[key]

        switch (currVisibility) {
          case MEMBERS:
            filteredUser[key] = value
            break
          case ONLY_ME:
          default:
            break
        }
      })
      return filteredUser
    }

    const usersCollection = await firestore.collection('users').get()
    let users = []
    usersCollection.forEach(userDoc => {
      const user = userDoc.data()
      user[UID] = userDoc.id
      user[IS_MEMBER] = isMember(user)
      users.push(user)
    })

    users = _.chain(users)
      .map(applyFilters)
      .filter((user) => user[IS_MEMBER])
      .sortBy((user) => user[DISPLAY_NAME].toLowerCase())
      .value()
    return users
  }
}