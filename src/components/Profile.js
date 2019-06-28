import 'firebase/auth'
import firebase from 'firebase'
import Avatar from 'react-avatar'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { CONTACTS, MEMBERS_DIRECTORY, MY_PROFILE, ROOT, USERS } from '../urls'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoggedInState from './LoggedInState'
import { MEMBERSHIP_EXPIRES_AT } from '../fields'
import moment from 'moment'

class Profile extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { currentUser, allowUsersPage, allowContactsPage, userData } = this.props
    const isMember = userData && userData.get(MEMBERSHIP_EXPIRES_AT) && moment(userData.get(MEMBERSHIP_EXPIRES_AT)).isAfter(moment())

    return (
      <span className="dropdown signout-btn text-white-50">
        <a className="dropdown-toggle" id="dropdownMenuLink" href='/'
           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <Avatar name={currentUser.displayName} round color='#6247ea' size={40}
                  src={currentUser.photoURL} />
        </a>

        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
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

          <Link to={MY_PROFILE} className="dropdown-item">
            My profile
          </Link>
          {
            isMember &&
            <Link to={MEMBERS_DIRECTORY} className="dropdown-item">
              Members Directory
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
}

Profile.propTypes = {
  allowUsersPage: PropTypes.bool.isRequired,
  allowContactsPage: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired

}

const mapStateToProps = ({ currentUser: { permissions, currentUser, userData } }) => {
  return {
    allowUsersPage: !!currentUser && (
      !!permissions.usersRead[currentUser.uid] ||
      !!permissions.usersWrite[currentUser.uid]),
    allowContactsPage: !!currentUser && (
      !!permissions.contactsRead[currentUser.uid] ||
      !!permissions.contactsWrite[currentUser.uid]),
    currentUser: currentUser || {},
    userData: userData || {}
  }
}

export default LoggedInState({ name: 'profile', isRequiredToBeLoggedIn: true })(connect(mapStateToProps)(Profile))
