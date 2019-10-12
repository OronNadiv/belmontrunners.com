import React from 'react'
import {
  DialogTitle as MuiDialogTitle,
  IconButton,
  Typography
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import * as PropTypes from 'prop-types'

const DialogTitle = ({ children, onClose }) => {
  return (
    <MuiDialogTitle disableTypography>
      <div className="d-flex justify-content-between align-items-center">
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton
            aria-label="Close"
            onClick={onClose}
            style={{
              color: 'gray'
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </div>
    </MuiDialogTitle>
  )
}

DialogTitle.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired
}

export default DialogTitle
