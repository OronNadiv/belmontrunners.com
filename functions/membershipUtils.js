import { MEMBERSHIP_EXPIRES_AT } from './fields'
import moment from 'moment'

const IS_A_MEMBER = 'isAMember'
const IS_MEMBERSHIP_EXPIRED = 'isMembershipExpired'
const IS_MEMBERSHIP_EXPIRES_SOON = 'isMembershipExpiresSoon'

const calc = (userData, duration = moment.duration(1, 'month')) => {
  const membershipExpiresAt = userData[MEMBERSHIP_EXPIRES_AT]

  let isAMember = membershipExpiresAt && moment(membershipExpiresAt).isAfter(moment())
  return {
    [IS_A_MEMBER]: isAMember,
    [IS_MEMBERSHIP_EXPIRES_SOON]: isAMember && moment(membershipExpiresAt).isBefore(moment().add(duration)),
    [IS_MEMBERSHIP_EXPIRED]: membershipExpiresAt && moment(membershipExpiresAt).isBefore(moment())
  }
}

export {
  calc,
  IS_A_MEMBER,
  IS_MEMBERSHIP_EXPIRED,
  IS_MEMBERSHIP_EXPIRES_SOON
}

