import Avatar from 'react-avatar'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import 'firebase/auth'
import firebase from 'firebase'

class ProfileView extends Component {
  render () {
    const { currentUser } = this.props
    return (
      <span className="dropdown signout-btn text-white-50">
        <a className="dropdown-toggle" id="dropdownMenuLink" href='https://belmontrunners.com'
           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <Avatar name={currentUser.displayName} round color='#6247ea' size={40} src={currentUser.photoURL} />
        </a>

        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
          <div className="dropdown-item-text text-nowrap">Hello, {currentUser.displayName}</div>
          <div className="dropdown-divider" />
          <a className='dropdown-item' href='https://belmontrunners.com' rel="noopener noreferrer"
             onClick={() => firebase.auth().signOut()}>
            Sign out
          </a>
        </div>
      </span>
    )
  }
}


ProfileView.propTypes = {
  currentUser: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps)(ProfileView)
