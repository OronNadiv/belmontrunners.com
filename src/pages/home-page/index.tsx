import React, { useEffect } from 'react'
import HomeBanner from './HomeBanner'
import Welcome from './Welcome'
import EventSchedule from './schedule/EventSchedule'
import Subscribe from './Subscribe'
import Map from './Map'
import Notifications from './Notifications'
import { Element, scroller, animateScroll } from 'react-scroll'
import Promotion from './Promotion'
import dayjs from 'dayjs'
import { useLocation } from 'react-router-dom'
import { IRedisState } from '../../entities/User'
import { connect } from 'react-redux'
import * as PropTypes from 'prop-types'
import {EVENTS_HASH, SUBSCRIBE_HASH} from '../../urls';

interface Props {
  isCurrentUserLoaded: boolean
}

function Home({ isCurrentUserLoaded }: Props) {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      animateScroll.scrollToTop({ duration: 0 })
    } else if (isCurrentUserLoaded) {
      const hashLowerCase = hash.toLowerCase();
      switch (hashLowerCase) {
        case EVENTS_HASH:
        case SUBSCRIBE_HASH:
          scroller.scrollTo(hashLowerCase.substr(1), {
            duration: 500,
            smooth: true,
            offset: -120
          })
          break;
        default:
          // do nothing
          break;

      }
    }
     
  }, [isCurrentUserLoaded, hash])

  return (
    <div>
      <HomeBanner />
      <Welcome />
      {dayjs().isBefore('2019-12-24') && <Promotion />}
      <Element name="events">
        <div>
          <EventSchedule />
        </div>
      </Element>
      <Element name="subscribe">
        <div>
          <Subscribe />
        </div>
      </Element>
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

export default connect(mapStateToProps)(Home)
