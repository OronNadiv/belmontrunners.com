import 'firebase/auth'
import firebase from 'firebase'
import Avatar from 'react-avatar'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { JOIN, ROOT, USERS } from '../views/urls'
import { STEP_USER_DETAILS } from '../views/signUp/SignUpStepper'
import Promise from 'bluebird'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoggedInState from '../views/HOC/LoggedInState'

class ProfileView extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  loadPermissions () {
    if (!firebase.auth().currentUser) {
      this.setState({
        allowUsersPage: false
      })
      return
    }
    const usersWriteRef = firebase.firestore().doc('permissions/usersWrite')
    const usersReadRef = firebase.firestore().doc('permissions/usersRead')
    Promise.all([usersWriteRef.get(), usersReadRef.get()])
      .spread((docWrite, docRead) => {
        const dataWrite = docWrite.data()
        const dataRead = docRead.data()
        this.setState({
          allowUsersPage: !!dataRead[firebase.auth().currentUser.uid] || !!dataWrite[firebase.auth().currentUser.uid]
        })
      })
  }

  componentDidMount () {
    this.loadPermissions()
  }

  componentDidUpdate (prevProps) {
    prevProps.lastChanged !== this.props.lastChanged && this.loadPermissions()
  }


  render () {
    const { currentUser } = firebase.auth()

    return (
      <span className="dropdown signout-btn text-white-50">
        <a className="dropdown-toggle" id="dropdownMenuLink" href='/'
           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <Avatar name={currentUser.displayName} round color='#6247ea' size={40}
                  src={currentUser.photoURL} />
        </a>

        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
          {
            this.state.allowUsersPage &&
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
  lastChanged: PropTypes.number.isRequired
}

const mapStateToProps = (state) => {
  return {
    lastChanged: state.currentUser.lastChanged
  }
}

export default connect(mapStateToProps)(LoggedInState({ name: 'profile', isRequiredToBeLoggedIn: true })(ProfileView))
