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

function Home() {
  useEffect(() => {
    goToTop()
  }, [])

  return (
    <div>
      <HomeBanner />
      <Welcome />
      <Promotion />
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
