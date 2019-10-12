import React, { useState } from 'react'
import {
  Button,
  Dialog,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  Toolbar,
  withMobileDialog
} from '@material-ui/core'
import GoogleCalendarIcon from './GoogleCalendarIcon'
import IosIcon from './IosIcon'
import MicrosoftOutlookIcon from './MicrosoftOutlookIcon'
import YahooIcon from './YahooIcon'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import LinkIcon from './LinkIcon'
import MacOSIcon from './MacOSIcon'
import './schedule.scss'
import { Close as CloseIcon } from '@material-ui/icons'
import * as PropTypes from 'prop-types'

const GOOGLE = 'GOOGLE'
const ICAL = 'ICAL'
const IOS = 'IOS'
const MACOS = 'MACOS'
const OUTLOOK = 'OUTLOOK'
const YAHOO = 'YAHOO'

const ICAL_LINK = 'https://www.belmontrunners.com/public/basic.ical'

function CalendarSelector({ fullScreen }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [showDialog, setShowDialog] = useState(false)
  const [videoId, setVideoId] = useState(null)
  const [copied, setCopied] = useState(false)

  function handleClick(event) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose(provider) {
    setAnchorEl(null)
    setShowDialog(true)
    switch (provider) {
      case GOOGLE:
        setShowDialog(false)
        window.open(
          'https://calendar.google.com/calendar?cid=guvk2qu1oo369ns50tvatdot7v8chd1t@import.calendar.google.com',
          '_blank'
        )
        break
      case ICAL:
        setVideoId('')
        break
      case IOS:
        setVideoId('3vN7CrKi2FQ')
        break
      case MACOS:
        setVideoId('xBKVO3Iv41s')
        break
      case OUTLOOK:
        setVideoId('h_V0FQ3REgk')
        break
      case YAHOO:
        setVideoId('3jaueqrriLE')
        break
      default:
        setShowDialog(false)
    }
  }

  return (
    <div className="ical-tutorials">
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={copied}
        autoHideDuration={6000}
        message={'Link copied'}
        onClose={() => {
          setCopied(false)
        }}
      />

      <Dialog
        onClose={handleClose}
        open={showDialog}
        fullScreen={fullScreen}
        aria-labelledby="simple-dialog-title"
      >
        {fullScreen && (
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="Close"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        )}

        <div className="mx-auto my-4">
          <Paper className="d-flex align-items-center mx-2" elevation={3}>
            <div className="ical-link ml-3">{ICAL_LINK}</div>
            <CopyToClipboard
              className="ml-3"
              text={ICAL_LINK}
              onCopy={() => {
                setCopied(true)
                !videoId && setShowDialog(false)
              }}
            >
              <Button variant="contained" color="primary">
                COPY
              </Button>
            </CopyToClipboard>
          </Paper>
        </div>
        {videoId && (
          <div className="mx-auto mb-4">
            <iframe
              title="Add to my calendar"
              className="mx-2"
              src={`https://www.youtube.com/embed/${videoId}?rel=0`}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </Dialog>
      <Button
        aria-haspopup="true"
        variant="outlined"
        color="primary"
        onClick={handleClick}
      >
        Add to my calendar
      </Button>

      <Menu
        id="customized-menu"
        style={{ border: '1px' }}
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        elevation={0}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Paper style={{ border: '1px solid #d3d4d5' }}>
          <MenuItem onClick={() => handleClose(GOOGLE)}>
            <ListItemIcon>
              <GoogleCalendarIcon />
            </ListItemIcon>
            <ListItemText primary="Google Calendar (Desktop)" />
          </MenuItem>
          <MenuItem onClick={() => handleClose(YAHOO)}>
            <ListItemIcon>
              <YahooIcon />
            </ListItemIcon>
            <ListItemText primary="Yahoo Calendar (Desktop)" />
          </MenuItem>
          <MenuItem onClick={() => handleClose(OUTLOOK)}>
            <ListItemIcon>
              <MicrosoftOutlookIcon />
            </ListItemIcon>
            <ListItemText primary="Microsoft Outlook (Desktop)" />
          </MenuItem>
          <MenuItem onClick={() => handleClose(MACOS)}>
            <ListItemIcon>
              <MacOSIcon />
            </ListItemIcon>
            <ListItemText primary="MacOS Calendar (Desktop)" />
          </MenuItem>
          <MenuItem onClick={() => handleClose(IOS)}>
            <ListItemIcon>
              <IosIcon />
            </ListItemIcon>
            <ListItemText primary="iOS (iPhone/iPad)" />
          </MenuItem>
          <MenuItem onClick={() => handleClose(ICAL)}>
            <ListItemIcon>
              <LinkIcon />
            </ListItemIcon>
            <ListItemText primary="iCal Link" />
          </MenuItem>
        </Paper>
      </Menu>
    </div>
  )
}

CalendarSelector.propTypes = {
  fullScreen: PropTypes.bool.isRequired
}
export default withMobileDialog()(CalendarSelector)
