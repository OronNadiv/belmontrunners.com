import * as PropTypes from 'prop-types'
import React, { useState } from 'react'
import initials from 'initials'
import moment from 'moment'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  DISPLAY_NAME,
  EMAIL,
  GRAVATAR_URL,
  MEMBERS,
  ONLY_ME,
  PHONE,
  PHOTO_URL,
  STATE,
  UID,
  ZIP
} from '../../fields'
import googleLibPhoneNumber from 'google-libphonenumber'
import {
  Cake as CakeIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Group as GroupIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Smartphone as SmartPhoneIcon
} from '@material-ui/icons'
import {
  Avatar,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  SnackbarContent,
  SwipeableDrawer,
  useMediaQuery
} from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { Map as IMap } from 'immutable'
import UpdateUserData from '../../components/HOC/UpdateUserData'
import { linkToFacebook } from '../../utilities/linkToFacebook'
import { findWhere } from 'underscore'

const defaultVisibility = {
  [EMAIL]: ONLY_ME,
  [PHONE]: ONLY_ME,
  [ADDRESS1]: ONLY_ME,
  [DATE_OF_BIRTH]: ONLY_ME
}

const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()
const DRAWER_WIDTH = 270

function UserProfile({ onClose, user, userData, updateUserData, currentUser }) {
  userData = userData.toJS()
  const visibility = userData.visibility || {}
  const theme = useTheme()
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'))

  const AVATAR_WIDTH = 100
  const AVATAR_HEIGHT = 100

  const drawerPaper = {}
  isSmallDevice && (drawerPaper.width = '100%')
  !isSmallDevice && (drawerPaper.minWidth = DRAWER_WIDTH)

  const useStyles = makeStyles({
    avatar: {
      width: AVATAR_WIDTH,
      height: AVATAR_HEIGHT,
      backgroundColor: theme.palette.primary.main
    },
    drawer: {
      flexShrink: 0
    },
    drawerPaper,
    root: {
      fontSize: 18
    }
  })
  const classes = useStyles()

  const [refs, setRefs] = useState({})
  const [openMenus, setOpenMenus] = useState({})
  const [errorMessage, setErrorMessage] = useState('')

  function getPhone() {
    if (!user[PHONE]) {
      return
    }
    const number = phoneUtil.parseAndKeepRawInput(user[PHONE], 'US')
    return phoneUtil.format(number, PNF.NATIONAL)
  }

  function getAddress() {
    if (
      user[ADDRESS1] ||
      user[ADDRESS2] ||
      user[CITY] ||
      user[STATE] ||
      user[ZIP]
    ) {
      return (
        <div>
          {user[ADDRESS1] && user[ADDRESS1]}
          {user[ADDRESS1] && <br />}
          {user[ADDRESS2] && user[ADDRESS2]}
          {user[ADDRESS2] && <br />}
          {user[CITY] && `${user[CITY]}, `}
          {user[STATE] && `${user[STATE]} `}
          {user[ZIP] && user[ZIP]}
        </div>
      )
    }
    return null
  }

  function getKeyVal(label, value, icon, currVisibility, onVisibilityChanged) {
    const handleOpen = () => {
      openMenus[label] = true
      setOpenMenus({ ...openMenus })
    }

    const handleClose = () => {
      openMenus[label] = false
      setOpenMenus({ ...openMenus })
    }

    const handleRef = ref => {
      refs[label] = ref
      setRefs(refs)
    }

    return (
      <div className="mt-4" style={{ order: value ? 1 : 10000 }}>
        <div className="d-flex align-items-top">
          {icon}
          {/*<div className='mr-1 text-secondary' style={{ width: 90 }}>{label}:</div>*/}
          <div>{value || 'Not sharing'}</div>
        </div>
        {currentUser[UID] === user[UID] && (
          <div className="mt-2">
            <small onClick={handleOpen} ref={handleRef}>
              <span className="text-muted">Visible to: </span>
              {currVisibility === ONLY_ME && 'Only me'}
              {currVisibility === MEMBERS && 'Club members'}
              <span className="text-primary" style={{ cursor: 'pointer' }}>
                {' '}
                (change)
              </span>
            </small>
          </div>
        )}
        <Menu
          id="customized-menu"
          anchorEl={refs[label]}
          keepMounted
          open={!!openMenus[label]}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              onVisibilityChanged(ONLY_ME)
              handleClose()
            }}
          >
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Only me" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              onVisibilityChanged(MEMBERS)
              handleClose()
            }}
          >
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Club members" />
          </MenuItem>
        </Menu>
      </div>
    )
  }

  function handleVisibilityChanged(keys) {
    return async val => {
      keys.forEach(key => {
        visibility[key] = val
      })
      await updateUserData({ visibility }, { merge: true })
    }
  }

  const handleLinkToFacebook = async () => {
    try {
      await linkToFacebook(currentUser, userData, updateUserData)
    } catch (error) {
      setErrorMessage('Operation failed')
    }
  }

  const connectedToFacebook = Boolean(
    findWhere(currentUser.providerData, { providerId: 'facebook.com' })
  )

  const avatarUrl =
    (user[PHOTO_URL] &&
      `${user[PHOTO_URL]}?width=${AVATAR_WIDTH}&&height=${AVATAR_HEIGHT}`) ||
    (user[GRAVATAR_URL] && `${user[GRAVATAR_URL]}?s=${AVATAR_WIDTH}`) ||
    null

  return (
    <SwipeableDrawer
      open
      anchor="right"
      onOpen={() => {}}
      onClose={onClose}
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper
      }}
    >
      {errorMessage && (
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          open
          autoHideDuration={10000}
          onClose={() => {
            setErrorMessage('')
          }}
        >
          <SnackbarContent
            aria-describedby="client-snackbar"
            style={{ backgroundColor: '#673ab7' }}
            message={errorMessage}
          />
        </Snackbar>
      )}

      <div className="clearfix">
        <IconButton
          className="float-left"
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={() => onClose()}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div className={`mx-5 ${classes.root}`}>
        <div className="d-flex flex-column align-items-center">
          <Avatar className={` ${classes.avatar}`} src={avatarUrl}>
            {!avatarUrl && initials(user[DISPLAY_NAME])}
          </Avatar>
          <div className="mt-3">{user[DISPLAY_NAME]}</div>
          {currentUser[UID] === user[UID] && !connectedToFacebook && (
            <div className="mt-2">
              <small>
                <span className="text-muted font-weight-bold">
                  Missing photo?{' '}
                </span>
                <span
                  className="text-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={handleLinkToFacebook}
                >
                  Link to Facebook
                </span>
              </small>
            </div>
          )}
        </div>
        <div className="d-flex flex-column align-items-center my-4">
          {getKeyVal(
            'Email',
            user[EMAIL], // getEmail(),
            <EmailIcon className="mr-2" style={{ fill: '#D2D6DB' }} />,
            visibility[EMAIL] || defaultVisibility[EMAIL],
            val => handleVisibilityChanged([EMAIL])(val)
          )}
          {getKeyVal(
            'Phone',
            getPhone(),
            <SmartPhoneIcon className="mr-2" style={{ fill: '#D2D6DB' }} />,
            visibility[PHONE] || defaultVisibility[PHONE],
            val => handleVisibilityChanged([PHONE])(val)
          )}
          {getKeyVal(
            'Address',
            getAddress(),
            <HomeIcon className="mr-2" style={{ fill: '#D2D6DB' }} />,
            visibility[ADDRESS1] || defaultVisibility[ADDRESS1],
            val =>
              handleVisibilityChanged([ADDRESS1, ADDRESS2, CITY, STATE, ZIP])(
                val
              )
          )}
          {getKeyVal(
            'Birthday',
            user[DATE_OF_BIRTH] && moment(user[DATE_OF_BIRTH]).format('MMMM D'),
            <CakeIcon className="mr-2" style={{ fill: '#D2D6DB' }} />,
            visibility[DATE_OF_BIRTH] || defaultVisibility[DATE_OF_BIRTH],
            val => handleVisibilityChanged([DATE_OF_BIRTH])(val)
          )}
        </div>
      </div>
    </SwipeableDrawer>
  )
}

UserProfile.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  updateUserData: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired
}

const mapStateToProps = ({
  currentUser: { currentUser, userData = new IMap() }
}) => {
  return {
    currentUser,
    userData
  }
}

export default connect(mapStateToProps)(UpdateUserData(UserProfile))
