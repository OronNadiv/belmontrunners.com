import React, { useEffect, useState } from 'react'
import request from 'request'
import csv from 'csvtojson'
import moment from 'moment'
import CalendarSelector from './CalendarSelector'
import ExpendMoreIcon from '@material-ui/icons/ExpandMore'
import { IconButton } from '@material-ui/core'
import rp from 'request-promise'

const CITY_ID = 5392423
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
  const [random, setRandom] = useState(Math.random()) // eslint-disable-line no-unused-vars
  const [rawEvents, setRawEvents] = useState([])
  const [rawWeather, setRawWeather] = useState([])
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [daysAhead, setDaysAhead] = useState(15)
  const [loadMoreClicked, setLoadMoreClicked] = useState(0)

  useEffect(() => {
    console.log('1')
    ;(async function() {
      const rawWeather = await rp({
        url: `https://openweathermap.org/data/2.5/forecast?id=${CITY_ID}&appid=b6907d289e10d714a6e88b30761fae22&units=imperial`,
        json: true
      })
      setRawWeather(rawWeather.list)
    })()
  }, [])

  useEffect(() => {
    console.log('2')
    ;(async function() {
      const rawEvents = await csv().fromStream(request.get(SPREADSHEET_URL))
      setRawEvents(rawEvents)
    })()
  }, [])

  useEffect(() => {
    console.log('3 rawEvents.length:', rawEvents.length)
    if (!rawEvents.length) {
      return
    }
    const events = rawEvents
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
  }, [rawEvents])

  useEffect(() => {
    console.log('4 events.length:', events.length, 'daysAhead:', daysAhead)
    if (!events.length) {
      return
    }
    const filteredEvents = events.filter(event => {
      return event.moment.isBefore(moment().add(daysAhead, 'day'))
    })
    setFilteredEvents(filteredEvents)
  }, [events, daysAhead])

  useEffect(() => {
    console.log(
      '5 rawWeather.length:',
      rawWeather.length,
      'filteredEvents.length:',
      filteredEvents.length
    )
    if (!rawWeather.length || !filteredEvents.length) {
      return
    }
    filteredEvents.forEach(filteredEvent => {
      rawWeather.find((currEntry, index) => {
        const currDT = moment.unix(currEntry.dt)
        const currTemp = currEntry.main.temp
        let nextDT
        let nextTemp
        const nextEntry = rawWeather[index + 1]
        if (nextEntry) {
          nextDT = moment.unix(nextEntry.dt)
          nextTemp = nextEntry.main.temp
        } else {
          nextDT = moment(currDT).add(3, 'h')
          nextTemp = currTemp
        }
        const isBetween = filteredEvent.moment.isBetween(
          currDT,
          nextDT,
          null,
          '[)'
        )
        if (isBetween) {
          filteredEvent.weather = {
            description: currEntry.weather[0].description,
            icon: currEntry.weather[0].icon,
            temp:
              currTemp +
              ((nextTemp - currTemp) / (nextDT.unix() - currDT.unix())) *
                (filteredEvent.moment.unix() - currDT.unix()),
            wind: currEntry.wind.speed
          }
          return true
        }
        return false
      })
    })
    setRandom(Math.random())
  }, [filteredEvents, rawWeather])

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
              {filteredEvents.map((filteredEvent, index) => {
                return (
                  <div key={index} className="media">
                    <div className="d-flex">
                      <img src="img/schedule/schedule-3.png" alt="" />
                    </div>
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
