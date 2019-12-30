import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/functions'
import 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyCQBAUE701EBXnT-OBnEPq7Zuft4qyC4tc',
  authDomain: 'belmont-runners-1548537264040.firebaseapp.com',
  databaseURL: 'https://belmont-runners-1548537264040.firebaseio.com',
  projectId: 'belmont-runners-1548537264040',
  storageBucket: 'belmont-runners-1548537264040.appspot.com',
  messagingSenderId: '623861554235',
  appId: '1:623861554235:web:8448e17bb1825a51c2101e',
  measurementId: 'G-XMHNXZ9JDK'
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export const analytics = firebase.analytics()
export const auth = firebase.auth()
export const firestore = firebase.firestore()
export const functions = firebase.functions()
