import firebase from 'firebase'
import React from 'react'
import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import PropTypes from 'prop-types'
import { DISPLAY_NAME, EMAIL, UID } from '../../fields'
import * as Sentry from '@sentry/browser'

const confirmDeletion = (props) => {
  const { row, onClose } = props

  const deleteUser = async () => {
    let uid = row[UID]
    console.log(`Deleting: users/${uid}, row:`, row)
    const userRef = firebase.firestore().doc(`users/${uid}`)
    try {
      await userRef.delete()
      console.log('Deleted successfully')
    } catch (error) {
      Sentry.captureException(error)
      console.log('Deletion failed.',
        'error:', error)
    } finally {
      onClose()
    }
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      open
      autoHideDuration={10000}
      ContentProps={{
        'aria-describedby': 'message-id'
      }}
      message={<span
        id="message-id">Are you sure you want to delete <b>{row[DISPLAY_NAME]} &lt;{row[EMAIL]}&gt;</b></span>}
      action={[
        <Button key="0" color="secondary" onClick={() => {
          onClose()
        }}>
          no
        </Button>,
        <Button key="1" size="small" onClick={() => deleteUser()}>
          yes
        </Button>
      ]}
    />
  )
}

confirmDeletion.propTypes = {
  onClose: PropTypes.func.isRequired,
  row: PropTypes.shape({
    [UID]: PropTypes.string.isRequired
  }).isRequired
}
export default confirmDeletion