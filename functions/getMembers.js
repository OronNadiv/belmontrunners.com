const gravatar = require('gravatar')

const { calc, IS_A_MEMBER } = require('./membershipUtils')

const {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  DISPLAY_NAME,
  EMAIL,
  GENDER,
  GRAVATAR_URL,
  IS_MEMBER,
  MEMBERS,
  PHONE,
  PHOTO_URL,
  ONLY_ME,
  STATE,
  UID,
  ZIP
} = require('./fields')

const _ = require('underscore')
const functions = require('firebase-functions')
const isMember = (user) => calc(user)[IS_A_MEMBER]

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
  [IS_MEMBER]: MEMBERS,
  [GRAVATAR_URL]: MEMBERS
}
module.exports = (admin) => {
  const firestore = admin.firestore()
  return async (data, context) => {
    if (!context || !context.auth || !context.auth[UID]) {
      throw new functions.https.HttpsError('unauthenticated', 'unauthenticated.')
    }

    const applyFilters = (user) => {
      if (context.auth[UID] === user[UID]) {
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
      user[GRAVATAR_URL] = gravatar.url(userDoc[EMAIL], { protocol: 'https', default: '404' })
      users.push(user)
    })

    users = _.chain(users)
      .map(applyFilters)
      .filter((user) => user[IS_MEMBER])
      .value()
    return users
  }
}
