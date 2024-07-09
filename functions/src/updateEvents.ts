import * as Admin from 'firebase-admin'
import { Moment } from 'moment'
import got from 'got'

const csv = require('csvtojson')
const request = require('request')
const moment = require('moment')

const SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1FZOB291KWLoutpr0s6VeK5EtvuiQ8uhe497nOmWoqPA/export?format=csv&usp=sharing'

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

interface RawWeather {
  dt: number
  main: {
    temp: number
  }
  weather: [
    {
      description: string
      icon: string
    }
  ]
  wind: {
    speed: number
  }
}

const getEvents = async (): Promise<CSVEvent[]> => {
  const rawEvents = await csv().fromStream(request.get(SPREADSHEET_URL))

  return rawEvents
    .map((event: CSVEvent) => {
      event.month--
      return event
    })
    .filter((event: CSVEvent) => {
      const momentEvent = moment(event)
      return (
        momentEvent.isValid() &&
        momentEvent.isAfter(moment().subtract(1, 'day'))
      )
    })
    .sort((a: CSVEvent, b: CSVEvent) => {
      const momentA = moment(a)
      const momentB = moment(b)
      return momentA.valueOf() - momentB.valueOf()
    })
}

const getRawWeather = async (appId: string, cityId: string): Promise<RawWeather[]> => {
  type OpenWeatherMapResponse = { list: RawWeather[] };
  const res = await got.get(`https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${appId}&units=imperial`).json()
  const data = res as OpenWeatherMapResponse
  return data.list
}

const UpdateEvents = (admin: Admin.app.App, appId: string, cityId: string) => {
  const firestore = admin.firestore()

  return async () => {
    const events = await getEvents()
    let rawWeather: RawWeather[] = []
    try {
      rawWeather = await getRawWeather(appId, cityId)
    } catch (err) {
      console.error('while fetching weather.  err:', err)
    }

    events.forEach((event: CSVEvent) => {
      rawWeather.find((currEntry: RawWeather, index: number) => {
        const currDT = moment.unix(currEntry.dt)
        const currTemp = currEntry.main.temp
        let nextDT
        let nextTemp
        const nextEntry: RawWeather = rawWeather[index + 1]
        if (nextEntry) {
          nextDT = moment.unix(nextEntry.dt)
          nextTemp = nextEntry.main.temp
        } else {
          nextDT = moment(currDT).add(3, 'h')
          nextTemp = currTemp
        }
        const isBetween = moment(event).isBetween(
          currDT,
          nextDT,
          undefined,
          '[)'
        )
        if (isBetween) {
          event.weather = {
            description: currEntry.weather[0].description,
            icon: currEntry.weather[0].icon,
            temp:
              currTemp +
              ((nextTemp - currTemp) / (nextDT.unix() - currDT.unix())) *
              (moment(event).unix() - currDT.unix()),
            wind: currEntry.wind.speed
          }
          return true
        }
        return false
      })
    })
    if (!events.length) {
      return
    }

    await firestore.collection('events').doc('items').set({ values: events })
  }
}

export default UpdateEvents
