const { MEMBERSHIP_EXPIRES_AT } = require('./fields')
const moment = require('moment')

const IS_A_MEMBER = 'isAMember'
const WAS_NEVER_A_MEMBER = 'isAMember'
const IS_MEMBERSHIP_EXPIRED = 'isMembershipExpired'
const IS_MEMBERSHIP_EXPIRES_SOON = 'isMembershipExpiresSoon'

const calc = (userData, duration = moment.duration(1, 'month')) => {
  const membershipExpiresAt = userData[MEMBERSHIP_EXPIRES_AT]

  let isAMember = membershipExpiresAt && moment(membershipExpiresAt).isAfter(moment())
  let isMembershipExpired = membershipExpiresAt && moment(membershipExpiresAt).isBefore(moment())
  return {
    [IS_A_MEMBER]: isAMember,
    [IS_MEMBERSHIP_EXPIRES_SOON]: isAMember && moment(membershipExpiresAt).isBefore(moment().add(duration)),
    [IS_MEMBERSHIP_EXPIRED]: isMembershipExpired,
    [WAS_NEVER_A_MEMBER]: !isAMember && !isMembershipExpired
  }
}

module.exports = {
  calc,
  WAS_NEVER_A_MEMBER,
  IS_A_MEMBER,
  IS_MEMBERSHIP_EXPIRED,
  IS_MEMBERSHIP_EXPIRES_SOON
}

