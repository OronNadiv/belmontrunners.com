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
        const { lastChanged } = this.props
        const isLoggedIn = !!firebase.auth().currentUser
        isRequiredToBeLoggedIn = !!isRequiredToBeLoggedIn
        isAllowStateChange = !!isAllowStateChange
        console.log('name:', name,
          'lastChanged:', lastChanged,
          'isLoggedIn:', !!isLoggedIn,
          'isRequiredToBeLoggedIn:', isRequiredToBeLoggedIn,
          'isAllowStateChange:', isAllowStateChange)
        if (lastChanged && isLoggedIn !== isRequiredToBeLoggedIn) {
          console.log('Inside 1.',
            'isAllowStateChange:', isAllowStateChange)
          if (!isAllowStateChange) {
            console.log('Inside 2.', 'redirecting to root')
            return <Redirect to={ROOT} />
          }
        }

        return <WrappedComponent {...this.props} />
      }
    }

    HOC.propTypes = {
      lastChanged: PropTypes.number.isRequired

    }
    const mapDispatchToProps = {
      fetchCurrentUser: fetchCurrentUserAction
    }

    const mapStateToProps = (state) => {
      return { lastChanged: state.currentUser.lastChanged }
    }

    return connect(mapStateToProps, mapDispatchToProps)(HOC)
  }
}