import React, { useEffect, useState } from 'react'
import request from 'request'
import csv from 'csvtojson'
import moment from 'moment'
import CalendarSelector from './CalendarSelector'
import ExpendMoreIcon from '@material-ui/icons/ExpandMore'
import { IconButton } from '@material-ui/core'

const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1FZOB291KWLoutpr0s6VeK5EtvuiQ8uhe497nOmWoqPA/export?format=csv&usp=sharing'

const getMapLink = eventElement => {
  return (
    <span style={{ paddingRight: '1em' }}>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://goo.gl/maps/${eventElement}`}
      >
        <i className="fas fa-map-marker-alt" />
        &nbsp;Meeting Point
      </a>
    </span>
  )
}

const getFacebookEventLink = eventElement => {
  return (
    <span>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={`https://www.facebook.com/events/${eventElement}`}
      >
        <i className="fab fa-facebook-square" />
        &nbsp;Facebook Event
      </a>
    </span>
  )
}

function EventSchedule() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [daysAhead, setDaysAhead] = useState(15)
  const [loadMoreClicked, setLoadMoreClicked] = useState(0)

  useEffect(() => {
    ;(async function() {
      const allEvents = await csv().fromStream(request.get(SPREADSHEET_URL))
      const events = allEvents
        .map(event => {
          event.month--
          event.moment = moment(event)
          return event
        })
        .filter(event => {
          return (
            event.moment.isValid() &&
            event.moment.isAfter(moment().subtract(1, 'day'))
          )
        })
        .sort((a, b) => {
          return a.moment.valueOf() - b.moment.valueOf()
        })
      setEvents(events)
    })()
  }, [])

  useEffect(() => {
    ;(async function() {
      const filteredEvents = events.filter(event => {
        return event.moment.isBefore(moment().add(daysAhead, 'day'))
      })
      setFilteredEvents(filteredEvents)
    })()
  }, [events, daysAhead])

  return (
    <section className="event_schedule_area pad_btm">
      <div className="container">
        <div className="main_title">
          <h2>Upcoming Events</h2>
        </div>
        <div className="d-flex flex-row-reverse mb-3">
          <CalendarSelector />
        </div>
        <div className="event_schedule_inner">
          <div className="tab-content" id="myTabContent">
            <div
              className="tab-pane fade show active"
              id="home"
              role="tabpanel"
              aria-labelledby="home-tab"
            >
              {filteredEvents.map((event, index) => {
                return (
                  <div key={index} className="media">
                    <div className="d-flex">
                      <img src="img/schedule/schedule-3.png" alt="" />
                    </div>
                    <div className="media-body">
                      <h5>{event.moment.format('MMMM D h:mm a')}</h5>
                      <h4
                        className={
                          event['is-special-event'] === 'TRUE'
                            ? 'special-event'
                            : undefined
                        }
                      >
                        {event.moment.format('dddd')} {event.subject}
                      </h4>
                      <p>What: {event.what}</p>
                      <p>Where: {event.where}</p>
                      {event['google-map-id'] || event['facebook-event-id'] ? (
                        <div className="d-flex flex-wrap">
                          {event['google-map-id'] &&
                            getMapLink(event['google-map-id'])}
                          {event['facebook-event-id'] &&
                            getFacebookEventLink(event['facebook-event-id'])}
                        </div>
                      ) : (
                        <span />
                      )}
                    </div>
                    {event['is-members-only-event'] === 'TRUE' && (
                      <img
                        src="img/schedule/members-only-t.png"
                        alt=""
                        style={{ width: '5em' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        {loadMoreClicked <= 2 && filteredEvents.length < events.length && (
          <div className="d-flex justify-content-center bounce">
            <IconButton
              onClick={() => {
                setLoadMoreClicked(loadMoreClicked + 1)
                setDaysAhead(daysAhead + 7)
              }}
            >
              <ExpendMoreIcon />
            </IconButton>
          </div>
        )}
      </div>
    </section>
  )
}

export default EventSchedule
