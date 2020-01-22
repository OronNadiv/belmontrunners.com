import React, { useEffect, useState } from 'react'
import { Button } from '@material-ui/core'
import { ACTION_COLOR, LINK_COLOR, Snackbar } from '../../components/Snackbar'
import { DID_RECEIVED_SHIRT } from '../../fields'
import moment from 'moment/moment'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser'
import UpdateUserDataHOC from '../../components/HOC/UpdateUserData'
import { Map as IMap } from 'immutable'
import { compose } from 'underscore'
import calc from '../../utilities/membershipUtils'
import { JOIN } from '../../urls'
import { Link } from 'react-router-dom'
import { CurrentUserStore, User } from '../../entities/User'
import { UpdateUserData } from '../../reducers/currentUser'

const POPUP_PAY_MEMBERSHIP_SNOOZED_AT = 'popupPayMembershipSnoozedAt'
const POPUP_RECEIVED_SHIRT_AT = 'popupReceivedShirtSnoozedAt'

interface Props {
  currentUser: firebase.User
  userData: any
  updateUserData: UpdateUserData
}

function Notifications({ currentUser, userData, updateUserData }: Props) {
  const userDataJS: User = userData.toJS()

  const [notification, setNotification] = useState()

  interface Props1 {
    key: string,
    duration?: moment.Duration
  }

  const wasPopupDismissed = ({
                               key,
                               duration = moment.duration(7, 'days')
                             }: Props1) => {
    const snoozedAt =
      userDataJS.notifications ? userDataJS.notifications[key] : undefined

    if (!!snoozedAt && moment().isBefore(moment(snoozedAt).add(duration))) {
      console.log(key + ' dismissed.  snoozedAt:', snoozedAt)
      return true
    }

    console.log(
      'not dismissed.',
      'userData:',
      userDataJS,
      'snoozedAt:',
      snoozedAt,
      'moment(snoozedAt).add(2, \'days\'):',
      moment(snoozedAt)
        .add(2, 'days')
        .format(),
      'moment():',
      moment().format(),
      'moment(snoozedAt).add(2, \'days\').isAfter(moment()):',
      moment(snoozedAt)
        .add(2, 'days')
        .isAfter(moment()),
      'total:',
      !!snoozedAt &&
      moment(snoozedAt)
        .add(2, 'days')
        .isAfter(moment())
    )

    return false
  }

  const dismissNotification = async ({ key }: { key: string }) => {
    try {
      setNotification(undefined)
      await updateUserData(
        {
          notifications: {
            [key]: moment()
              .utc()
              .format()
          }
        },
        { merge: true }
      )
    } catch (error) {
      Sentry.captureException(error)
      console.error('error while dismissNotification.  error:', error)
    }
  }

  const showNotification = ({ message, action }: { message: any, action: any }) => {
    setNotification(<Snackbar message={message} action={action} />)
  }

  const processPayMembershipNotification = () => {
    if (
      wasPopupDismissed({ key: POPUP_PAY_MEMBERSHIP_SNOOZED_AT })
    ) {
      return false
    }

    const membershipStatus = calc(userDataJS)

    let message
    if (membershipStatus.wasNeverAMember) {
      message = 'become a member'
    } else if (
      membershipStatus.isMembershipExpiresSoon ||
      membershipStatus.isMembershipExpired
    ) {
      message = 'renew your membership'
    } else {
      // is a member
      return false
    }

    showNotification({
      message: (
        <>
          Click{' '}
          <Link
            style={{ color: LINK_COLOR }}
            to={{
              pathname: JOIN
            }}
          >
            HERE
          </Link>{' '}
          to {message}
        </>
      ),
      action: (
        <Button
          style={{ color: ACTION_COLOR }}
          size="small"
          onClick={async () =>
            await dismissNotification({
              key: POPUP_PAY_MEMBERSHIP_SNOOZED_AT
            })
          }
        >
          Remind me later
        </Button>
      )
    })
    return true
  }

  const processReceivedShirt = () => {
    console.log('processReceivedShirt called.', userDataJS)
    const membershipStatus = calc(userDataJS)

    if (
      wasPopupDismissed({ key: POPUP_RECEIVED_SHIRT_AT }) ||
      membershipStatus.wasNeverAMember ||
      membershipStatus.isMembershipExpired
    ) {
      return false
    }

    if (userDataJS[DID_RECEIVED_SHIRT]) {
      return false
    }

    // ok, we can show the popup.

    const showDougShelly = () => {
      showNotification({
        message:
          'No problem. Please reach out to Doug or Shelly on the next Saturday run.',
        action: (
          <Button
            style={{ color: ACTION_COLOR }}
            size="small"
            onClick={async () =>
              await dismissNotification({
                key: POPUP_RECEIVED_SHIRT_AT
              })
            }
          >
            Remind me later
          </Button>
        )
      })
    }
    showNotification({
      message: 'Did you receive a running shirt',
      action: (
        <>
          <Button
            color="secondary"
            size="small"
            onClick={async () => {
              try {
                await updateUserData(
                  { [DID_RECEIVED_SHIRT]: true },
                  { merge: true }
                )
                setNotification(undefined)
              } catch (error) {
                Sentry.captureException(error)
                console.error(
                  'error while updating [DID_RECEIVED_SHIRT] to true.  error:',
                  error
                )
              }
            }}
          >
            YES
          </Button>{' '}
          /{' '}
          <Button
            color="secondary"
            size="small"
            onClick={() => showDougShelly()}
          >
            NO
          </Button>
        </>
      )
    })
    return true
  }

  useEffect(() => {
    if (!currentUser) {
      setNotification(undefined)
      return
    }
    processPayMembershipNotification() ||
    processReceivedShirt() ||
    setNotification(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  return <>{notification}</>
}

Notifications.propTypes = {
  currentUser: PropTypes.object,
  updateUserData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser, userData } }: CurrentUserStore) => {
  return {
    currentUser,
    // @ts-ignore
    userData: userData || new IMap()
  }
}

export default compose(
  UpdateUserDataHOC,
  connect(mapStateToProps)
)(Notifications)
