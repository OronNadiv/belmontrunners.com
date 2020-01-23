import React, { useEffect, useState } from 'react'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/HOC/LoggedInState'
import { connect } from 'react-redux'
import { goToTop } from 'react-scrollable-anchor'
import { compose } from 'underscore'
import DownloadAccountInfo from './DownloadAccountInfo'
import ChangeEmail from './ChangeEmail'
import DeleteAccount from './DeleteAccount'
import ChangePassword from './ChangePassword'
import { IRedisState } from '../../entities/User'

interface Props {
  firebaseUser: firebase.User
}

function AccountPage({ firebaseUser }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(goToTop, [firebaseUser])

  const handleSubmissionChanged = (value: boolean) => {
    setIsSubmitting(value)
  }

  return !firebaseUser ? null : (
    <div className="mx-auto py-5 px-3" style={{ maxWidth: 600 }}>
      {/*
  // @ts-ignore */}
      <ChangeEmail
        onSubmitting={handleSubmissionChanged}
        isSubmitting={isSubmitting}
      />
      {/*
  // @ts-ignore */}
      <ChangePassword
        onSubmitting={handleSubmissionChanged}
        isSubmitting={isSubmitting}
      />
      <DownloadAccountInfo
        onSubmitting={handleSubmissionChanged}
        isSubmitting={isSubmitting}
      />
      <DeleteAccount
        onSubmitting={handleSubmissionChanged}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

AccountPage.propTypes = {
  firebaseUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { firebaseUser } }: IRedisState) => {
  return {
    firebaseUser
  }
}

export default compose(
  LoggedInState(),
  connect(mapStateToProps)
)(AccountPage)
