import 'firebase/auth'
import 'firebase/firestore'
import firebase from 'firebase'
import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import { Link } from 'react-router-dom'
import { JOIN } from '../views/urls'
import { STEP_MEMBERSHIP, STEP_USER_DETAILS } from '../views/signUp/SignUpStepper'
import { MEMBERSHIP_EXPIRES_AT } from '../views/signUp/SignUpStepPayment'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import moment from 'moment'
import Promise from 'bluebird'

const POPUP_PAY_MEMBERSHIP_SNOOZED_AT = 'popupSnoozedAt'

class Notifications extends Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  getMembershipStatus () {
    if (!firebase.auth().currentUser) {
      this.setState({ notification: null })
      return
    }
    const transactionsLastRef = firebase.firestore().doc(
      `users/${firebase.auth().currentUser.uid}/transactions/latest`)

    const notificationsRef = firebase.firestore().doc(
      `users/${firebase.auth().currentUser.uid}/notifications/payMembership`)

    Promise.all([
      transactionsLastRef.get(),
      notificationsRef.get()
    ])
      .spread((transactionValues, notificationsValues) => {
        let membershipExpiresAt = null
        let needToPay = true
        const transactionsDocumentData = transactionValues.data()
        const notificationsDocumentData = notificationsValues.data()

        if (notificationsDocumentData) {
          const snoozedAt = notificationsDocumentData[POPUP_PAY_MEMBERSHIP_SNOOZED_AT]
          if (!!snoozedAt && moment(snoozedAt).add(2, 'days').isAfter(moment())) {
            console.log('dismissing.  snoozedAt:', snoozedAt)
            this.setState({ notification: null })
            return
          }
          console.log('not dismissed.  ' +
            'snoozedAt:', snoozedAt,
            "moment(snoozedAt).add(2, 'days'):", moment(snoozedAt).add(2, 'days').format(),
            'moment():', moment().format(),
            "moment(snoozedAt).add(2, 'days').isAfter(moment()):", moment(snoozedAt).add(2, 'days').isAfter(moment()),
            'total:', (!!snoozedAt && moment(snoozedAt).add(2, 'days').isAfter(moment())))
        }
        // ok, we can show the popup.

        if (transactionsDocumentData) {
          membershipExpiresAt = transactionsDocumentData[MEMBERSHIP_EXPIRES_AT]
          if (membershipExpiresAt && moment(membershipExpiresAt).isAfter(moment().add(1, 'month'))) {
            needToPay = false
          }
        }

        const isExistingMember = !!membershipExpiresAt

        if (!needToPay) {
          console.log('does not need to pay.  membershipExpiresAt:', membershipExpiresAt)

          this.setState({ notification: null })
          return
        }
        const notification =
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            open
            key={0}
            message={
              <div>
                Click <Link to={{
                pathname: JOIN,
                state: { steps: [STEP_USER_DETAILS, STEP_MEMBERSHIP] }
              }}>here</Link> to {!isExistingMember ? 'become a member' : 'renew your membership'}
              </div>
            }
            action={<Button color="inherit" size="small" onClick={() => this.snoozeNotification()}>
              Remind me later
            </Button>}
          />

        this.setState({
          notification
        })
      })
      .catch((err) => {
        console.error('could not fetch user data.  err:', err)
        throw err
      })
  }

  componentDidMount () {
    if (firebase.auth().currentUser) {
      this.getMembershipStatus()
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.lastChanged !== this.props.lastChanged) {
      this.getMembershipStatus()
    }
  }

  snoozeNotification () {
    this.setState({ notification: null })

    const notificationsRef = firebase.firestore().doc(
      `users/${firebase.auth().currentUser.uid}/notifications/payMembership`)

    notificationsRef.set({ [POPUP_PAY_MEMBERSHIP_SNOOZED_AT]: moment().utc().format() }, { merge: true })
      .then(() => {
        console.log('snoozed')
      })
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
  lastChanged: PropTypes.number.isRequired
}

const mapStateToProps = (state) => {
  return {
    lastChanged: state.currentUser.lastChanged
  }
}

export default connect(mapStateToProps)(Notifications)
