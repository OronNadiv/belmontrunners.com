import React from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core'
import * as PropTypes from 'prop-types'

interface DeleteAccountDialogProps {
  onClose (shouldDelete: boolean): () => null,

  open: boolean
}

function DeleteAccountDialog ({ onClose, open }: DeleteAccountDialogProps) {
  const handleClose = (val: boolean) => () => onClose(val)

  return (
    <Dialog
      open={open}
      onClose={handleClose(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Delete your account</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          When you delete your account, you lose access to Belmont Runners members only area, and we permanently delete
          your personal data.
          <br />
          <br />
          <b>Once an account is deleted, there is no going back.</b>
          <br />
          <br />
          Are you sure you want to delete your account?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose(false)} color="primary" variant='contained' autoFocus>
          cancel
        </Button>
        <Button onClick={handleClose(true)} color="default" variant='outlined'>
          Delete account
        </Button>
      </DialogActions>
    </Dialog>
  )
}

DeleteAccountDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired
}

export default DeleteAccountDialog
