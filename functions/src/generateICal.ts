import Event from './Event'

const request = require('request')
const csv = require('csvtojson')
const moment = require('moment')
const ical = require('ical-generator')

interface GetDescriptionParams {
  description: string
  facebookEventId?: string
  googleMapId?: string
}

interface EventEX extends Event {
  moment: any
}

const getDescription = ({ description, facebookEventId, googleMapId }: GetDescriptionParams) => {
  let facebookEvent
  let googleMap
  if (facebookEventId) {
    facebookEvent = `

Facebook event: https://www.facebook.com/events/${facebookEventId}`
  }
  if (googleMapId) {
    googleMap = `

Meeting point: https://goo.gl/maps/${googleMapId}`
  }
  return `${description}${facebookEvent || ''}${googleMap || ''}`
}

const GenerateICal = () =>
  async () => {
    try {
      const cal = ical({
        domain: 'belmontrunners.com',
        prodId: { company: 'Belmont Runners', product: 'public-iCal' },
        name: 'Belmont Runners Calendar',
        timezone: 'America/Los_Angeles'
      })

      const events: EventEX[] = await csv().fromStream(
        request.get(
          'https://docs.google.com/spreadsheets/d/1FZOB291KWLoutpr0s6VeK5EtvuiQ8uhe497nOmWoqPA/export?format=csv&usp=sharing'
        )
      )
      events
        .map(event => {
          event.month--
          event.moment = moment.tz(event, 'America/Los_Angeles')
          return event
        })
        .filter(event => {
          return event.moment.isValid()
        })
        .sort((a, b) => {
          return a.moment.valueOf() - b.moment.valueOf()
        })
        .forEach(event => {
          const isMembersOnly = event['is-members-only-event'] === 'TRUE'
          cal.createEvent({
            start: event.moment,
            end: moment(event.moment).add(2, 'hours'),
            summary: (isMembersOnly ? '[MEMBERS ONLY] ' : '') + event.subject,
            location: event.where,
            description: getDescription({
              description: event.what,
              facebookEventId: event['facebook-event-id'],
              googleMapId: event['google-map-id']
            })
          })
        })

      return cal.toString()
    } catch (err) {
      console.error(err)
      throw err
    }
  }

export default GenerateICal
