import 'firebase/auth'
import firebase from 'firebase'
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
        this.state = {}
      }

      checkLoginState () {
        const { lastChanged } = this.props
        console.log('user hasn\'t been fetched yet.')
        if (!lastChanged) {
          return
        }

        console.log('user has been fetched.')
        const isLoggedIn = !!firebase.auth().currentUser

        // save state login for later
        this.setState({ initialIsLoggedIn: isLoggedIn })

        isRequiredToBeLoggedIn = !!isRequiredToBeLoggedIn
        if (isLoggedIn === isRequiredToBeLoggedIn) {
          console.log('state is as expected.')
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
        if (prevProps.lastChanged !== this.props.lastChanged) {
          this.checkLoginState()
        }
      }

      render () {
        if (!this.props.lastChanged) {
          return null // todo: better to show loading spinner
        }
        return this.state.redirectToRoot ?
          <Redirect to={ROOT} /> :
          <WrappedComponent {...this.props} />
      }
    }

    HOC.propTypes = {
      lastChanged: PropTypes.number.isRequired

    }

    const mapStateToProps = (state) => {
      return { lastChanged: state.currentUser.lastChanged }
    }

    return connect(mapStateToProps)(HOC)
  }
}