import React, { useEffect, useState } from 'react'
import { Redirect, withRouter } from 'react-router-dom'
import { SIGN_IN } from '../../urls'
import { connect } from 'react-redux'
import * as PropTypes from 'prop-types'
import { compose } from 'underscore'

const LoggedInState = (params = {}) => {
  let { name, isRequiredToBeLoggedIn = true, canSwitchToLogin = true } = params
  isRequiredToBeLoggedIn = !!isRequiredToBeLoggedIn
  canSwitchToLogin = !!canSwitchToLogin

  return WrappedComponent => {
    const Inner = props => {
      name = name || WrappedComponent.name
      const { ___isCurrentUserLoaded___, ___currentUser___ } = props
      const [redirectToRoot, setRedirectToRoot] = useState(null)

      const [initialIsLoggedIn, setInitialIsLoggedIn] = useState(null)
      useEffect(() => {
        if (!___isCurrentUserLoaded___) {
          // console.log(`user hasn't been fetched yet.`)
          return
        }
        // console.log('user has been fetched.')

        if (initialIsLoggedIn === null) {
          // save state login for later
          setInitialIsLoggedIn(!!___currentUser___)
        }
      }, [___currentUser___, initialIsLoggedIn, ___isCurrentUserLoaded___])

      useEffect(() => {
        // console.log('checkLoginState called.  name:', name)
        if (!___isCurrentUserLoaded___) {
          // console.log(`user hasn't been fetched yet.`)
          return
        }
        if (redirectToRoot) {
          // console.log('initialed redirect.  skipping.')
          return
        }

        // console.log('user has been fetched.')
        const isLoggedIn = !!___currentUser___

        if (isLoggedIn === isRequiredToBeLoggedIn) {
          // console.log(
          //   'state is as expected',
          //   'initialIsLoggedIn',
          //   initialIsLoggedIn,
          //   'isLoggedIn:',
          //   isLoggedIn,
          //   'isRequiredToBeLoggedIn:',
          //   isRequiredToBeLoggedIn
          // )
          setRedirectToRoot(false)
          return
        }

        // state is not as expected
        if (!canSwitchToLogin) {
          // console.log(
          //   'cannot switch to a valid state.  that means redirect to root.'
          // )
          setRedirectToRoot(true)
          return
        }

        // ok, can switch but only to login state.  Let's see if the user was previously logged in')'
        if (!initialIsLoggedIn && isLoggedIn) {
          // console.log(
          //   'the user switched from not logged in to logged in.  We are all good.'
          // )
          setRedirectToRoot(false)
          return
        }

        // console.log(
        //   "user switched state to not logged in and it's not allowed."
        // )
        return setRedirectToRoot(true)
      }, [
        ___currentUser___,
        initialIsLoggedIn,
        ___isCurrentUserLoaded___,
        redirectToRoot
      ])

      if (!___isCurrentUserLoaded___ || redirectToRoot === null) {
        return '' // todo: better to show loading spinner
      }
      const filteredProps = { ...props }
      delete filteredProps.___currentUser___
      delete filteredProps.___isCurrentUserLoaded___

      return redirectToRoot ? (
        <Redirect
          to={{
            pathname: SIGN_IN,
            state: { redirectUrl: props.location.pathname }
          }}
        />
      ) : (
        <WrappedComponent {...filteredProps} />
      )
    }

    const mapStateToProps = ({
                               currentUser: { isCurrentUserLoaded, currentUser }
                             }) => {
      return {
        ___isCurrentUserLoaded___: isCurrentUserLoaded,
        ___currentUser___: currentUser
      }
    }
    Inner.propTypes = {
      ___isCurrentUserLoaded___: PropTypes.bool.isRequired,
      ___currentUser___: PropTypes.object,
      location: PropTypes.shape({
        pathname: PropTypes.string.isRequired
      }).isRequired
    }
    return compose(
      withRouter,
      connect(mapStateToProps)
    )(Inner)
  }
}

LoggedInState.propTypes = {
  name: PropTypes.string.isRequired,
  isRequiredToBeLoggedIn: PropTypes.bool.isRequired,
  canSwitchToLogin: PropTypes.bool
}

export default LoggedInState
