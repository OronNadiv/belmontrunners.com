import 'firebase/auth'
import firebase from 'firebase'
import React from 'react'
import { Redirect } from 'react-router-dom'
import { ROOT } from '../urls'
import { fetchCurrentUser as fetchCurrentUserAction } from '../../reducers/currentUser'
import { connect } from 'react-redux'
import * as PropTypes from 'prop-types'

export default ({ name, isRequiredToBeLoggedIn, isAllowStateChange }) => {
  return (WrappedComponent) => {
    class HOC extends React.Component {
      constructor (props) {
        super(props)
        this.state = {}
      }

      render () {
        const { isLoaded } = this.props
        const isLoggedIn = !!firebase.auth().currentUser
        isRequiredToBeLoggedIn = !!isRequiredToBeLoggedIn
        isAllowStateChange = !!isAllowStateChange
        console.log('name:', name,
          'isLoaded:', isLoaded,
          'isLoggedIn:', !!isLoggedIn,
          'isRequiredToBeLoggedIn:', isRequiredToBeLoggedIn,
          'isAllowStateChange:', isAllowStateChange)
        if (isLoaded && isLoggedIn !== isRequiredToBeLoggedIn) {
          console.log('Inside 1.',
            'isAllowStateChange:', isAllowStateChange,
            'isStateChanged:', this.state.isStateChanged)
          if (!isAllowStateChange || !this.state.isStateChanged) {
            console.log('Inside 2.', 'redirecting to root')
            return <Redirect
              to={{
                pathname: ROOT
              }}
            />
          }
        }

        return <WrappedComponent isCurrentUserLoaded={isLoaded} {...this.props} />
      }
    }

    HOC.propTypes = {
      isLoaded: PropTypes.bool

    }
    const mapDispatchToProps = {
      fetchCurrentUser: fetchCurrentUserAction
    }

    const mapStateToProps = (state) => {
      return { isLoaded: state.currentUser.isLoaded }
    }

    return connect(mapStateToProps, mapDispatchToProps)(HOC)
  }
}