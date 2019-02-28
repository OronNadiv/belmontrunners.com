import React, { Component } from 'react'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from './EventSchedule'
import Subscribe from './Subscribe'
import Team from './Team'
import Map from './Map'
import Footer from './Footer'
import './App.css'
import { BrowserRouter as Router, Link, Route } from "react-router-dom"
import firebase from 'firebase'
import 'firebase/auth'
import Signin from './Signin'
import Signup from './Signup'
import ForgotPassword from './ForgotPassword'

// import Partners from './Partners'

class App extends Component {
  constructor () {
    super()
    this.state = {
      user: firebase.auth().currentUser
    }
    firebase.auth().onAuthStateChanged((user) => {
      this.setState({ user })
    })
  }

  render () {
    console.log('firebase.auth().currentUser:', firebase.auth().currentUser)
    return (
      <Router>
        <div>
          <header className="header_area">
            <div style={{
              display: 'flex',
              flexDirection: 'row-reverse',
              margin: 30
            }}>
              <Route
                exact
                path={'/signin'}
                render={() => <Signin />}
              />
              <Route
                exact
                path={'/signup'}
                render={() => <Signup />}
              />
              <Route
                exact
                path={'/forgotpassword'}
                render={() => <ForgotPassword />}
              />
              {
                this.state.user ?
                  <div>
                    <a className='text-white-50' style={{ margin: '0 10px' }} href='#'
                       onClick={() => firebase.auth().signOut()}>
                      Sign out
                    </a>
                    <span style={{
                      margin: '0 10px',
                      color: 'white'
                    }}>Hello, {firebase.auth().currentUser.displayName}</span>
                  </div> :
                  <div>
                    <Link to="/signin" style={{ marginRight: 30 }} className='text-white'>
                      Sign in
                    </Link>
                    <Link to="/signup">
                      <button type="button" className="btn btn-light">Sign up</button>
                    </Link>
                  </div>
              }
            </div>
          </header>

          <HomeBanner />
          <Welcome />
          <EventSchedule />
          <Subscribe />
          <Team />
          {/*<Partners />*/}
          <Map />
          <Footer />
        </div>
      </Router>
    )
  }
}

export default App
