import React, { useEffect, useState } from 'react'
import SignUpStepper, {
  STEP_AUTHENTICATION,
  STEP_MEMBERSHIP,
  STEP_USER_DETAILS
} from './SignUpStepper'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { CurrentUserStore } from '../../entities/User'

interface Props {
  isCurrentUserLoaded: boolean
  currentUser: firebase.User
}

function SignUpPage({ isCurrentUserLoaded, currentUser }: Props) {
  const [steps, setSteps] = useState()
  useEffect(() => {
    if (!isCurrentUserLoaded) {
      return
    }
    if (steps) {
      // num of steps already decided based on the user's state.
      return
    }
    if (currentUser) {
      setSteps([STEP_USER_DETAILS, STEP_MEMBERSHIP])
    } else {
      setSteps([STEP_AUTHENTICATION, STEP_USER_DETAILS, STEP_MEMBERSHIP])
    }
  }, [isCurrentUserLoaded, currentUser, steps])

  if (!isCurrentUserLoaded || !steps) {
    // todo: show loading
    return <></>
  }
  console.log('steps:', steps)
  return (
    <div style={{ maxWidth: 350 }} className="mx-auto">
      <SignUpStepper steps={steps} />
    </div>
  )
}

SignUpPage.propTypes = {
  isCurrentUserLoaded: PropTypes.bool.isRequired,
  currentUser: PropTypes.object
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, currentUser } }: CurrentUserStore) => {
  return {
    isCurrentUserLoaded,
    currentUser
  }
}

// @ts-ignore
export default connect(mapStateToProps)(SignUpPage)
