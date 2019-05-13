import React, { Component } from 'react'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from '../EventSchedule'
import Subscribe from './Subscribe'
import Team from './Team'
import Map from './Map'

class Home extends Component {
  render () {
    return (
      <div>
        <HomeBanner />
        <Welcome />
        <EventSchedule />
        <Subscribe />
        <Team />
        {/*<Partners />*/}
        <Map />
      </div>
    )
  }
}

export default Home