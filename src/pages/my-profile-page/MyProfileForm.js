import { Map as IMap } from 'immutable'
import * as Sentry from '@sentry/browser'
import React from 'react'
import * as PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import { connect } from 'react-redux'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  DISPLAY_NAME,
  GENDER,
  PHONE,
  STATE,
  ZIP
} from '../../fields'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import { compose, pick } from 'underscore'
import UserDetails from '../../components/UserDetails'
import { ROOT } from '../../urls'
import { Button } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import UpdateUserData from '../../components/HOC/UpdateUserData'

function MyProfileForm({
  updateUserData,
  currentUser,
  userData,
  history,
  isSubmitting,
  onSubmitting
}) {
  userData = userData.toJS()

  const handleSubmit = async values => {
    console.log('submitting values:', JSON.stringify(values, 0, 2))
    try {
      onSubmitting(true)
      await Promise.all([
        currentUser.updateProfile({ [DISPLAY_NAME]: values[DISPLAY_NAME] }),
        updateUserData(values, { merge: true })
      ])

      onSubmitting(false)
      history.push(ROOT)
    } catch (error) {
      onSubmitting(false)
      Sentry.captureException(error)
      console.error('error response:', error)
      // todo: show an error message
    }
  }

  const handleClose = () => {
    history.push(ROOT)
  }

  const initialValues = pick(
    userData,
    ADDRESS1,
    ADDRESS2,
    CITY,
    DATE_OF_BIRTH,
    DISPLAY_NAME,
    GENDER,
    PHONE,
    STATE,
    ZIP
  )

  return (
    currentUser && (
      <>
        <Form
          onSubmit={values => handleSubmit(values)}
          initialValues={initialValues}
          render={({ handleSubmit, form, values }) => (
            <form onSubmit={handleSubmit} method="POST">
              <UserDetails values={values} showDisplayName />
              <div className="d-flex justify-content-between my-5">
                <Button
                  className="mr-4"
                  variant="contained"
                  color="default"
                  fullWidth
                  type="button"
                  onClick={() => handleClose()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="button"
                  onClick={() => form.submit()}
                  disabled={isSubmitting}
                >
                  Save
                </Button>
              </div>
            </form>
          )}
        />
      </>
    )
  )
}

MyProfileForm.propTypes = {
  currentUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,

  // from HOC
  updateUserData: PropTypes.func.isRequired,

  // from router-dom
  history: PropTypes.object.isRequired,

  onSubmitting: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

const mapDispatchToProps = {
  sendEmailVerification: sendEmailVerificationAction
}

const mapStateToProps = ({ currentUser: { currentUser, userData } }) => {
  return {
    currentUser,
    userData: userData || new IMap()
  }
}

export default compose(
  UpdateUserData,
  withRouter,
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(MyProfileForm)
