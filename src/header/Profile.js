import 'firebase/auth'
import firebase from 'firebase'
import Avatar from 'react-avatar'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { JOIN, ROOT, USERS } from '../views/urls'
import { STEP_USER_DETAILS } from '../views/signUp/SignUpStepper'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoggedInState from '../views/HOC/LoggedInState'

class ProfileView extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { currentUser, allowUsersPage } = this.props
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
          <Link className="dropdown-item"
                to={{
                  pathname: JOIN,
                  state: { steps: [STEP_USER_DETAILS] }
                }}>
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

ProfileView.propTypes = {
  allowUsersPage: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, currentUser } }) => {
  return {
    allowUsersPage: !!currentUser && (
      !!permissions.usersRead[currentUser.uid] ||
      !!permissions.usersWrite[currentUser.uid]),
    currentUser: currentUser || {}
  }
}

export default connect(mapStateToProps)(LoggedInState({ name: 'profile', isRequiredToBeLoggedIn: true })(ProfileView))
