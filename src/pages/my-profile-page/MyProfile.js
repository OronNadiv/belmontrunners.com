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
import {
  sendEmailVerification as sendEmailVerificationAction,
  updateUserData as updateUserDataAction
} from '../../reducers/currentUser'
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
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import 'firebase/auth'
import firebase from 'firebase'

class MyProfile extends Component {
  constructor (props) {
    super(props)
    this.state = {
      close: false,
      isSubmitting: false,
      isSuccess: false
    }
  }

  handleSubmit (values) {
    this.setState({ isSubmitting: true })
    const { updateUserData } = this.props
    console.log('submitting values:', JSON.stringify(values, 0, 2))
    return updateUserData(values, { merge: true })
  }

  componentDidMount () {
    window.scrollTo(0, 0)
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (prevProps.userDataUpdating && !this.props.userDataUpdating && this.state.isSubmitting) {
      this.setState({ isSubmitting: false })
      if (!this.props.userDataUpdateError) {
        this.setState({ isSuccess: true })
      } else {
        // todo: show error since update failed.
      }
    }
  }

  async sendVerificationEmail () {
    const { sendEmailVerification } = this.props
    sendEmailVerification()
    this.setState({ emailVerificationSent: true })
  }

  async handleLinkToFacebook () {
    try {
      console.log('handleLinkToFacebook called.')
      const { currentUser } = this.props
      await currentUser.linkWithPopup(new firebase.auth.FacebookAuthProvider())
      this.forceUpdate()
    } catch (err) {
      console.log('err:', err)
      this.setState({ linkWithProviderErrorMessage: `Connection failed` })
    }
  }

  async handleUnlinkToFacebook () {
    try {
      console.log('handleUnlinkToFacebook called.')
      const { currentUser } = this.props
      await currentUser.unlink('facebook.com')
      this.forceUpdate()
    } catch (err) {
      console.log('err:', err)
      this.setState({ linkWithProviderErrorMessage: `Disconnection failed` })
    }
  }


  render () {
    const { currentUser } = this.props
    const connectedToFacebook = !!_.findWhere(firebase.auth().currentUser.providerData, { providerId: 'facebook.com' })
    const userData = this.props.userData.toJS()
    const {
      close,
      showChangeEmailDialog,
      showChangePasswordDialog,
      isSubmitting,
      isSuccess,
      linkWithProviderErrorMessage
    } = this.state
    if (close || isSuccess) {
      return <Redirect to={ROOT} />
    }

    const initialValues = _.pick(userData, ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, SHIRT_GENDER, SHIRT_SIZE, STATE, ZIP)

    return currentUser &&
      <>
        <Card className='d-flex flex-row align-content-center my-4'>
          <div className='mr-auto'>
            <CardContent>
              <Typography component="h6" variant="h6">
                Email Address
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {currentUser.email} (
                {
                  currentUser.emailVerified === false ?
                    <span className='text-danger text-center'>not verified</span> :
                    <span className='text-success text-center'>verified</span>
                }
                )
                <div>
                  <small>
                    {
                      !currentUser.emailVerified &&
                      !this.state.emailVerificationSent &&
                      <span>
                        Click <span onClick={() => this.sendVerificationEmail()} className="text-primary">here</span> to
                        send me a verification email
                      </span>
                    }
                    {
                      !currentUser.emailVerified &&
                      this.state.emailVerificationSent &&
                      <span className='text-success text-center'>Sent</span>
                    }
                  </small>
                </div>
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

        <Card className='d-flex flex-row align-content-center my-4'>
          <div className='mr-auto'>
            <CardContent>
              <Typography component="h6" variant="h6">
                Facebook
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                <span className={connectedToFacebook ? 'text-success' : 'text-danger'}>
                  {connectedToFacebook ? 'Connected' : 'Disconnected'}
                </span>
              </Typography>
            </CardContent>
          </div>
          <span className='px-3 d-flex'>
            <Button variant="contained" color={connectedToFacebook ? "default" : "primary"}
                    className='align-self-center'
                    onClick={() => connectedToFacebook ? this.handleUnlinkToFacebook() : this.handleLinkToFacebook()}>
              {connectedToFacebook ? 'Disconnect' : 'Connect'}
            </Button>
          </span>
        </Card>

        {
          linkWithProviderErrorMessage &&
          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            open
            autoHideDuration={6000}
            onClose={() => {
              console.log('onClose')
              this.setState({ linkWithProviderErrorMessage: '' })
            }}
            message={linkWithProviderErrorMessage}
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={() => {
                  console.log('onClick')
                  this.setState({ linkWithProviderErrorMessage: '' })
                }}
              >
                <CloseIcon />
              </IconButton>
            ]}
          />
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
      </>
  }
}

MyProfile.propTypes = {
  sendEmailVerification: PropTypes.func.isRequired,
  updateUserData: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  userData: PropTypes.object.isRequired,
  userDataUpdating: PropTypes.bool.isRequired,
  userDataUpdateError: PropTypes.object
}

const mapDispatchToProps = {
  sendEmailVerification: sendEmailVerificationAction,
  updateUserData: updateUserDataAction
}

const mapStateToProps = ({ currentUser: { currentUser, userData, userDataUpdating, userDataUpdateError } }) => {
  return {
    currentUser,
    userData,
    userDataUpdating,
    userDataUpdateError
  }
}

export default LoggedInState({
  name: 'MyProfilePage',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps, mapDispatchToProps)(MyProfile))
