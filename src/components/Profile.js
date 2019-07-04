import 'firebase/auth'
import firebase from 'firebase'
import Avatar from 'react-avatar'
import React from 'react'
import { Link } from 'react-router-dom'
import { CONTACTS, MEMBERS_DIRECTORY, MY_PROFILE, ROOT, USERS } from '../urls'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoggedInState from './LoggedInState'
import { DISPLAY_NAME, MEMBERSHIP_EXPIRES_AT, PHOTO_URL, UID } from '../fields'
import moment from 'moment'
import { Map as IMap } from 'immutable'

function Profile ({ allowUsersPage, allowContactsPage, isMember, userData }) {
  userData = userData.toJS()
  return (
    <span className="dropdown signout-btn text-white-50">
        <a className="dropdown-toggle" id="dropdownMenuLink" href='/'
           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <Avatar name={userData[DISPLAY_NAME]} round color='#6247ea' size={40}
                  src={userData[PHOTO_URL]} />
        </a>

        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
          <Link to={MY_PROFILE} className="dropdown-item">
            My profile
          </Link>
          {
            isMember &&
            <Link to={MEMBERS_DIRECTORY} className="dropdown-item">
              Members
            </Link>
          }
          {
            allowUsersPage &&
            <Link to={USERS} className='dropdown-item'>
              Users
            </Link>
          }
          {
            allowContactsPage &&
            <Link to={CONTACTS} className='dropdown-item'>
              Contacts
            </Link>
          }
          <div className="dropdown-divider" />

          <Link className='dropdown-item' to={ROOT}
                onClick={() => firebase.auth().signOut()}>
            Sign out
          </Link>
        </div>
      </span>
  )
}

Profile.propTypes = {
  allowUsersPage: PropTypes.bool.isRequired,
  allowContactsPage: PropTypes.bool.isRequired,
  currentUser: PropTypes.object,
  userData: PropTypes.object.isRequired,
  isMember: PropTypes.bool.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, currentUser, userData } }) => {
  return {
    allowUsersPage: !!currentUser && (
      !!permissions.usersRead[currentUser[UID]] ||
      !!permissions.usersWrite[currentUser[UID]]),
    allowContactsPage: !!currentUser && (
      !!permissions.contactsRead[currentUser[UID]] ||
      !!permissions.contactsWrite[currentUser[UID]]),
    userData: userData || new IMap(),
    isMember: !!(userData && userData.get(MEMBERSHIP_EXPIRES_AT) && moment(userData.get(MEMBERSHIP_EXPIRES_AT)).isAfter(moment()))
  }
}

export default LoggedInState({ name: 'profile', isRequiredToBeLoggedIn: true })(connect(mapStateToProps)(Profile))
