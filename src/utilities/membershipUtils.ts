import { MEMBERSHIP_EXPIRES_AT } from '../fields'
import moment from 'moment'
import { User } from '../entities/User'

const IS_A_MEMBER: string = 'IS_A_MEMBER'
const WAS_NEVER_A_MEMBER: string = 'WAS_NEVER_A_MEMBER'
const IS_MEMBERSHIP_EXPIRED: string = 'IS_MEMBERSHIP_EXPIRED'
const IS_MEMBERSHIP_EXPIRES_SOON: string = 'IS_MEMBERSHIP_EXPIRES_SOON'

const calc = (userData: User, durationParam?: moment.Duration) => {
  const duration = durationParam || moment.duration(1, 'month')
  const membershipExpiresAt = userData[MEMBERSHIP_EXPIRES_AT]

  const isAMember = membershipExpiresAt && moment().isBefore(moment(membershipExpiresAt))
  const isMembershipExpired = membershipExpiresAt && moment(membershipExpiresAt).isBefore(moment())
  return {
    [IS_A_MEMBER]: !!isAMember,
    [IS_MEMBERSHIP_EXPIRES_SOON]: isAMember && membershipExpiresAt && moment(membershipExpiresAt).isBefore(moment().add(duration)),
    [IS_MEMBERSHIP_EXPIRED]: !!isMembershipExpired,
    [WAS_NEVER_A_MEMBER]: !isAMember && !isMembershipExpired
  }
}

export {
  calc,
  WAS_NEVER_A_MEMBER,
  IS_A_MEMBER,
  IS_MEMBERSHIP_EXPIRED,
  IS_MEMBERSHIP_EXPIRES_SOON
}

