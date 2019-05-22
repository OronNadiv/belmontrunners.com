import 'firebase/auth'
import firebase from 'firebase'
import Avatar from 'react-avatar'
import React, { Component } from 'react'
import LoggedInState from '../views/HOC/LoggedInState'

class ProfileView extends Component {
  render () {
    const { currentUser } = firebase.auth()

    return (
      <span className="dropdown signout-btn text-white-50">
        <a className="dropdown-toggle" id="dropdownMenuLink" href='/'
           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <Avatar name={currentUser.displayName} round color='#6247ea' size={40} src={currentUser.photoURL} />
        </a>

        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          <div className="dropdown-item-text text-nowrap">Hello, {currentUser.displayName}</div>
          <div className="dropdown-divider" />
          <a className='dropdown-item' href='/' rel="noopener noreferrer"
             onClick={() => firebase.auth().signOut()}>
            Sign out
          </a>
        </div>
      </span>
    )
  }
}


export default LoggedInState({name: 'profile', isRequiredToBeLoggedIn: true})(ProfileView)
