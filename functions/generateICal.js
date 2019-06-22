const request = require('request')
const md5 = require('md5')
const csv = require('csvtojson')
const moment = require('moment')
const _ = require('underscore')

const HEADER = `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Belmont Runners Calendar
X-WR-TIMEZONE:America/Los_Angeles
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
X-LIC-LOCATION:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
`
const FOOTER = `END:VCALENDAR
`

/*
example:
BEGIN:VEVENT
DTSTART;VALUE=DATE:20190613
DTEND;VALUE=DATE:20190614
DTSTAMP:20190615T231335Z
UID:40c1g9jct5sbejmqj882m87l40@google.com
CREATED:20190604T210345Z
DESCRIPTION:
LAST-MODIFIED:20190604T210345Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Track Thursday
TRANSP:TRANSPARENT
END:VEVENT
 */
const getDescription = ({ description, facebookEventId, googleMapId }) => {
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


const handleNewlines = (val, isAllow = false) => {
  if (!val || !_.isString(val)) {
    return ''
  }
  val = val.toString()
  if (isAllow) {
    return val.replace(/\n/g, '\\n')
  }
  return val.replace(/\n/g, '')
}

const getICalEvent = ({ start, end, subject, description, location, facebookEventId, googleMapId }) => {

  description = getDescription({ description, facebookEventId, googleMapId })

  subject = handleNewlines(subject)
  description = handleNewlines(description, true)
  location = handleNewlines(location)
  facebookEventId = handleNewlines(facebookEventId)
  googleMapId = handleNewlines(googleMapId)

  const startFormatted = start.format('YYYYMMDDTHHmmSS')
  const endFormatted = end.format('YYYYMMDDTHHmmSS')
  return `BEGIN:VEVENT
DTSTART;TZID=America/Los_Angeles:${startFormatted}
DTEND;TZID=America/Los_Angeles:${endFormatted}
DTSTAMP:${moment().utc().format('YYYYMMDDTHHmmSS') + 'Z'}
UID:${md5(startFormatted + endFormatted + location + facebookEventId + googleMapId)}
RECURRENCE-ID;TZID=America/Los_Angeles:${startFormatted}
CREATED:${moment().utc().format('YYYYMMDDTHHmmSS') + 'Z'}
DESCRIPTION:${description}
LAST-MODIFIED:${moment().utc().format('YYYYMMDDTHHmmSS') + 'Z'}
LOCATION:${location}
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:${subject} 
TRANSP:TRANSPARENT
END:VEVENT
`
}
module.exports = () => async () => {
  try {
    const events = await csv()
      .fromStream(request.get("https://docs.google.com/spreadsheets/d/1FZOB291KWLoutpr0s6VeK5EtvuiQ8uhe497nOmWoqPA/export?format=csv&usp=sharing"))
    const icalEvents = events
      .map(event => {
        event.month--
        event.moment = moment(event)
        return event
      })
      .filter(event => {
        return event.moment.isValid()
      })
      .sort((a, b) => {
        return a.moment.valueOf() - b.moment.valueOf()
      })
      .map((event) => {
        return getICalEvent({
          start: event.moment,
          end: moment(event.moment).add(2, 'hours'),
          subject: event.subject,
          description: event.what,
          location: event.where,
          facebookEventId: event['facebook-event-id'],
          googleMapId: event['google-map-id']
        })
      })
    return `${HEADER}${icalEvents.join('')}${FOOTER}`
      .replace(/\r\n/g, "\n")
      .replace(/\n/g, "\r\n")
  } catch (err) {
    console.error(err)
    throw err
  }
}