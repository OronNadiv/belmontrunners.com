import React, { useEffect } from 'react'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from './schedule/EventSchedule'
import Subscribe from './Subscribe'
import Map from './Map'
import Notifications from './Notifications'
import { Element, scroller, animateScroll } from 'react-scroll'
import Promotion from './Promotion'
import moment from 'moment'
import { withRouter, RouteComponentProps } from 'react-router-dom'

function Home({ location: { hash } }: RouteComponentProps) {

  useEffect(() => {
    if (!hash) {
      animateScroll.scrollToTop({ duration: 0 })
    } else if (hash === '#events') {
      scroller.scrollTo('events', {
        duration: 500,
        delay: 500,
        smooth: true,
        offset: -120
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <HomeBanner />
      <Welcome />
      {moment().isBefore('2019-12-24') && <Promotion />}
      <Element name="events">
        <div>
          <EventSchedule />
        </div>
      </Element>
      <Subscribe />
      <Map />
      <Notifications />
    </div>
  )
}

export default withRouter(Home)
