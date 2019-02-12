import React, { Component } from 'react'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from './EventSchedule'
import Subscribe from './Subscribe'
import Team from './Team'
import Map from './Map'
import Footer from './Footer'
import './App.css'

// import Partners from './Partners'

class App extends Component {
  render () {
    return (
      <div>
        <HomeBanner />
        <Welcome />
        <EventSchedule />
        <Subscribe/>
        <Team />
        {/*<Partners />*/}
        <Map />
        <Footer />
      </div>
    )
  }
}

export default App
