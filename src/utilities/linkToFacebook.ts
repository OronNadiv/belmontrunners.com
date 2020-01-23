import firebase from 'firebase/app'

import { PHOTO_URL } from '../fields'
import { IUser } from '../entities/User'
import { IUpdateUserData } from '../reducers/currentUser'

export const linkToFacebook = async (firebaseUser: firebase.User, userData: IUser, updateUserData: IUpdateUserData) => {
  try {
    await firebaseUser.linkWithPopup(new firebase.auth.FacebookAuthProvider())

    let photoUrl = userData.photoURL
    if (!photoUrl) {
      const foundProviderData = firebaseUser.providerData.find(
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

export const unlinkFromFacebook = async (firebaseUser: firebase.User, updateUserData: IUpdateUserData) => {
  try {
    console.log('UnlinkFromFacebook called.')
    await firebaseUser.unlink('facebook.com')
    const foundProviderData = firebaseUser.providerData.find(
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
