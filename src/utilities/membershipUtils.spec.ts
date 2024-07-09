import calc from './membershipUtils'
import moment from 'moment'
import { each } from 'underscore'
import { IUserOptionalProps } from '../entities/User'

const inAYear = moment().add(1, 'year')
const tomorrow = moment().add(1, 'day')
const past = moment().subtract(1)

it('membershipUtils', () => {
  const data = {
    [inAYear.format()]: {
      isMembershipExpired: false,
      isMembershipExpiresSoon: false,
      isAMember: true,
      wasNeverAMember: false
    },
    [tomorrow.format()]: {
      isMembershipExpired: false,
      isMembershipExpiresSoon: true,
      isAMember: true,
      wasNeverAMember: false
    },
    [past.format()]: {
      isMembershipExpired: true,
      isMembershipExpiresSoon: false,
      isAMember: false,
      wasNeverAMember: false
    },
    null: {
      isMembershipExpired: false,
      isMembershipExpiresSoon: false,
      isAMember: false,
      wasNeverAMember: true
    }
  }
  each(data, (expects, time) => {
    const userData: IUserOptionalProps = {
      membershipExpiresAt: time
    }
    each(expects, (val, key) => {
      console.log(`time: ${time}, key: ${key}, val: ${val}`)
      // @ts-ignore
      expect(calc(userData)[key]).toEqual(val)
    })
  })
})
