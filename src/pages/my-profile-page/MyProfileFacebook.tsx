import { Map as IMap } from 'immutable'
import React, { useState } from 'react'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, findWhere } from 'underscore'
import {
  Button,
  Card,
  CardContent,
  IconButton,
  Snackbar,
  Typography
} from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'
import UpdateUserData from '../../components/HOC/UpdateUserData'
import {
  linkToFacebook,
  unlinkFromFacebook
} from '../../utilities/linkToFacebook'
import * as Sentry from '@sentry/browser'
import { CurrentUserStore, User } from '../../entities/User'
import { UpdateUserData as UpdateUserDataFunc } from '../../reducers/currentUser'

interface Props {
  currentUser: firebase.User
  userData: any
  updateUserData: UpdateUserDataFunc
  onSubmitting: (arg0: boolean) => void
}

function MyProfileFacebook({
                             updateUserData,
                             currentUser,
                             userData,
                             onSubmitting
                           }: Props) {
  const userDataJS: User = userData.toJS()

  const [
    linkWithProviderErrorMessage,
    setLinkWithProviderErrorMessage
  ] = useState()

  const handleLinkToFacebook = async () => {
    try {
      onSubmitting(true)
      await linkToFacebook(currentUser, userDataJS, updateUserData)
    } catch (error) {
      Sentry.captureException(error)
      setLinkWithProviderErrorMessage('Failed to link to your Facebook account')
    } finally {
      onSubmitting(false)
    }
  }

  const handleUnlinkToFacebook = async () => {
    try {
      onSubmitting(true)
      await unlinkFromFacebook(currentUser, updateUserData)
    } catch (error) {
      Sentry.captureException(error)
      setLinkWithProviderErrorMessage(
        'Failed to unlink from your Facebook account'
      )
    } finally {
      onSubmitting(false)
    }
  }

  const connectedToFacebook = Boolean(
    findWhere(currentUser.providerData, { providerId: 'facebook.com' })
  )

  return (
    currentUser && (
      <div id="my-profile-facebook">
        <Card className="d-flex flex-row align-content-center my-4">
          <div className="mr-auto">
            <CardContent>
              <Typography component="h6" variant="h6">
                Facebook
              </Typography>
              <Typography color="textSecondary">
                <span
                  className={
                    connectedToFacebook ? 'text-success' : 'text-danger'
                  }
                >
                  {connectedToFacebook ? 'Connected' : 'Disconnected'}
                </span>
              </Typography>
            </CardContent>
          </div>
          <span className="px-3 d-flex">
            <Button
              variant="contained"
              color={connectedToFacebook ? 'default' : 'primary'}
              className="align-self-center"
              onClick={() =>
                connectedToFacebook
                  ? handleUnlinkToFacebook()
                  : handleLinkToFacebook()
              }
            >
              {connectedToFacebook ? 'Disconnect' : 'Connect'}
            </Button>
          </span>
        </Card>

        {linkWithProviderErrorMessage && (
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
        )}
      </div>
    )
  )
}

MyProfileFacebook.propTypes = {
  // from HOC
  updateUserData: PropTypes.func.isRequired,

  currentUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,

  onSubmitting: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser, userData } }: CurrentUserStore) => {
  return {
    currentUser,
    // @ts-ignore
    userData: userData || new IMap()
  }
}

export default compose(
  UpdateUserData,
  connect(mapStateToProps)
)(MyProfileFacebook)
