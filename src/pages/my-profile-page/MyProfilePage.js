import React, { Component } from 'react'
import * as PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import LoggedInState from '../../components/LoggedInState'
import { connect } from 'react-redux'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  GENDER,
  PHONE,
  SHIRT_GENDER,
  SHIRT_SIZE,
  STATE,
  ZIP
} from '../../fields'
import { updateUserData as updateUserDataAction } from '../../reducers/currentUser'
import _ from 'underscore'
import UserDetails from '../../components/UserDetails'
import { ROOT } from '../../urls'
import { Redirect } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import ChangePasswordDialog from '../../components/ChangePasswordDialog'
import ChangeEmailDialog from '../../components/ChangeEmailDialog'


class MyProfilePage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      close: false,
      isSubmitting: false,
      isSuccess: false
    }
  }

  handleSubmit (values) {
    this.setState({ submitting: true })
    const { updateUserData } = this.props
    console.log('submitting values:', JSON.stringify(values, 0, 2))
    return updateUserData(values, { merge: true })
  }

  componentDidMount () {
    window.scrollTo(0, 0)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.userDataUpdating && !this.props.userDataUpdating && this.state.submitting) {
      this.setState({ submitting: false })
      if (!this.props.userDataUpdateError) {
        this.setState({ isSuccess: true })
      } else {
        // todo: show error since update failed.
      }
    }
  }

  render () {
    const { isCurrentUserLoaded } = this.props
    const userData = this.props.userData.toJS()
    const { close, showChangeEmailDialog, showChangePasswordDialog, isSubmitting, isSuccess } = this.state
    if (close || isSuccess) {
      return <Redirect to={ROOT} />
    }

    const initialValues = _.pick(userData, ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, SHIRT_GENDER, SHIRT_SIZE, STATE, ZIP)
    return !isCurrentUserLoaded ?
      '' :
      <div className='mx-auto py-5 px-3' style={{ maxWidth: 500 }}>
        <Typography component="h5" variant="h5">
          My Profile
        </Typography>

        <Card className='d-flex flex-row align-content-center my-4'>
          <div className='mr-auto'>
            <CardContent>
              <Typography component="h6" variant="h6">
                Email Address
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {userData.email} {/*({userData.emailVerified ? 'verified' : 'not verified'})*/}
              </Typography>
            </CardContent>
          </div>
          <span className='px-3 d-flex'>
            <Button variant="contained" color="primary" className='align-self-center'
                    onClick={() => this.setState({ showChangeEmailDialog: true })}>
              Change Email
            </Button>
          </span>
        </Card>
        {
          showChangeEmailDialog &&
          <ChangeEmailDialog onClose={() => this.setState({ showChangeEmailDialog: false })} />
        }

        <Card className='d-flex flex-row align-content-center my-4'>
          <div className='mr-auto'>
            <CardContent>
              <Typography component="h6" variant="h6">
                Password
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                Change account password
              </Typography>
            </CardContent>
          </div>
          <span className='px-3 d-flex'>
            <Button variant="contained" color="primary" className='align-self-center'
                    onClick={() => this.setState({ showChangePasswordDialog: true })}>
              Change Password
            </Button>
          </span>
        </Card>
        {
          showChangePasswordDialog &&
          <ChangePasswordDialog onClose={() => this.setState({ showChangePasswordDialog: false })} />
        }

        <Form onSubmit={(values) => this.handleSubmit(values)}
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
                      onClick={() => this.setState({ close: true })}
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
      </div>
  }
}

MyProfilePage.propTypes = {
  updateUserData: PropTypes.func.isRequired,
  isCurrentUserLoaded: PropTypes.bool.isRequired,
  userData: PropTypes.object.isRequired,
  userDataUpdating: PropTypes.bool.isRequired,
  userDataUpdateError: PropTypes.object
}

const mapDispatchToProps = {
  updateUserData: updateUserDataAction
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, userData, userDataUpdating, userDataUpdateError } }) => {
  return {
    isCurrentUserLoaded,
    userData,
    userDataUpdating,
    userDataUpdateError
  }
}

export default LoggedInState({
  name: 'MyProfilePage',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps, mapDispatchToProps)(MyProfilePage))
