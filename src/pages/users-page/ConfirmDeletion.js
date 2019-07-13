import 'firebase/functions'
import React from 'react'
import { Button, Snackbar } from '@material-ui/core'
import * as PropTypes from 'prop-types'
import { DISPLAY_NAME, EMAIL, UID } from '../../fields'

const confirmDeletion = ({ row, onClose }) => {

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
      onClose={() => onClose(false)}
      message={<span
        id="message-id">Are you sure you want to delete <b>{row[DISPLAY_NAME]} &lt;{row[EMAIL]}&gt;</b></span>}
      action={[
        <Button key="0" color="secondary" onClick={() => onClose(false)}>
          no
        </Button>,
        <Button key="1" size="small" onClick={() => onClose(true)}>
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
