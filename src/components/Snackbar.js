import React from 'react'
import { makeStyles, Snackbar as MUISnackbar, SnackbarContent } from '@material-ui/core'
import * as PropTypes from 'prop-types'

const ACTION_COLOR = '#b39ddb'
const LINK_COLOR = 'crimson'

function Snackbar ({ action, message }) {
  const useStyles = makeStyles(() => ({
    root: {},
    content: { backgroundColor: '#673ab7' }
  }))
  const classes = useStyles()

  return <MUISnackbar
    className={classes.root}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center'
    }}
    open
  >
    <SnackbarContent
      aria-describedby="client-snackbar"
      className={classes.content}
      message={message}
      action={action}
    />
  </MUISnackbar>
}

Snackbar.propTypes = {
  action: PropTypes.any,
  message: PropTypes.any
}

export {
  Snackbar,
  LINK_COLOR,
  ACTION_COLOR
}
