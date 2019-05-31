import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { ROOT } from '../urls'
import { connect } from 'react-redux'
import * as PropTypes from 'prop-types'

export default ({ name, isRequiredToBeLoggedIn, canSwitchToLogin }) => {
  return (WrappedComponent) => {
    class HOC extends Component {
      constructor (props) {
        super(props)
        this.state = {
          initialIsLoggedIn: null
        }
      }

      checkLoginState () {
        console.log('checkLoginState called.  name:', name)
        const { isCurrentUserLoaded, currentUser } = this.props
        if (!isCurrentUserLoaded) {
          console.log(`user hasn't been fetched yet.`)
          return
        }

        console.log('user has been fetched.')
        const isLoggedIn = !!currentUser

        // save state login for later
        if (this.state.initialIsLoggedIn === null) {
          this.setState({ initialIsLoggedIn: isLoggedIn })
        }

        isRequiredToBeLoggedIn = !!isRequiredToBeLoggedIn
        if (isLoggedIn === isRequiredToBeLoggedIn) {
          console.log('state is as expected',
            'initialIsLoggedIn', this.state.initialIsLoggedIn,
            'isLoggedIn:', isLoggedIn,
            'isRequiredToBeLoggedIn:', isRequiredToBeLoggedIn)
          return
        }

        // state is not as expected
        canSwitchToLogin = !!canSwitchToLogin
        if (!canSwitchToLogin) {
          console.log('cannot switch to a valid state.  that means redirect to root.')
          return this.setState({ redirectToRoot: true })
        }

        // ok, can switch but only to login state.  Let's see if the user was previously logged in')'
        if (!this.state.initialIsLoggedIn && isLoggedIn) {
          console.log('the user switched from not logged in to logged in.  We are all good.')
          return
        }

        console.log('user switched state to not logged in and it\'s not allowed.')
        return this.setState({ redirectToRoot: true })

      }

      componentDidMount () {
        this.checkLoginState()
      }

      componentDidUpdate (prevProps, prevState, snapshot) {
        if (prevProps.isCurrentUserLoaded !== this.props.isCurrentUserLoaded) {
          this.checkLoginState()
        }
      }

      render () {
        const { isCurrentUserLoaded } = this.props
        if (!isCurrentUserLoaded) {
          return null // todo: better to show loading spinner
        }
        return this.state.redirectToRoot ?
          <Redirect to={ROOT} /> :
          <WrappedComponent {...this.props} />
      }
    }

    HOC.propTypes = {
      isCurrentUserLoaded: PropTypes.bool.isRequired,
      currentUser: PropTypes.object
    }

    const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, currentUser } }) => {
      return {
        isCurrentUserLoaded,
        currentUser
      }
    }

    return connect(mapStateToProps)(HOC)
  }
}