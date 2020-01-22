import firebase from 'firebase/app'

import { PHOTO_URL } from '../fields'
import { User } from '../entities/User'
import { UpdateUserData } from '../reducers/currentUser'

export const linkToFacebook = async (currentUser: firebase.User, userData: User, updateUserData: UpdateUserData) => {
  try {
    await currentUser.linkWithPopup(new firebase.auth.FacebookAuthProvider())

    let photoUrl = userData.photoURL
    if (!photoUrl) {
      const foundProviderData = currentUser.providerData.find(
        (userInfo) => {
          return userInfo && Boolean(userInfo.photoURL)
        }
      )
      if (foundProviderData && foundProviderData.photoURL) {
        photoUrl = foundProviderData.photoURL
      }
    }
    // doing this in order to trigger an update.
    await updateUserData({ [PHOTO_URL]: photoUrl }, { merge: true })
  } catch (err) {
    console.log('err:', err)
    throw new Error('Connection failed')
  }
}

export const unlinkFromFacebook = async (currentUser: firebase.User, updateUserData: UpdateUserData) => {
  try {
    console.log('UnlinkFromFacebook called.')
    await currentUser.unlink('facebook.com')
    const foundProviderData = currentUser.providerData.find(
      (userInfo) => {
        return userInfo && Boolean(userInfo.photoURL)
      }
    )
    const photoUrl = foundProviderData ? foundProviderData.photoURL : null
    console.log('foundProviderData :', foundProviderData)
    console.log('photoUrl :', photoUrl)
    // doing this in order to trigger an update.
    await updateUserData({ [PHOTO_URL]: null }, { merge: true })
  } catch (err) {
    console.log('err:', err)
    throw new Error('Disconnection failed')
  }
}
