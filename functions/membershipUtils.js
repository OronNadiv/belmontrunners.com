const { MEMBERSHIP_EXPIRES_AT } = require('./fields')
const moment = require('moment')

const IS_A_MEMBER = 'IS_A_MEMBER'
const WAS_NEVER_A_MEMBER = 'WAS_NEVER_A_MEMBER'
const IS_MEMBERSHIP_EXPIRED = 'IS_MEMBERSHIP_EXPIRED'
const IS_MEMBERSHIP_EXPIRES_SOON = 'IS_MEMBERSHIP_EXPIRES_SOON'

const calc = (userData, duration = moment.duration(1, 'month')) => {
  const membershipExpiresAt = userData[MEMBERSHIP_EXPIRES_AT]

  const isAMember = membershipExpiresAt && moment().isBefore(moment(membershipExpiresAt))
  console.log('isAMember:', isAMember, 'membershipExpiresAt:', membershipExpiresAt)
  const isMembershipExpired = membershipExpiresAt && moment(membershipExpiresAt).isBefore(moment())
  return {
    [IS_A_MEMBER]: Boolean(isAMember),
    [IS_MEMBERSHIP_EXPIRES_SOON]: isAMember && moment(membershipExpiresAt).isBefore(moment().add(duration)),
    [IS_MEMBERSHIP_EXPIRED]: Boolean(isMembershipExpired),
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

