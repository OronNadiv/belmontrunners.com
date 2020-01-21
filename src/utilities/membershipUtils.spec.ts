import {
  calc,
  WAS_NEVER_A_MEMBER,
  IS_A_MEMBER,
  IS_MEMBERSHIP_EXPIRED,
  IS_MEMBERSHIP_EXPIRES_SOON
} from './membershipUtils'
import moment from 'moment'
import { MEMBERSHIP_EXPIRES_AT } from '../fields'
import { each } from 'underscore'
import { UserOptionalProps } from '../entities/User'

const inAYear = moment().add(1, 'year')
const tomorrow = moment().add(1, 'day')
const past = moment().subtract(1)

it('membershipUtils', () => {
  const data = {
    [inAYear.format()]: {
      [IS_MEMBERSHIP_EXPIRED]: false,
      [IS_MEMBERSHIP_EXPIRES_SOON]: false,
      [IS_A_MEMBER]: true,
      [WAS_NEVER_A_MEMBER]: false
    },
    [tomorrow.format()]: {
      [IS_MEMBERSHIP_EXPIRED]: false,
      [IS_MEMBERSHIP_EXPIRES_SOON]: true,
      [IS_A_MEMBER]: true,
      [WAS_NEVER_A_MEMBER]: false
    },
    [past.format()]: {
      [IS_MEMBERSHIP_EXPIRED]: true,
      [IS_MEMBERSHIP_EXPIRES_SOON]: false,
      [IS_A_MEMBER]: false,
      [WAS_NEVER_A_MEMBER]: false
    },
    null: {
      [IS_MEMBERSHIP_EXPIRED]: false,
      [IS_MEMBERSHIP_EXPIRES_SOON]: false,
      [IS_A_MEMBER]: false,
      [WAS_NEVER_A_MEMBER]: true
    }
  }
  each(data, (expects, time) => {
    const userData: UserOptionalProps = {
      [MEMBERSHIP_EXPIRES_AT]: time
    }
    each(expects, (val, key) => {
      console.log(`time: ${time}, key: ${key}, val: ${val}`)
      expect(calc(userData)[key]).toEqual(val)
    })
  })
})
