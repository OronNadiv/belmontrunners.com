import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import { ACTION_COLOR, LINK_COLOR, Snackbar } from '../../components/Snackbar'
import { DID_RECEIVED_SHIRT } from '../../fields'
import moment from 'moment/moment'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as Sentry from '@sentry/browser'
import UpdateUserData from '../../components/HOC/UpdateUserData'
import { Map as IMap } from 'immutable'
import { compose } from 'underscore'
import {
  calc,
  IS_MEMBERSHIP_EXPIRED,
  IS_MEMBERSHIP_EXPIRES_SOON,
  WAS_NEVER_A_MEMBER
} from '../../utilities/membershipUtils'
import { JOIN } from '../../urls'
import { Link } from 'react-router-dom'

const POPUP_PAY_MEMBERSHIP_SNOOZED_AT = 'popupPayMembershipSnoozedAt'
const POPUP_RECEIVED_SHIRT_AT = 'popupReceivedShirtSnoozedAt'

function Notifications ({ currentUser, userData, updateUserData }) {
  userData = userData.toJS()

  const [notification, setNotification] = useState()

  const wasPopupDismissed = ({ notificationKey, duration = moment.duration(7, 'days') }) => {
    const snoozedAt = userData.notifications && userData.notifications[notificationKey]

    if (!!snoozedAt && moment().isBefore(moment(snoozedAt).add(duration))) {
      console.log(notificationKey + ' dismissed.  snoozedAt:', snoozedAt)
      return true
    }

    console.log('not dismissed.',
      'userData:', userData,
      'snoozedAt:', snoozedAt,
      "moment(snoozedAt).add(2, 'days'):", moment(snoozedAt).add(2, 'days').format(),
      'moment():', moment().format(),
      "moment(snoozedAt).add(2, 'days').isAfter(moment()):", moment(snoozedAt).add(2, 'days').isAfter(moment()),
      'total:', (!!snoozedAt && moment(snoozedAt).add(2, 'days').isAfter(moment())))

    return false
  }

  const dismissNotification = async ({ notificationKey }) => {
    try {
      setNotification()
      await updateUserData({ notifications: { [notificationKey]: moment().utc().format() } }, { merge: true })
    } catch (error) {
      Sentry.captureException(error)
      console.error('error while dismissNotification.  error:', error)
    }
  }

  const showNotification = ({ message, action }) => {
    setNotification(<Snackbar message={message} action={action} />)
  }

  const processPayMembershipNotification = () => {
    if (wasPopupDismissed({ notificationKey: POPUP_PAY_MEMBERSHIP_SNOOZED_AT })) {
      return false
    }

    const membershipStatus = calc(userData)

    let message
    if (membershipStatus[WAS_NEVER_A_MEMBER]) {
      message = 'become a member'
    } else if (membershipStatus[IS_MEMBERSHIP_EXPIRES_SOON] || membershipStatus[IS_MEMBERSHIP_EXPIRED]) {
      message = 'renew your membership'
    } else {
      // is a member
      return false
    }

    showNotification({
      message:
        <>
          Click <Link
          style={{ color: LINK_COLOR }}
          to={{
            pathname: JOIN
          }}>HERE</Link> to {message}
        </>,
      action:
        <Button
          style={{ color: ACTION_COLOR }}
          size="small"
          onClick={async () => await dismissNotification({ notificationKey: POPUP_PAY_MEMBERSHIP_SNOOZED_AT })}>
          Remind me later
        </Button>
    })
    return true
  }

  const processReceivedShirt = () => {
    console.log('processReceivedShirt called.', userData)
    const membershipStatus = calc(userData)

    if (wasPopupDismissed({ notificationKey: POPUP_RECEIVED_SHIRT_AT }) ||
      membershipStatus[WAS_NEVER_A_MEMBER] ||
      membershipStatus[IS_MEMBERSHIP_EXPIRED]
    ) {
      return false
    }

    if (userData[DID_RECEIVED_SHIRT]) {
      return false
    }

    // ok, we can show the popup.

    const showDougShelly = () => {
      showNotification({
        message:
          'No problem. Please reach out to Doug or Shelly on the next Saturday run.',
        action:
          <Button
            style={{ color: ACTION_COLOR }}
            size="small"
            onClick={async () => await dismissNotification({ notificationKey: POPUP_RECEIVED_SHIRT_AT })}>
            Remind me later
          </Button>
      })
    }
    showNotification({
      message:
        'Did you receive a running shirt',
      action:
        <>
          <Button
            color='secondary'
            size="small"
            onClick={async () => {
              try {
                await updateUserData({ [DID_RECEIVED_SHIRT]: true }, { merge: true })
                setNotification()
              } catch (error) {
                Sentry.captureException(error)
                console.error('error while updating [DID_RECEIVED_SHIRT] to true.  error:', error)
              }
            }}>
            YES
          </Button> / <Button
          color='secondary'
          size="small"
          onClick={() => showDougShelly()}>
          NO
        </Button>
        </>
    })
    return true
  }

  useEffect(() => {
    if (!currentUser) {
      setNotification()
      return
    }
    processPayMembershipNotification() || processReceivedShirt() || setNotification()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  return <>{notification}</>
}

Notifications.propTypes = {
  currentUser: PropTypes.object,
  updateUserData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser, userData } }) => {
  return {
    currentUser,
    userData: userData || new IMap()
  }
}

export default compose(
  UpdateUserData,
  connect(mapStateToProps)
)(Notifications)
