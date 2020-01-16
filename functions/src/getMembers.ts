import { https } from 'firebase-functions'
import * as Admin from 'firebase-admin'
import { User, Visibility, VisibilityEnum } from './User'
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
  PHONE,
  PHOTO_URL,
  STATE,
  UID,
  ZIP
} from './fields'
import * as _ from 'underscore'

const defaultVisibility: Visibility = {
  [UID]: VisibilityEnum.MEMBERS,
  [DISPLAY_NAME]: VisibilityEnum.MEMBERS,
  [EMAIL]: VisibilityEnum.ONLY_ME,
  [PHOTO_URL]: VisibilityEnum.MEMBERS,
  [PHONE]: VisibilityEnum.ONLY_ME,
  [ADDRESS1]: VisibilityEnum.ONLY_ME,
  [ADDRESS2]: VisibilityEnum.ONLY_ME,
  [CITY]: VisibilityEnum.ONLY_ME,
  [STATE]: VisibilityEnum.ONLY_ME,
  [ZIP]: VisibilityEnum.ONLY_ME,
  [GENDER]: VisibilityEnum.ONLY_ME,
  [DATE_OF_BIRTH]: VisibilityEnum.ONLY_ME,
  [GRAVATAR_URL]: VisibilityEnum.MEMBERS
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

      Object.keys(user.visibility || {}).forEach((key) => {
        // @ts-ignore
        const value = user.visibility[key]
        // @ts-ignore
        const currVisibility: VisibilityEnum = value ? value : defaultVisibility[key]

        switch (currVisibility) {
          case VisibilityEnum.MEMBERS:
            filteredUser[key] = value
            return undefined
          case VisibilityEnum.ONLY_ME:
          default:
            return undefined
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
