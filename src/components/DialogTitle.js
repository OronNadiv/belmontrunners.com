import React from 'react'
import MuiDialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Typography from '@material-ui/core/Typography'
import * as PropTypes from 'prop-types'

const DialogTitle = (props => {
  const { children, onClose } = props
  return (
    <MuiDialogTitle disableTypography>
      <div className='d-flex justify-content-between align-items-center'>
        <Typography variant="h6">{children}</Typography>
        {
          onClose ? (
            <IconButton aria-label="Close" onClick={onClose} style={{
              color: 'gray'
            }}>
              <CloseIcon />
            </IconButton>
          ) : null
        }
      </div>
    </MuiDialogTitle>
  )
})
DialogTitle.propTypes = {
  onClose: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired
}

export default DialogTitle