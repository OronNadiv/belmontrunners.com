import moment from 'moment'
import { INVALID_EMAIL, INVALID_PASSWORD_LENGTH } from '../messages'
import * as EmailValidator from 'email-validator'

const MAX_YEAR = moment().year() - 5
const MIN_YEAR = moment().year() - 120

export const required = (value: string) => (value ? undefined : 'Required')
export const mustBeNumber = (value: any) => (isNaN(value) ? 'Must be a number' : undefined)
export const birthday = (value: string) => {
  const val = moment(value, 'YYYY-MM-DD')
  return !val.isValid() || val.year() < MIN_YEAR || val.year() > MAX_YEAR
    ? 'Invalid birthday'
    : undefined
}
export const isEmail = (value:string) => !value || !EmailValidator.validate(value) ? INVALID_EMAIL : undefined

export const minPasswordLength = (value: string) => {
  const res = value.length < 6 ? INVALID_PASSWORD_LENGTH(6) : undefined
  return res
}

export const composeValidators = (...validators: any[]) => (value: any) =>
  validators.reduce((error, validator) => error || validator(value), undefined)
