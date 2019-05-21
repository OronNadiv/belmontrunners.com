import 'firebase/auth'
import "firebase/firestore"
import firebase from 'firebase'
import moment from "moment"
import Promise from 'bluebird'

const publicIp = require('public-ip')

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
