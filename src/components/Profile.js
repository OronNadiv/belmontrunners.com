import 'firebase/auth'
import firebase from 'firebase'
import Avatar from 'react-avatar'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { ROOT, CONTACTS, MY_PROFILE, USERS } from '../urls'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoggedInState from './LoggedInState'

class Profile extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { currentUser, allowUsersPage, allowContactsPage } = this.props
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
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, currentUser } }) => {
  return {
    allowUsersPage: !!currentUser && (
      !!permissions.usersRead[currentUser.uid] ||
      !!permissions.usersWrite[currentUser.uid]),
    allowContactsPage: !!currentUser && (
      !!permissions.contactsRead[currentUser.uid] ||
      !!permissions.contactsWrite[currentUser.uid]),
    currentUser: currentUser || {}
  }
}

export default connect(mapStateToProps)(LoggedInState({ name: 'profile', isRequiredToBeLoggedIn: true })(Profile))
