import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { ROOT } from '../urls'
import { connect } from 'react-redux'
import * as PropTypes from 'prop-types'

const outer = ({ name, isRequiredToBeLoggedIn, canSwitchToLogin }) => {
  const inner = (WrappedComponent) => {
    const HOC = (props) => {
      const { isCurrentUserLoaded, currentUser } = props
      const [redirectToRoot, setRedirectToRoot] = useState(null)

      const [initialIsLoggedIn, setInitialIsLoggedIn] = useState(null)
      useEffect(() => {
        if (!isCurrentUserLoaded) {
          console.log(`user hasn't been fetched yet.`)
          return
        }
        console.log('user has been fetched.')

        if (initialIsLoggedIn === null) {
          // save state login for later
          console.log(2)
          setInitialIsLoggedIn(!!currentUser)
        }
      }, [currentUser, initialIsLoggedIn, isCurrentUserLoaded])

      useEffect(() => {
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
          setRedirectToRoot(false)
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
          setRedirectToRoot(false)
          return
        }

        console.log('user switched state to not logged in and it\'s not allowed.')
        return setRedirectToRoot(true)
      }, [currentUser, initialIsLoggedIn, isCurrentUserLoaded, redirectToRoot])

      if (!isCurrentUserLoaded || redirectToRoot === null) {
        return '' // todo: better to show loading spinner
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