import 'firebase/auth'
import firebase from 'firebase'
import { Map as IMap } from 'immutable'
import React, { useState } from 'react'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, findWhere } from 'underscore'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { PHOTO_URL } from '../../fields'
import UpdateUserData from '../../components/HOC/UpdateUserData'

function MyProfileFacebook ({ updateUserData, currentUser, userData, onSubmitting }) {
  userData = userData.toJS()

  const [linkWithProviderErrorMessage, setLinkWithProviderErrorMessage] = useState()

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
      onSubmitting(true)
      await updateUserData({ [PHOTO_URL]: photoUrl }, { merge: true })
    } catch (err) {
      console.log('err:', err)
      setLinkWithProviderErrorMessage('Connection failed')
    } finally {
      onSubmitting(false)
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
      onSubmitting(true)
      await updateUserData({ [PHOTO_URL]: photoUrl }, { merge: true })
    } catch (err) {
      console.log('err:', err)
      setLinkWithProviderErrorMessage('Disconnection failed')
    } finally {
      onSubmitting(false)
    }
  }

  const connectedToFacebook = Boolean(findWhere(currentUser.providerData, { providerId: 'facebook.com' }))

  return currentUser &&
    <div id='my-profile-facebook'>
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
    </div>
}

MyProfileFacebook.propTypes = {
  // from HOC
  updateUserData: PropTypes.func.isRequired,

  currentUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,

  onSubmitting: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}


const mapStateToProps = ({ currentUser: { currentUser, userData } }) => {
  return {
    currentUser,
    userData: userData || new IMap()
  }
}

export default compose(
  UpdateUserData,
  connect(mapStateToProps)
)(MyProfileFacebook)
