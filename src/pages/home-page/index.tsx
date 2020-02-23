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
import { IRedisState } from '../../entities/User'
import { connect } from 'react-redux'
import { compose } from 'underscore'
import * as PropTypes from 'prop-types'

interface Props extends RouteComponentProps {
  isCurrentUserLoaded: boolean
}

function Home({ location: { hash }, isCurrentUserLoaded }: Props) {

  useEffect(() => {
    if (!hash) {
      animateScroll.scrollToTop({ duration: 0 })
    } else if (hash === '#events' && isCurrentUserLoaded) {
      scroller.scrollTo('events', {
        duration: 500,
        smooth: true,
        offset: -120
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentUserLoaded])

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


Home.propTypes = {
  isCurrentUserLoaded: PropTypes.bool.isRequired
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded } }: IRedisState) => {
  return {
    isCurrentUserLoaded
  }
}

export default compose(
  connect(mapStateToProps),
  withRouter
)(Home)
