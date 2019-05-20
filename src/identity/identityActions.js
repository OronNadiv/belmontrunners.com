import 'firebase/auth'
import "firebase/firestore"
import firebase from 'firebase'
// import s from "underscore.string"
import moment from "moment"
import Promise from 'bluebird'

const publicIp = require('public-ip')

const PREFIX = 'IDENTITY'

export const SIGN_OUT_START = `${PREFIX}SIGN_OUT_START`
export const SIGN_OUT_SUCCEEDED = `${PREFIX}_SIGN_OUT_SUCCEEDED`
export const SIGN_OUT_FAILED = `${PREFIX}_SIGN_OUT_FAILED`

export const updateUserVisit = (signInMethod) => {
  return (user) => {
    console.log('updateUserVisit: user:', user)
    const { uid, email, displayName, photoURL } = user
    console.log('uid:', uid, 'email:', email, 'displayName:', displayName, 'photoURL:', photoURL)
    return publicIp.v4()
      .then(ip => {
        const currentVisit = firebase.firestore().doc(`users/${uid}/visits/${moment.utc().format()}`)
        const currentUser = firebase.firestore().doc(`users/${uid}`)
        return Promise.all([
          currentVisit.set({
            ip,
            signInMethod
          }),
          currentUser.set({
            email,
            displayName,
            photoURL
          })
        ])
      })
  }
}


export const signOut = () => {
  return (dispatch) => {
    dispatch({
      type: SIGN_OUT_START
    })

    firebase.auth().signOut()
      .then(() => {
        dispatch({
          type: SIGN_OUT_SUCCEEDED
        })
      })
      .catch((error) => {
        dispatch({
          type: SIGN_OUT_FAILED,
          error
        })
      })
  }
}
