import moment from 'moment'

interface CalcParam {
  membershipExpiresAt?: string | null
}

interface CalcRes {
  isAMember: boolean
  wasNeverAMember: boolean
  isMembershipExpired: boolean
  isMembershipExpiresSoon: boolean
}

const MembershipUtils = (userData: CalcParam, duration = moment.duration(1, 'month')): CalcRes => {
  const membershipExpiresAt = userData.membershipExpiresAt
  const isAMember = membershipExpiresAt && moment().isBefore(moment(membershipExpiresAt))
  const isMembershipExpired = membershipExpiresAt && moment(membershipExpiresAt).isBefore(moment())
  return {
    isAMember: Boolean(isAMember),
    isMembershipExpiresSoon: (isAMember && membershipExpiresAt && moment(membershipExpiresAt).isBefore(moment().add(duration))) || false,
    isMembershipExpired: Boolean(isMembershipExpired),
    wasNeverAMember: !isAMember && !isMembershipExpired
  }
}

export default MembershipUtils
