import React, { Component } from 'react'
import HeaderArea from './header/HeaderArea'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from './EventSchedule'
import Subscribe from './Subscribe'
import Team from './Team'
import Map from './Map'
import Footer from './Footer'
import './App.css'
import { BrowserRouter as Router } from "react-router-dom"
import firebase from 'firebase'
import 'firebase/auth'
import './scss/style.scss'

// import Partners from './Partners'

class App extends Component {
  render () {
    console.log('firebase.auth().currentUser:', firebase.auth().currentUser)
    return (
      <Router>
        <div>
          <HeaderArea />
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
