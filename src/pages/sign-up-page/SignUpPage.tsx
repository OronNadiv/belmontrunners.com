import React, { useEffect, useState } from 'react'
import SignUpStepper, {
  STEP_AUTHENTICATION,
  STEP_MEMBERSHIP,
  STEP_USER_DETAILS
} from './SignUpStepper'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IRedisState } from '../../entities/User'

interface Props {
  isCurrentUserLoaded: boolean
  firebaseUser: firebase.User
}

function SignUpPage({ isCurrentUserLoaded, firebaseUser }: Props) {
  const [steps, setSteps] = useState<string[]>()
  useEffect(() => {
    if (!isCurrentUserLoaded) {
      return
    }
    if (steps) {
      // num of steps already decided based on the user's state.
      return
    }
    if (firebaseUser) {
      setSteps([STEP_USER_DETAILS, STEP_MEMBERSHIP])
    } else {
      setSteps([STEP_AUTHENTICATION, STEP_USER_DETAILS, STEP_MEMBERSHIP])
    }
  }, [isCurrentUserLoaded, firebaseUser, steps])

  if (!isCurrentUserLoaded || !steps) {
    // todo: show loading
    return <></>
  }
  return (
    <div style={{ maxWidth: 350 }} className="mx-auto">
      <SignUpStepper steps={steps} />
    </div>
  )
}

SignUpPage.propTypes = {
  isCurrentUserLoaded: PropTypes.bool.isRequired,
  firebaseUser: PropTypes.object
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, firebaseUser } }: IRedisState) => {
  return {
    isCurrentUserLoaded,
    firebaseUser
  }
}

// @ts-ignore
export default connect(mapStateToProps)(SignUpPage)
