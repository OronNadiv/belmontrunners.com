import React, { useState } from 'react'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/LoggedInState'
import { connect } from 'react-redux'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import MyProfileForm from './MyProfileForm'
import MyProfileChangePassword from './MyProfileChangePassword'
import MyProfileFacebook from './MyProfileFacebook'

function MyProfilePage ({ currentUser }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmissionChanged = ((value) => {
    setIsSubmitting(value)
  })

  return currentUser &&
    <div className='mx-auto py-5 px-3' style={{ maxWidth: 500 }}>
      <MyProfileChangePassword onSubmitting={handleSubmissionChanged} isSubmitting={isSubmitting} />
      <MyProfileFacebook onSubmitting={handleSubmissionChanged} isSubmitting={isSubmitting} />
      <MyProfileForm onSubmitting={handleSubmissionChanged} isSubmitting={isSubmitting} />
    </div>
}

MyProfilePage.propTypes = {
  currentUser: PropTypes.object.isRequired
}

const mapDispatchToProps = {
  sendEmailVerification: sendEmailVerificationAction
}

const mapStateToProps = ({ currentUser: { currentUser } }) => {
  return {
    currentUser
  }
}

export default LoggedInState({
  name: 'MyProfilePage',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps, mapDispatchToProps)(MyProfilePage))
