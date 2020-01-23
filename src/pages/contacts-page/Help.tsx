import React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Popover from '@material-ui/core/Popover'
import Typography from '@material-ui/core/Typography'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import IconButton from '@material-ui/core/IconButton'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    typography: {
      padding: theme.spacing(2)
    }
  })
)

export default function Help() {
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <span>
      <IconButton aria-describedby={id} color="primary" onClick={handleClick}>
        <HelpOutlineIcon />
        {/*Glossary*/}
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Typography className={classes.typography}>
          <p><b>Member:</b> someone with a valid membership (paid membership fee in the last 12 months)</p>
          <p><b>User:</b> someone who created an account on our website but is not a member</p>
          <p><b>Subscriber:</b> someone who added their email address via the subscribe form on our website</p>
          <p>
            A subscriber may later be "promoted" to a user if s/he creates an account using the same email address.
            <br />
            A user may later be "promoted" to a member if s/he pays the club membership fee.
            <br />
            A member may later be "demoted" to a user if his/her membership expires.
          </p>
        </Typography>
      </Popover>
    </span>
  )
}