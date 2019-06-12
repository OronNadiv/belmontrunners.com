import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import { Link } from 'react-router-dom'
import { JOIN } from '../../urls'
import { STEP_MEMBERSHIP, STEP_USER_DETAILS } from '../sign-up-page/SignUpStepper'
import { DID_RECEIVED_SHIRT, MEMBERSHIP_EXPIRES_AT } from '../../fields'
import moment from 'moment/moment'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import SnackbarContent from '@material-ui/core/SnackbarContent/index'
import { updateUserData as updateUserDataAction } from '../../reducers/currentUser'

const POPUP_PAY_MEMBERSHIP_SNOOZED_AT = 'popupPayMembershipSnoozedAt'
const POPUP_RECEIVED_SHIRT_AT = 'popupReceivedShirtSnoozedAt'
const ACTION_COLOR = '#b39ddb'
const LINK_COLOR = 'crimson'

class Notifications extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  wasPopupDismissed ({ userData, notificationKey, days = 7 }) {
    const snoozedAt = userData.notifications && userData.notifications[notificationKey]

    if (!!snoozedAt && moment(snoozedAt).add(days, 'days').isAfter(moment())) {
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

  dismissNotification ({ notificationKey }) {
    const { updateUserData } = this.props
    this.setState({ notification: null })
    updateUserData({ notifications: { [notificationKey]: moment().utc().format() } }, { merge: true })
  }


  showNotification ({ message, action }) {
    const notification =
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open
        key={0}
      >
        <SnackbarContent
          aria-describedby="client-snackbar"
          style={{ backgroundColor: '#673ab7' }}
          message={message}
          action={action}
        />
      </Snackbar>

    this.setState({
      notification
    })
  }

  didPayMembership ({ userData }) {
    const membershipExpiresAt = userData[MEMBERSHIP_EXPIRES_AT]
    return membershipExpiresAt && moment(membershipExpiresAt).isAfter(moment().add(1, 'month'))
  }

  processPayMembershipNotification ({ userData }) {
    if (this.wasPopupDismissed({ userData, notificationKey: POPUP_PAY_MEMBERSHIP_SNOOZED_AT })) {
      return
    }

    // ok, we can show the popup.

    if (this.didPayMembership({ userData })) {
      return
    }

    const isExistingMember = !!userData[MEMBERSHIP_EXPIRES_AT]

    this.showNotification({
      message:
        <div>
          Click <Link
          style={{ color: LINK_COLOR }}
          to={{
            pathname: JOIN,
            state: { steps: [STEP_USER_DETAILS, STEP_MEMBERSHIP] }
          }}>HERE</Link> to {!isExistingMember ? 'become a member' : 'renew your membership'}
        </div>,
      action:
        <Button
          style={{ color: ACTION_COLOR }}
          size="small"
          onClick={() => this.dismissNotification({ notificationKey: POPUP_PAY_MEMBERSHIP_SNOOZED_AT })}>
          Remind me later
        </Button>
    })
  }

  processReceivedShirt ({ userData }) {
    const { updateUserData } = this.props
    if (this.wasPopupDismissed({
      userData,
      notificationKey: POPUP_RECEIVED_SHIRT_AT
    }) || !this.didPayMembership({ userData })) {
      return
    }

    if (userData[DID_RECEIVED_SHIRT]) {
      return
    }

    // ok, we can show the popup.

    const showDougShelly = () => {
      this.showNotification({
        message:
          'No problem. Please reach out to Doug or Shelly on the next Saturday run.',
        action:
          <Button
            style={{ color: ACTION_COLOR }}
            size="small"
            onClick={() => {
              console.log('dismissing POPUP_RECEIVED_SHIRT_AT, after Doug & Shelly message.')
              this.dismissNotification({ notificationKey: POPUP_RECEIVED_SHIRT_AT })
            }}>
            Remind me later
          </Button>
      })
    }
    this.showNotification({
      message:
        'Did you receive a running shirt',
      action:
        <div>
          <Button
            color='secondary'
            size="small"
            onClick={() => {
              updateUserData({ DID_RECEIVED_SHIRT: true }, { merge: true })
            }}>
            YES
          </Button> / <Button
          color='secondary'
          size="small"
          onClick={() => showDougShelly()}>
          NO
        </Button>
        </div>
    })
  }

  processNotifications () {
    const { currentUser } = this.props
    const userData = this.props.userData.toJS()
    if (!currentUser) {
      this.setState({ notification: null })
      return
    }
    this.processPayMembershipNotification({ userData }) || this.processReceivedShirt({ userData })
  }

  componentDidMount () {
    this.processNotifications()
  }

  componentDidUpdate (prevProps) {
    prevProps.currentUser !== this.props.currentUser && this.processNotifications()
  }

  render () {
    return (
      <div>
        {this.state.notification}
      </div>
    )
  }
}

Notifications.propTypes = {
  currentUser: PropTypes.object,
  updateUserData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired
}

const mapDispatchToProps = {
  updateUserData: updateUserDataAction
}

const mapStateToProps = ({ currentUser: { currentUser, userData } }) => {
  return {
    currentUser,
    userData
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Notifications)
