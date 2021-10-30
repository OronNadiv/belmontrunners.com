import {initializeApp} from 'firebase/app'
import {getAuth} from 'firebase/auth';
import {Firestore, initializeFirestore} from 'firebase/firestore';
import {getFunctions} from 'firebase/functions';
import {getAnalytics} from 'firebase/analytics';

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

const firebaseApp = initializeApp(firebaseConfig)
export const analytics = getAnalytics(firebaseApp)
export const auth = getAuth(firebaseApp)
export const firestore: Firestore = initializeFirestore(firebaseApp, { experimentalForceLongPolling: true })
export const functions = getFunctions(firebaseApp)
