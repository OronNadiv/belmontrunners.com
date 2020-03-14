import React, { useEffect, useState } from 'react'
import moment, { Moment } from 'moment'
import CalendarSelector from './CalendarSelector'
import ExpendMoreIcon from '@material-ui/icons/ExpandMore'
import { useMediaQuery, useTheme, IconButton } from '@material-ui/core'
import { firestore } from '../../../firebase'

const CITY_ID = 5392423

const getMapLink = (eventElement: string) => {
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

const getFacebookEventLink = (eventElement: string) => {
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

interface Weather {
  icon: string
  description: string
  temp: number
  wind: number
}

interface CSVEvent {
  month: number
  moment: Moment,
  'is-special-event': string,
  subject: string,
  what: string,
  where: string,
  'google-map-id'?: string
  'facebook-event-id'?: string
  'is-members-only-event'?: string
  weather: Weather
}

function EventSchedule() {
  // eslint-disable-next-line
  const [events, setEvents] = useState<CSVEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<CSVEvent[]>([])
  const [daysAhead, setDaysAhead] = useState(15)
  const [loadMoreClicked, setLoadMoreClicked] = useState(0)

  const covid19 = () => {
    const now = moment()

    // @ts-ignore
    const ev = {
      minute: now.minute(),
      hour: now.hour(),
      day: now.date(),
      month: now.month(),
      year: now.year(),
      moment: now,
      "is-special-event": 'TRUE',
      subject: 'All Official Group Runs Suspended due to COVID-19 Concerns',
      what: '',
      where: ''
    } as CSVEvent
    const items = {values: [ev]}
    return items
  }

  const notCovid19 = async () => {
    const eventsDoc = await firestore.collection('events').doc('items').get()
    const items = eventsDoc.data() as { values: CSVEvent[] }
    return items
  }
  useEffect(() => {
    ;(async function () {
      // const items = notCovid19()
      const items = covid19()
      items.values.forEach((event: CSVEvent) => {
        event.moment = moment(event)
      })
      setEvents(items.values)
    })()
  }, [])

  useEffect(() => {
    console.log('4 events.length:', events.length, 'daysAhead:', daysAhead)
    if (!events.length) {
      return
    }
    const res = events.filter((event: { moment: Moment }) => {
      return event.moment.isBefore(moment().add(daysAhead, 'day'))
    })
    setFilteredEvents(res)
  }, [events, daysAhead])

  const theme = useTheme()
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'))

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
              {
                filteredEvents.map(
                  (filteredEvent: CSVEvent, index) => {
                    return (
                      <div key={index} className="media align-items-center">
                        {
                          !isSmallDevice && <div className="d-flex">
                            <img src="img/schedule/schedule-3.png" alt="" />
                          </div>
                        }
                        <div className="media-body">
                          <h5>{filteredEvent.moment.format('MMMM D h:mm a')}</h5>
                          <h4
                            className={
                              filteredEvent['is-special-event'] === 'TRUE'
                                ? 'special-event'
                                : undefined
                            }
                          >
                            {filteredEvent.moment.format('dddd')}{' '}
                            {filteredEvent.subject}
                          </h4>
                          <p>What: {filteredEvent.what}</p>
                          <p>Where: {filteredEvent.where}</p>
                          {filteredEvent['google-map-id'] ||
                          filteredEvent['facebook-event-id'] ? (
                            <div className="d-flex flex-wrap">
                              {filteredEvent['google-map-id'] &&
                              getMapLink(filteredEvent['google-map-id'])}
                              {filteredEvent['facebook-event-id'] &&
                              getFacebookEventLink(
                                filteredEvent['facebook-event-id']
                              )}
                            </div>
                          ) : (
                            <span />
                          )}
                        </div>
                        <div>
                          <div>
                            {filteredEvent['is-members-only-event'] === 'TRUE' && (
                              <img
                                src="img/schedule/members-only-t.png"
                                alt=""
                                style={{ width: '5em' }}
                              />
                            )}
                          </div>
                          <div className="text-center">
                            {filteredEvent.weather && (
                              <a
                                className="flex-d flex-row align-content-center"
                                target="_blank"
                                rel="noreferrer noopener"
                                href={`https://openweathermap.org/city/${CITY_ID}`}
                              >
                                <img
                                  alt="weather icon"
                                  src={`https://openweathermap.org/img/wn/${filteredEvent.weather.icon}.png`}
                                />
                                <div className="text-muted">
                                  {filteredEvent.weather.description}
                                </div>
                                <div className="weather-temp">
                                  {Math.round(filteredEvent.weather.temp)} °F
                                </div>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }
                )
              }
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
