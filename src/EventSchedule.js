import React, { Component } from 'react'
import request from 'request'
import csv from 'csvtojson'
import moment from 'moment'

class EventSchedule extends Component {
  constructor () {
    super()
    this.state = { events: [] }
  }

  componentDidMount () {
    const self = this
    csv()
      .fromStream(request.get("https://docs.google.com/spreadsheets/d/1FZOB291KWLoutpr0s6VeK5EtvuiQ8uhe497nOmWoqPA/export?format=csv&usp=sharing"))
      .then((events) => {
        self.setState({ events })
      })
  }

  render () {
    return (
      <section className="event_schedule_area pad_btm">
        <div className="container">
          <div className="main_title">
            <h2>Upcoming Events</h2>
          </div>
          <div className="event_schedule_inner">
            <div className="tab-content" id="myTabContent">
              <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                {
                  this.state.events
                    .map(event => {
                      event.month--
                      event.moment = moment(event)
                      return event
                    })
                    .filter(event => {
                      return event.moment.isAfter(moment().subtract(1, 'day')) &&
                        event.moment.isBefore(moment().add(15, 'day'))
                    })
                    .sort((a, b) => {
                      return a.moment.valueOf() - b.moment.valueOf()
                    })
                    .map((event, index) => {
                        return (
                          <div key={index} className="media">
                            <div className="d-flex">
                              <img src="img/schedule-3.png" alt="" />
                            </div>
                            <div className="media-body">
                              <h5>{event.moment.format('MMMM D h:mm a')}</h5>
                              <h4>{event.moment.format("dddd")} {event.subject}</h4>
                              <p>What: {event.what}</p>
                              <p>Where: {event.where}
                                {
                                  event['map-url'] && this.getMapLink(event['map-url'])
                                }
                              </p>
                            </div>
                          </div>
                        )
                      }
                    )
                }
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  getMapLink (eventElement) {
    return <span>&nbsp;(<a target="_blank" rel="noopener noreferrer" href={eventElement}>meeting point</a>)</span>
  }
}

export default EventSchedule