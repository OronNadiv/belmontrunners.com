import React, { useEffect } from 'react'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from './schedule/EventSchedule'
import Subscribe from './Subscribe'
import Team from './team/Team'
import Map from './Map'
import Notifications from './Notifications'
import { goToTop } from 'react-scrollable-anchor'
import Promotion from "./Promotion";
import moment from 'moment'

function Home() {
  useEffect(() => {
    goToTop()
  }, [])

  return (
    <div>
      <HomeBanner />
      <Welcome />
      {moment().isBefore('2019-12-24') && <Promotion />}
      <EventSchedule />
      <Subscribe />
      <Team />
      {/*<Partners />*/}
      <Map />
      <Notifications />
    </div>
  )
}

export default Home
