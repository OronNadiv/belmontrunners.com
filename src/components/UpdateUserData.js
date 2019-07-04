import React, { useEffect, useState } from 'react'
import usePrevious from './usePrevious'
import { connect } from 'react-redux'
import { updateUserData as updateUserDataAction } from '../reducers/currentUser'
import * as PropTypes from 'prop-types'
import uuid from 'uuid/v4'
import _ from 'underscore'

function Outer (WrappedComponent) {
  function Inner (props) {
    const { currentUser, userDataUpdating, userDataUpdateError, updateUserData, userDataUpdateContext } = props
    const [deferreds, setDeferreds] = useState([])
    const prevUserDataUpdating = usePrevious(userDataUpdating)
    useEffect(() => {
      if (prevUserDataUpdating && !userDataUpdating && deferreds.length) {
        const promise = _.findWhere(deferreds, { context: userDataUpdateContext })
        if (promise) {
          if (!userDataUpdateError) {
            promise.resolve()
          } else {
            promise.reject(userDataUpdateError)
          }
        }
      }

    }, [prevUserDataUpdating, userDataUpdating, userDataUpdateError, userDataUpdateContext, deferreds])

    const updateUserDataWrapper = async (vals, options) => {
      if (!currentUser) {
        throw new Error('user was not loaded yet or unauthenticated.')
      }
      const context = uuid()
      var promise = new Promise(function (resolve, reject) {
        deferreds.push({ resolve: resolve, reject: reject, context })
      })

      setDeferreds([promise, ...deferreds])
      updateUserData(vals, { ...options }, context)
      return promise
    }
    const newProps = { ...props }
    delete newProps.userDataUpdating
    delete newProps.userDataUpdateError
    delete newProps.userDataUpdateContext
    newProps.updateUserData = updateUserDataWrapper
    return <WrappedComponent {...newProps} />
  }

  const mapStateToProps = ({ currentUser: { currentUser, userDataUpdating, userDataUpdateError, userDataUpdateContext } }) => {
    return {
      currentUser,
      userDataUpdating,
      userDataUpdateError,
      userDataUpdateContext
    }
  }
  const mapDispatchToProps = {
    updateUserData: updateUserDataAction
  }

  Inner.propTypes = {
    currentUser: PropTypes.object,
    userDataUpdating: PropTypes.bool.isRequired,
    userDataUpdateError: PropTypes.object,
    userDataUpdateContext: PropTypes.any,
    updateUserData: PropTypes.func.isRequired
  }
  return connect(mapStateToProps, mapDispatchToProps)(Inner)
}

export default Outer
