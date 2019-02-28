import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import * as serviceWorker from './serviceWorker'
import firebase from 'firebase'
const config = {
  apiKey: "AIzaSyC0Xnd3J3pE5pz_mpEPu68hJsZegQ89d_o",
  authDomain: "belmont-runners-1548537264040.firebaseapp.com",
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com",
  projectId: "belmont-runners-1548537264040",
  storageBucket: "belmont-runners-1548537264040.appspot.com",
  messagingSenderId: "623861554235"
}
firebase.initializeApp(config)

ReactDOM.render(<App />, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
