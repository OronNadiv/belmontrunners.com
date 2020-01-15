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
import { CurrentUserStore } from '../../entities/User'

interface Props {
  currentUser: firebase.User
}

function AccountPage({ currentUser }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(goToTop, [currentUser])

  const handleSubmissionChanged = (value: boolean) => {
    setIsSubmitting(value)
  }

  return !currentUser ? null : (
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
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser } }: CurrentUserStore) => {
  return {
    currentUser
  }
}

export default compose(
  LoggedInState(),
  connect(mapStateToProps)
)(AccountPage)
