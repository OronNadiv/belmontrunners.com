import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureStore, { history } from './store'
import './index.css'
import App from './App'
import { ConnectedRouter } from 'connected-react-router'
import { Elements, StripeProvider } from 'react-stripe-elements'

import * as serviceWorker from './serviceWorker'
import firebase from 'firebase'
import theme from './MuiTheme'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'

const config = {
  apiKey: "AIzaSyC0Xnd3J3pE5pz_mpEPu68hJsZegQ89d_o",
  authDomain: "belmont-runners-1548537264040.firebaseapp.com",
  databaseURL: "https://belmont-runners-1548537264040.firebaseio.com",
  projectId: "belmont-runners-1548537264040",
  storageBucket: "belmont-runners-1548537264040.appspot.com",
  messagingSenderId: "623861554235"
}
firebase.initializeApp(config)

let store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <MuiThemeProvider theme={theme}>
        <StripeProvider apiKey={process.env.REACT_APP_STRIPE_PUBLIC_KEY}>
          <Elements>
            <App />
          </Elements>
        </StripeProvider>
      </MuiThemeProvider>
    </ConnectedRouter>
  </Provider>, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
