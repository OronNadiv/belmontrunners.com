import React, { useEffect, useState } from 'react'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/HOC/LoggedInState'
import { connect } from 'react-redux'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import MyProfileForm from './MyProfileForm'
import MyProfileFacebook from './MyProfileFacebook'
import { animateScroll } from 'react-scroll'
import { compose } from 'underscore'
import { IRedisState } from '../../entities/User'

interface Props {
  firebaseUser: firebase.User
}

function MyProfilePage({ firebaseUser }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    animateScroll.scrollToTop({ duration: 0 })
  }, [firebaseUser])

  const handleSubmissionChanged = (value: boolean) => {
    setIsSubmitting(value)
  }

  return (
    firebaseUser && (
      <div className="mx-auto py-5 px-3" style={{ maxWidth: 500 }}>
        <MyProfileFacebook
          onSubmitting={handleSubmissionChanged}
          isSubmitting={isSubmitting}
        />
        <MyProfileForm
          onSubmitting={handleSubmissionChanged}
          isSubmitting={isSubmitting}
        />
      </div>
    )
  )
}

MyProfilePage.propTypes = {
  firebaseUser: PropTypes.object.isRequired
}

const mapDispatchToProps = {
  sendEmailVerification: sendEmailVerificationAction
}

const mapStateToProps = ({ currentUser: { firebaseUser } }: IRedisState) => {
  return {
    firebaseUser
  }
}

export default compose(
  LoggedInState(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(MyProfilePage)
