import React, { Component } from 'react'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from '../EventSchedule'
import Subscribe from './Subscribe'
import Team from './Team'
import Map from './Map'
import Notifications from './Notifications'

class Home extends Component {
  componentDidMount () {
    window.scrollTo(0, 0)
  }

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
        <Notifications />
      </div>
    )
  }
}

export default Home