import React from 'react'
import { Button, Snackbar } from '@material-ui/core'
import * as PropTypes from 'prop-types'
import { DISPLAY_NAME, EMAIL, UID } from '../../fields'
import { User } from "../../entities/User";

const confirmDeletion = (props: confirmDeletionProps) => {
  const { row, onClose } = props
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

interface confirmDeletionProps {
  onClose: (shouldDelete: boolean) => any,
  row: User
}

confirmDeletion.propTypes = {
  onClose: PropTypes.func.isRequired,
  row: PropTypes.shape({
    [UID]: PropTypes.string.isRequired
  }).isRequired
}
export default confirmDeletion
