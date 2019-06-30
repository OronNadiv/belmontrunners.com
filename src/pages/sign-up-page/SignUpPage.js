import React, { useEffect, useState } from 'react'
import SignUpStepper, { STEP_AUTHENTICATION, STEP_MEMBERSHIP, STEP_USER_DETAILS } from './SignUpStepper'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'

function SignUpPage ({ isCurrentUserLoaded, currentUser }) {
  const [steps, setSteps] = useState([])
  useEffect(() => {
    if (!isCurrentUserLoaded) {
      return
    }
    if (currentUser) {
      setSteps([STEP_USER_DETAILS, STEP_MEMBERSHIP])
    } else {
      setSteps([STEP_AUTHENTICATION, STEP_USER_DETAILS, STEP_MEMBERSHIP])
    }
  }, [isCurrentUserLoaded, currentUser])


  if (!isCurrentUserLoaded || !steps.length) {
    // todo: show loading
    return <></>
  }
  console.log('steps:', steps)
  return (
    <div className='container-fluid'>
      <div className='d-flex justify-content-center'>
        <SignUpStepper steps={steps} />
      </div>
    </div>
  )
}

SignUpPage.propTypes = {
  isCurrentUserLoaded: PropTypes.bool.isRequired,
  currentUser: PropTypes.object
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, currentUser } }) => {
  return {
    isCurrentUserLoaded,
    currentUser
  }
}

export default connect(mapStateToProps)(SignUpPage)
