import { https } from 'firebase-functions'
import * as Admin from 'firebase-admin'
import { User, Visibility } from './User'
import calc from './membershipUtils'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  DISPLAY_NAME,
  EMAIL,
  GENDER,
  GRAVATAR_URL,
  MEMBERS,
  PHONE,
  PHOTO_URL,
  ONLY_ME,
  STATE,
  UID,
  ZIP
} from './fields'

const _ = require('underscore')

const defaultVisibility: Visibility = {
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
  [GRAVATAR_URL]: MEMBERS
}

export default (admin: Admin.app.App) => {
  const firestore = admin.firestore()
  return async (data: any, context?: https.CallableContext) => {
    if (!context || !context.auth || !context.auth.uid) {
      throw new https.HttpsError(
        'unauthenticated',
        'unauthenticated.'
      )
    }

    const applyFilters = (user: User) => {
      if (!context.auth) {
        throw new https.HttpsError(
          'permission-denied',
          JSON.stringify({
            status: 403,
            message: 'user is not a member.'
          })
        )
      }
      if (context.auth.uid === user.uid) {
        if (!calc(user).isAMember) {
          throw new https.HttpsError(
            'permission-denied',
            JSON.stringify({
              status: 403,
              message: 'user is not a member.'
            })
          )
        }
        return user
      }
      const filteredUser: {
        [key: string]: any
      } = {}

      const { visibility = {} } = user
      _.forEach(user, (value: any, key: string) => {
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

    const usersCollection: FirebaseFirestore.QuerySnapshot = await firestore.collection('users').get()
    let users: any[] = []
    usersCollection.forEach((userDoc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const user = userDoc.data()
      users.push(user)
    })

    users = _.chain(users)
      .filter((user: User) => {
        return calc(user).isAMember
      })
      .map(applyFilters)
      .value()
    return users
  }
}
