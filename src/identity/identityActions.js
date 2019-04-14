import firebase from 'firebase'
import 'firebase/auth'
import "firebase/firestore"
import s from "underscore.string"
import moment from "moment"
import Promise from 'bluebird'

const publicIp = require('public-ip')

const PREFIX = 'IDENTITY'

export const SIGN_IN_START = `${PREFIX}_SIGN_IN_START`
export const SIGN_IN_SUCCEEDED = `${PREFIX}_SIGN_IN_SUCCEEDED`
export const SIGN_IN_FAILED = `${PREFIX}_SIGN_IN_FAILED`

export const SIGN_UP_START = `${PREFIX}_SIGN_UP_START`
export const SIGN_UP_SUCCEEDED = `${PREFIX}_SIGN_UP_SUCCEEDED`
export const SIGN_UP_FAILED = `${PREFIX}_SIGN_UP_FAILED`

export const SIGN_OUT_START = `${PREFIX}SIGN_OUT_START`
export const SIGN_OUT_SUCCEEDED = `${PREFIX}_SIGN_OUT_SUCCEEDED`
export const SIGN_OUT_FAILED = `${PREFIX}_SIGN_OUT_FAILED`

export const SEND_PASSWORD_RESET_EMAIL_START = `${PREFIX}SEND_PASSWORD_RESET_EMAIL_START`
export const SEND_PASSWORD_RESET_EMAIL_SUCCEEDED = `${PREFIX}_SEND_PASSWORD_RESET_EMAIL_SUCCEEDED`
export const SEND_PASSWORD_RESET_EMAIL_FAILED = `${PREFIX}_SEND_PASSWORD_RESET_EMAIL_FAILED`

const providerGoogle = new firebase.auth.GoogleAuthProvider()
const providerFacebook = new firebase.auth.FacebookAuthProvider()

export const signIn = (providerName, params) => {
  return (dispatch) => {
    dispatch({
      type: SIGN_IN_START
    })

    let promise
    switch (providerName.toLowerCase()) {
      case 'facebook':
        promise = firebase.auth().signInWithPopup(providerFacebook)
        break
      case 'google':
        promise = firebase.auth().signInWithPopup(providerGoogle)
        break
      case 'email':
      default:
        promise = firebase.auth().signInWithEmailAndPassword(params.email, params.password)
        break


    }
    Promise.all([
      publicIp.v4(),
      promise
    ])
      .spread((ip, { user: { uid } }) => {
        console.log('signed in', uid)
        const docRef = firebase.firestore().doc(`users/${uid}/visits/${moment.utc().format()}`)
        return docRef.set({
          ip,
          signInMethod: providerName
        })
      })
      .then(() => {
        dispatch({
          type: SIGN_IN_SUCCEEDED
        })
      })
      .catch((error) => {
        console.log('error while signing in', error)
        dispatch({
          type: SIGN_IN_FAILED,
          error
        })
      })
  }
}
export const signUp = (fullName, email, password) => {
  return (dispatch) => {
    dispatch({
      type: SIGN_UP_START
    })

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('calling updateProfile')
        const displayName = s.words(fullName).map((w) => s.capitalize(w)).join(" ")
        console.log('displayName:', displayName)
        return firebase.auth().currentUser.updateProfile({
          displayName
        })
      })
      .then(() => {
        dispatch({
          type: SIGN_UP_SUCCEEDED
        })
      }).catch((error) => {
      dispatch({
        type: SIGN_UP_FAILED,
        error
      })
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

export const sendPasswordResetEmail = (email) => {
  return (dispatch) => {
    dispatch({
      type: SEND_PASSWORD_RESET_EMAIL_START
    })

    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        dispatch({
          type: SEND_PASSWORD_RESET_EMAIL_SUCCEEDED
        })
      })
      .catch((error) => {
        dispatch({
          type: SEND_PASSWORD_RESET_EMAIL_FAILED,
          error
        })
      })
  }
}
