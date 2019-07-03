import 'firebase/auth'
import firebase from 'firebase'
import { Map as IMap } from 'immutable'
import * as Sentry from '@sentry/browser'
import React, { useEffect, useState } from 'react'
import * as PropTypes from 'prop-types'
import { Form } from 'react-final-form'
import LoggedInState from '../../components/LoggedInState'
import { connect } from 'react-redux'
import { ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, PHOTO_URL, STATE, ZIP } from '../../fields'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import _ from 'underscore'
import UserDetails from '../../components/UserDetails'
import { ROOT } from '../../urls'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import ChangePasswordDialog from '../../components/ChangePasswordDialog'
import ChangeEmailDialog from '../../components/ChangeEmailDialog'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { withRouter } from 'react-router-dom'
import UpdateUserData from '../../components/UpdateUserData'

function MyProfile ({ updateUserData, sendEmailVerification, currentUser, userData, history }) {
  userData = userData.toJS()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState()
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState()
  const [linkWithProviderErrorMessage, setLinkWithProviderErrorMessage] = useState()
  const [emailVerificationSent, setEmailVerificationSent] = useState()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = async (values) => {
    console.log('submitting values:', JSON.stringify(values, 0, 2))
    try {
      setIsSubmitting(true)
      await updateUserData(values, { merge: true })
    } catch (error) {
      Sentry.captureException(error)
      console.error('error response:', error)
// todo: show error message
    } finally {
      setIsSubmitting(false)
    }
  }

  const sendVerificationEmail = async () => {
    sendEmailVerification()
    setEmailVerificationSent(true)
  }

  const handleLinkToFacebook = async () => {
    try {
      console.log('handleLinkToFacebook called.')
      await currentUser.linkWithPopup(new firebase.auth.FacebookAuthProvider())

      let photoUrl = userData[PHOTO_URL]
      if (!photoUrl) {
        const foundProviderData = currentUser.providerData.find(({ photoURL }) => {
          return Boolean(photoURL)
        })
        if (foundProviderData) {
          photoUrl = foundProviderData[PHOTO_URL]
        }
      }
      // doing this in order to trigger an update.
      setIsSubmitting(true)
      await updateUserData({ [PHOTO_URL]: photoUrl }, { merge: true })
    } catch (err) {
      console.log('err:', err)
      setLinkWithProviderErrorMessage('Connection failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnlinkToFacebook = async () => {
    try {
      console.log('handleUnlinkToFacebook called.')
      await currentUser.unlink('facebook.com')
      const foundProviderData = currentUser.providerData.find(({ photoURL }) => {
        return Boolean(photoURL)
      })
      const photoUrl = foundProviderData ? foundProviderData[PHOTO_URL] : null
      console.log('foundProviderData :', foundProviderData)
      console.log('photoUrl :', photoUrl)
      // doing this in order to trigger an update.
      setIsSubmitting(true)
      await updateUserData({ [PHOTO_URL]: photoUrl }, { merge: true })
    } catch (err) {
      console.log('err:', err)
      setLinkWithProviderErrorMessage('Disconnection failed')
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleClose = () => {
    history.push(ROOT)
  }


  const connectedToFacebook = Boolean(_.findWhere(currentUser.providerData, { providerId: 'facebook.com' }))

  const initialValues = _.pick(userData, ADDRESS1, ADDRESS2, CITY, DATE_OF_BIRTH, GENDER, PHONE, STATE, ZIP)

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
                    !emailVerificationSent &&
                    <span>
                        Click <span onClick={() => sendVerificationEmail()} className="text-primary">here</span> to
                        send me a verification email
                      </span>
                  }
                  {
                    !currentUser.emailVerified &&
                    emailVerificationSent &&
                    <span className='text-success text-center'>Sent</span>
                  }
                </small>
              </div>
            </Typography>
          </CardContent>
        </div>
        <span className='px-3 d-flex'>
            <Button variant="contained" color="primary" className='align-self-center'
                    onClick={() => setShowChangeEmailDialog(true)}>
              Change Email
            </Button>
          </span>
      </Card>
      {
        showChangeEmailDialog &&
        <ChangeEmailDialog onClose={() => setShowChangeEmailDialog(false)} />
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
                    onClick={() => setShowChangePasswordDialog(true)}>
              Change Password
            </Button>
          </span>
      </Card>
      {
        showChangePasswordDialog &&
        <ChangePasswordDialog onClose={() => setShowChangePasswordDialog(false)} />
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
                    onClick={() => connectedToFacebook ? handleUnlinkToFacebook() : handleLinkToFacebook()}>
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
            setLinkWithProviderErrorMessage('')
          }}
          message={linkWithProviderErrorMessage}
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              onClick={() => {
                console.log('onClick')
                setLinkWithProviderErrorMessage('')
              }}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      }

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

MyProfile.propTypes = {
  sendEmailVerification: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,

  // from HOC
  updateUserData: PropTypes.func.isRequired,

  // from router-dom
  history: PropTypes.object.isRequired
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
    LoggedInState({
      name: 'MyProfilePage',
      isRequiredToBeLoggedIn: true
    })(connect(mapStateToProps, mapDispatchToProps)(MyProfile))))
