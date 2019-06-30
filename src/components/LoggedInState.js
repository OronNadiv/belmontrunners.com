import React, { useCallback, useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { ROOT } from '../urls'
import { connect } from 'react-redux'
import * as PropTypes from 'prop-types'
import usePrevious from './usePrevious'

const outer = ({ name, isRequiredToBeLoggedIn, canSwitchToLogin }) => {
  const inner = (WrappedComponent) => {
    const HOC = (props) => {
      const { isCurrentUserLoaded, currentUser } = props
      const [redirectToRoot, setRedirectToRoot] = useState(false)

      const [initialIsLoggedIn, setInitialIsLoggedIn] = useState(null)
      useEffect(() => {
        if (!isCurrentUserLoaded) {
          console.log(`user hasn't been fetched yet.`)
          return
        }
        if (redirectToRoot) {
          console.log('initialed redirect.  skipping.')
          return
        }
        console.log('user has been fetched.')
        const isLoggedIn = !!currentUser

        // save state login for later
        if (initialIsLoggedIn === null) {
          setInitialIsLoggedIn(isLoggedIn)
        }
      }, [currentUser, initialIsLoggedIn, isCurrentUserLoaded, redirectToRoot])

      const checkLoginState = useCallback(() => {
        console.log('checkLoginState called.  name:', name)
        if (!isCurrentUserLoaded) {
          console.log(`user hasn't been fetched yet.`)
          return
        }
        if (redirectToRoot) {
          console.log('initialed redirect.  skipping.')
          return
        }

        console.log('user has been fetched.')
        const isLoggedIn = !!currentUser

        isRequiredToBeLoggedIn = !!isRequiredToBeLoggedIn
        if (isLoggedIn === isRequiredToBeLoggedIn) {
          console.log('state is as expected',
            'initialIsLoggedIn', initialIsLoggedIn,
            'isLoggedIn:', isLoggedIn,
            'isRequiredToBeLoggedIn:', isRequiredToBeLoggedIn)
          return
        }

        // state is not as expected
        canSwitchToLogin = !!canSwitchToLogin
        if (!canSwitchToLogin) {
          console.log('cannot switch to a valid state.  that means redirect to root.')
          setRedirectToRoot(true)
          return
        }

        // ok, can switch but only to login state.  Let's see if the user was previously logged in')'
        if (!initialIsLoggedIn && isLoggedIn) {
          console.log('the user switched from not logged in to logged in.  We are all good.')
          return
        }

        console.log('user switched state to not logged in and it\'s not allowed.')
        return setRedirectToRoot(true)
      }, [currentUser, initialIsLoggedIn, isCurrentUserLoaded, redirectToRoot])

      useEffect(checkLoginState, [])

      const prevIsCurrentUserLoaded = usePrevious(isCurrentUserLoaded)
      useEffect(() => {
        if (prevIsCurrentUserLoaded !== isCurrentUserLoaded) {
          checkLoginState()
        }
      }, [prevIsCurrentUserLoaded, isCurrentUserLoaded, checkLoginState])

      if (!isCurrentUserLoaded) {
        return null // todo: better to show loading spinner
      }
      const filteredProps = { ...props }
      delete filteredProps.currentUser
      delete filteredProps.isCurrentUserLoaded
      return redirectToRoot ?
        <Redirect to={ROOT} /> :
        <WrappedComponent {...filteredProps} />
    }

    const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, currentUser } }) => {
      return {
        isCurrentUserLoaded,
        currentUser
      }
    }
    HOC.propTypes = {
      isCurrentUserLoaded: PropTypes.bool.isRequired,
      currentUser: PropTypes.object
    }
    return connect(mapStateToProps)(HOC)
  }
  return inner
}

outer.propTypes = {
  name: PropTypes.string.isRequired,
  isRequiredToBeLoggedIn: PropTypes.bool.isRequired,
  canSwitchToLogin: PropTypes.bool
}

export default outer