const moment = require('moment')

interface CalcParam {
  membershipExpiresAt?: string
}

interface CalcRes {
  isAMember: boolean
  wasNeverAMember: boolean
  isMembershipExpired: boolean
  isMembershipExpiresSoon: boolean
}

export default (userData: CalcParam, duration = moment.duration(1, 'month')): CalcRes => {
  const membershipExpiresAt = userData.membershipExpiresAt

  const isAMember =
    membershipExpiresAt && moment().isBefore(moment(membershipExpiresAt))
  console.log(
    'isAMember:',
    isAMember,
    'membershipExpiresAt:',
    membershipExpiresAt
  )
  const isMembershipExpired =
    membershipExpiresAt && moment(membershipExpiresAt).isBefore(moment())
  return {
    isAMember: Boolean(isAMember),
    isMembershipExpiresSoon: (isAMember && moment(membershipExpiresAt).isBefore(moment().add(duration))) || false,
    isMembershipExpired: Boolean(isMembershipExpired),
    wasNeverAMember: !isAMember && !isMembershipExpired
  }
}