import * as PropTypes from 'prop-types'
import { IconButton, Toolbar, Typography } from '@material-ui/core'
import { SaveAlt as SaveIcon } from '@material-ui/icons'
import React from 'react'

function EnhancedTableToolbar ({ onExport }) {
  return (
    <Toolbar className='d-flex'>
      <div>
        <Typography variant="h6" id="tableTitle">
          Users
        </Typography>
      </div>
      {
        onExport && <IconButton aria-label="Export" onClick={onExport}>
          <SaveIcon />
        </IconButton>
      }
    </Toolbar>
  )
}

EnhancedTableToolbar.propTypes = {
  onExport: PropTypes.func
}

export default EnhancedTableToolbar
