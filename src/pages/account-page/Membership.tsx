import React from 'react'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Card, CardContent, Typography } from '@material-ui/core'
import { IRedisState, IUser } from '../../entities/User'
import calc from '../../utilities/membershipUtils'
import { compose } from 'underscore'
import moment from 'moment'
import { Link } from 'react-router-dom'
import { JOIN } from '../../urls'

interface Props {
  userData: any
}

function Membership({ userData }: Props) {
  const userDataJS: IUser = userData.toJS()
  const membershipStatus = calc(userDataJS)
  return (
    <Card className="d-flex flex-row align-content-center my-4">
      <div className="mr-auto">
        <CardContent>
          <Typography component="h6" variant="h6">
            Membership
          </Typography>
          <Typography color="textSecondary">
            {
              membershipStatus.isAMember && userDataJS.membershipExpiresAt &&
              <>
                Your membership expires on <span
                className="text-success">{moment(userDataJS.membershipExpiresAt).format('LL')}.</span>
              </>
            }
            {
              membershipStatus.isMembershipExpired && userDataJS.membershipExpiresAt &&
              <>
                Your membership expired on <span
                className="text-danger">{moment(userDataJS.membershipExpiresAt).format('LL')}</span>. Click <Link
                to={{ pathname: JOIN }}>here</Link> to renew your membership.
              </>
            }
            {
              membershipStatus.isMembershipExpiresSoon && userDataJS.membershipExpiresAt &&
              <>
                Your membership expires on <span
                className="text-danger">{moment(userDataJS.membershipExpiresAt).format('LL')}</span>. Click <Link
                to={{ pathname: JOIN }}>here</Link> to renew your membership.
              </>
            }
            {
              membershipStatus.wasNeverAMember &&
              <>
                You are not a member. Click <Link to={{ pathname: JOIN }}>here</Link> to join.
              </>
            }
          </Typography>
        </CardContent>
      </div>
    </Card>
  )
}

Membership.propTypes = {
  userData: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { userData } }: IRedisState) => {
  return {
    userData: userData ||
      // @ts-ignore
      new IMap()
  }
}

export default compose(
  connect(mapStateToProps)
)(Membership)
