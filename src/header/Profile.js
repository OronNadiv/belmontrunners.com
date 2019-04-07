import Avatar from 'react-avatar'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { signOut as signOutAction } from '../identity/identityActions'
import { connect } from 'react-redux'

class ProfileView extends Component {
  render () {
    const { currentUser } = this.props
    return (
      <div>
        <a className='signout-btn text-white-50' href='#'
           onClick={() => this.props.signOut()}>
          Sign out
        </a>
        <span style={{
          margin: '0 10px',
          color: 'white'
        }}>Hello, {currentUser.displayName}</span>
        <span className="dropdown-toggle">
          <Avatar name={currentUser.displayName} round color='#6247ea' size={40} />
          <span className="caret" />
        </span>
      </div>
    )
  }
}


ProfileView.propTypes = {
  currentUser: PropTypes.object
}

const mapDispatchToProps = {
  signOut: signOutAction
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileView)
