import React, { useEffect, useState } from 'react'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/HOC/LoggedInState'
import { connect } from 'react-redux'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import MyProfileForm from './MyProfileForm'
import MyProfileFacebook from './MyProfileFacebook'
import { goToTop } from 'react-scrollable-anchor'
import { compose } from 'underscore'
import { CurrentUserStore } from '../../entities/User'

interface Props {
  currentUser: firebase.User
}

function MyProfilePage({ currentUser }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(goToTop, [currentUser])

  const handleSubmissionChanged = (value: boolean) => {
    setIsSubmitting(value)
  }

  return (
    currentUser && (
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
  currentUser: PropTypes.object.isRequired
}

const mapDispatchToProps = {
  sendEmailVerification: sendEmailVerificationAction
}

const mapStateToProps = ({ currentUser: { currentUser } }: CurrentUserStore) => {
  return {
    currentUser
  }
}

export default compose(
  LoggedInState(),
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(MyProfilePage)