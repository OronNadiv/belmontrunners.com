import 'firebase/auth'
import firebase from 'firebase/app'
import { PHOTO_URL } from '../fields'

export const linkToFacebook = async (currentUser, userData, updateUserData) => {
  try {
    console.log('handleLinkToFacebook called.')
    await currentUser.linkWithPopup(new firebase.auth.FacebookAuthProvider())

    let photoUrl = userData[PHOTO_URL]
    if (!photoUrl) {
      const foundProviderData = currentUser.providerData.find(
        ({ photoURL }) => {
          return Boolean(photoURL)
        }
      )
      if (foundProviderData) {
        photoUrl = foundProviderData[PHOTO_URL]
      }
    }
    // doing this in order to trigger an update.
    await updateUserData({ [PHOTO_URL]: photoUrl }, { merge: true })
  } catch (err) {
    console.log('err:', err)
    throw new Error('Connection failed')
  }
}

export const unlinkFromFacebook = async (currentUser, updateUserData) => {
  try {
    console.log('UnlinkFromFacebook called.')
    await currentUser.unlink('facebook.com')
    const foundProviderData = currentUser.providerData.find(({ photoURL }) => {
      return Boolean(photoURL)
    })
    const photoUrl = foundProviderData ? foundProviderData[PHOTO_URL] : null
    console.log('foundProviderData :', foundProviderData)
    console.log('photoUrl :', photoUrl)
    // doing this in order to trigger an update.
    await updateUserData({ [PHOTO_URL]: photoUrl }, { merge: true })
  } catch (err) {
    console.log('err:', err)
    throw new Error('Disconnection failed')
  }
}
