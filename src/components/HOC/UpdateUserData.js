import React, { useEffect, useState } from 'react'
import usePrevious from '../usePrevious'
import { connect } from 'react-redux'
import { updateUserData as updateUserDataAction } from '../../reducers/currentUser'
import * as PropTypes from 'prop-types'
import uuid from 'uuid/v4'
import { findWhere } from 'underscore'

function UpdateUserData(WrappedComponent) {
  function Inner(props) {
    const {
      ___firebaseUser___,
      ___userDataUpdating___,
      ___userDataUpdateError___,
      updateUserData,
      ___userDataUpdateContext___
    } = props
    const [deferreds, setDeferreds] = useState([])
    const prevUserDataUpdating = usePrevious(___userDataUpdating___)
    useEffect(() => {
      if (prevUserDataUpdating && !___userDataUpdating___ && deferreds.length) {
        const promise = findWhere(deferreds, {
          context: ___userDataUpdateContext___
        })
        if (promise) {
          if (!___userDataUpdateError___) {
            promise.resolve()
          } else {
            promise.reject(___userDataUpdateError___)
          }
        }
      }
    }, [
      prevUserDataUpdating,
      ___userDataUpdating___,
      ___userDataUpdateError___,
      ___userDataUpdateContext___,
      deferreds
    ])

    const updateUserDataWrapper = async (vals, options) => {
      if (!___firebaseUser___) {
        throw new Error('user was not loaded yet or unauthenticated.')
      }
      const context = uuid()
      var promise = new Promise(function(resolve, reject) {
        deferreds.push({ resolve: resolve, reject: reject, context })
      })

      setDeferreds([promise, ...deferreds])
      updateUserData(vals, { ...options }, context)
      return promise
    }
    const newProps = { ...props }

    delete newProps.___firebaseUser___
    delete newProps.___userDataUpdating___
    delete newProps.___userDataUpdateError___
    delete newProps.___userDataUpdateContext___

    newProps.updateUserData = updateUserDataWrapper

    return <WrappedComponent {...newProps} />
  }

  const mapStateToProps = ({
    currentUser: {
      firebaseUser,
      userDataUpdating,
      userDataUpdateError,
      userDataUpdateContext
    }
  }) => {
    return {
      ___firebaseUser___: firebaseUser,
      ___userDataUpdating___: userDataUpdating,
      ___userDataUpdateError___: userDataUpdateError,
      ___userDataUpdateContext___: userDataUpdateContext
    }
  }
  const mapDispatchToProps = {
    updateUserData: updateUserDataAction
  }

  Inner.propTypes = {
    ___firebaseUser___: PropTypes.object,
    ___userDataUpdating___: PropTypes.bool.isRequired,
    ___userDataUpdateError___: PropTypes.object,
    ___userDataUpdateContext___: PropTypes.any,
    updateUserData: PropTypes.func.isRequired
  }
  return connect(mapStateToProps, mapDispatchToProps)(Inner)
}

export default UpdateUserData
