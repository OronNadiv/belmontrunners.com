import {functions} from '../../firebase'
import React, { useState } from 'react'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'underscore'
import { Button, Card, CardContent, Typography } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import DeleteAccountDialog from './DeleteAccountDialog'
import { UID } from '../../fields'
import { ROOT } from '../../urls'
import * as Sentry from '@sentry/browser'
import { Snackbar } from '../../components/Snackbar'

function DeleteAccount({ currentUser, onSubmitting, isSubmitting, history }) {
  const [showAccountDeletionDialog, setShowAccountDeletionDialog] = useState(
    false
  )
  const [error, setError] = useState('')

  const handleDeleteAccount = () => {
    setShowAccountDeletionDialog(true)
  }
  const handleDialogClosed = async shouldDeleteAccount => {
    setShowAccountDeletionDialog(false)
    console.log('shouldDeleteAccount:', shouldDeleteAccount)
    if (shouldDeleteAccount) {
      try {
        onSubmitting(true)
        await functions.httpsCallable('deleteUser')({
          [UID]: currentUser[UID]
        })
        onSubmitting(false)
        window.location.href = ROOT
      } catch (error) {
        onSubmitting(false)
        Sentry.captureException(error)
        console.error('error from deleteAccount:', error)
        setError('Operation failed.')
      }
    }
  }

  function handleSnackbarClosed() {
    setError('')
  }

  return (
    currentUser && (
      <>
        {error && <Snackbar message={error} onClose={handleSnackbarClosed} />}
        <DeleteAccountDialog
          onClose={handleDialogClosed}
          open={showAccountDeletionDialog}
        />
        <Card className="d-flex flex-row align-content-center my-4">
          <CardContent>
            <Typography component="h6" variant="h6" className="text-danger">
              Delete account
            </Typography>
            <Typography color="textSecondary">
              Once you delete your account, there is no going back. Please be
              certain.
            </Typography>
          </CardContent>
          <span className="px-3 d-flex">
            <Button
              variant="outlined"
              className=" align-self-center"
              style={{ width: 165 }}
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
            >
              Delete account
            </Button>
          </span>
        </Card>
      </>
    )
  )
}

DeleteAccount.propTypes = {
  currentUser: PropTypes.object.isRequired,
  onSubmitting: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser } }) => {
  return {
    currentUser
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps)
)(DeleteAccount)
