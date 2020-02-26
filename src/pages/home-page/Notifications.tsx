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
import { IRedisState, IUser, IUserOptionalProps } from '../../entities/User'
import { IUpdateUserData } from '../../reducers/currentUser'

const POPUP_PAY_MEMBERSHIP_SNOOZED_AT = 'popupPayMembershipSnoozedAt'
const POPUP_RECEIVED_SHIRT_AT = 'popupReceivedShirtSnoozedAt'

interface Props {
  firebaseUser: firebase.User
  userData: any
  updateUserData: IUpdateUserData
}

function Notifications({ firebaseUser, userData, updateUserData }: Props) {
  const userDataJS: IUser = userData.toJS()

  const [notification, setNotification] = useState<JSX.Element>()

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
      const values: IUserOptionalProps = { notifications: { [key]: moment().utc().format() } }
      await updateUserData(values, { merge: true }
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
                const values: IUserOptionalProps = { [DID_RECEIVED_SHIRT]: true }
                await updateUserData(values, { merge: true })
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
    if (!firebaseUser) {
      setNotification(undefined)
      return
    }
    processPayMembershipNotification() ||
    processReceivedShirt() ||
    setNotification(undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser, userData])

  return <>{notification}</>
}

Notifications.propTypes = {
  firebaseUser: PropTypes.object,
  updateUserData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { firebaseUser, userData } }: IRedisState) => {
  return {
    firebaseUser,
    userData: userData ||
      // @ts-ignore
      new IMap()
  }
}

export default compose(
  UpdateUserDataHOC,
  connect(mapStateToProps)
)(Notifications)
