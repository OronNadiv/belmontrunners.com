import React, { useEffect } from 'react'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from './schedule/EventSchedule'
import Subscribe from './Subscribe'
import Map from './Map'
import Notifications from './Notifications'
import { configureAnchors, goToTop } from 'react-scrollable-anchor'
import Promotion from './Promotion'
import moment from 'moment'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import ScrollableAnchor from 'react-scrollable-anchor'

function Home({ location: { hash } }: RouteComponentProps) {

  useEffect(() => {
    configureAnchors({ offset: -120, scrollDuration: 600 })
    if (!hash) {
      goToTop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <HomeBanner />
      <Welcome />
      {moment().isBefore('2019-12-24') && <Promotion />}
      <ScrollableAnchor id='events'>
        <div>
          <EventSchedule />
        </div>
      </ScrollableAnchor>
      <Subscribe />
      <Map />
      <Notifications />
    </div>
  )
}

export default withRouter(Home)
