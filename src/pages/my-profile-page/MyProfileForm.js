import { Map as IMap } from 'immutable'
import * as Sentry from '@sentry/browser'
import React from 'react'
import * as PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import { connect } from 'react-redux'
import { ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, STATE, ZIP } from '../../fields'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import _ from 'underscore'
import UserDetails from '../../components/UserDetails'
import { ROOT } from '../../urls'
import Button from '@material-ui/core/Button'
import { withRouter } from 'react-router-dom'
import UpdateUserData from '../../components/UpdateUserData'

function MyProfileForm ({ updateUserData, currentUser, userData, history, isSubmitting, onSubmitting }) {
  userData = userData.toJS()

  const handleSubmit = async (values) => {
    console.log('submitting values:', JSON.stringify(values, 0, 2))
    try {
      onSubmitting(true)
      await updateUserData(values, { merge: true })
    } catch (error) {
      Sentry.captureException(error)
      console.error('error response:', error)
// todo: show an error message
    } finally {
      onSubmitting(false)
    }
  }

  const handleClose = () => {
    history.push(ROOT)
  }

  const initialValues = _.pick(userData, ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, STATE, ZIP)

  return currentUser &&
    <>
      <Form onSubmit={(values) => handleSubmit(values)}
            initialValues={initialValues}
            render={({ handleSubmit, form, values }) => (
              <form onSubmit={handleSubmit}>
                <UserDetails values={values} />
                <div className='d-flex justify-content-between my-5'>
                  <Button
                    className='mr-4'
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

export default withRouter(
  UpdateUserData(
    connect(mapStateToProps, mapDispatchToProps)(MyProfileForm)))