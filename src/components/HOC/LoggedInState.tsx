import React, { useEffect, useState } from 'react'
import { Redirect, withRouter, RouteComponentProps } from 'react-router-dom'
import { SIGN_IN } from '../../urls'
import { connect } from 'react-redux'
import * as PropTypes from 'prop-types'
import { compose } from 'underscore'
import { IRedisState } from '../../entities/User'

interface Params {
  name?: string | undefined
  isRequiredToBeLoggedIn?: boolean | undefined
  canSwitchToLogin?: boolean | undefined
}

const LoggedInState = (params: Params = {}) => {
  const { isRequiredToBeLoggedIn = true, canSwitchToLogin = true } = params
  let { name } = params

  return (WrappedComponent: any) => {
    interface Props extends RouteComponentProps {
      ___isCurrentUserLoaded___: boolean
      ___currentUser___: firebase.User
    }

    const Inner = (props: Props) => {
      name = name || WrappedComponent.name
      const { ___isCurrentUserLoaded___, ___currentUser___ } = props
      const [redirectToRoot, setRedirectToRoot] = useState<boolean | null>(null)
      const [initialIsLoggedIn, setInitialIsLoggedIn] = useState<boolean | null>(null)

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
        setRedirectToRoot(true)
        return
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
      // @ts-ignore
      delete filteredProps.___currentUser___
      // @ts-ignore
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

    const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, firebaseUser } }: IRedisState) => {
      return {
        ___isCurrentUserLoaded___: isCurrentUserLoaded,
        ___currentUser___: firebaseUser
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
