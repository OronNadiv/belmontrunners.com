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
  MEMBERS,
  ONLY_ME,
  PHONE,
  PHOTO_URL,
  STATE,
  UID,
  ZIP
} from '../../fields'
import googleLibPhoneNumber from 'google-libphonenumber'
import CloseIcon from '@material-ui/icons/Close'
import SmartPhoneIcon from '@material-ui/icons/Smartphone'
import HomeIcon from '@material-ui/icons/Home'
import EmailIcon from '@material-ui/icons/Email'
import PersonIcon from '@material-ui/icons/Person'
import GroupIcon from '@material-ui/icons/Group'
import CakeIcon from '@material-ui/icons/Cake'
import IconButton from '@material-ui/core/IconButton'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import { connect } from 'react-redux'
import { Map as IMap } from 'immutable'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import UpdateUserData from '../../components/UpdateUserData'
import Avatar from '@material-ui/core/Avatar'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { linkToFacebook } from '../../utilities/linkToFacebook'
import _ from 'underscore'
import Snackbar from '@material-ui/core/Snackbar'
import SnackbarContent from '@material-ui/core/SnackbarContent'

const defaultVisibility = {
  [EMAIL]: ONLY_ME,
  [PHONE]: ONLY_ME,
  [ADDRESS1]: ONLY_ME,
  [DATE_OF_BIRTH]: ONLY_ME
}

const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()

function UserProfile ({ onClose, user, visibility, userData, updateUserData, currentUser }) {
  const theme = useTheme()

  const useStyles = makeStyles({
    avatar: {
      width: 60,
      height: 60,
      backgroundColor: theme.palette.primary.main
    }
  })
  const classes = useStyles()

  console.log('user:', user)

  const [refs, setRefs] = useState({})
  const [openMenus, setOpenMenus] = useState({})
  const [errorMessage, setErrorMessage] = useState('')

  function getPhone () {
    if (!user[PHONE]) {
      return
    }
    const number = phoneUtil.parseAndKeepRawInput(user[PHONE], 'US')
    return phoneUtil.format(number, PNF.NATIONAL)
  }

  function getAddress () {
    if (user[ADDRESS1] || user[ADDRESS2] || user[CITY] || user[STATE] || user[ZIP]) {
      return <div>
        {user[ADDRESS1] && <div>{user[ADDRESS1]}<br /></div>}
        {user[ADDRESS2] && <div>{user[ADDRESS2]}<br /></div>}
        {user[CITY] && <span>{user[CITY]}, </span>}
        {user[STATE] && <span>{user[STATE]} </span>}
        {user[ZIP] && <span>{user[ZIP]}</span>}
      </div>
    }
    return null
  }

  function getKeyVal (label, value, icon, currVisibility, onVisibilityChanged) {
    const handleOpen = () => {
      openMenus[label] = true
      setOpenMenus({ ...openMenus })
    }

    const handleClose = () => {
      openMenus[label] = false
      setOpenMenus({ ...openMenus })
    }

    const handleRef = (ref) => {
      refs[label] = ref
      setRefs(refs)
    }

    return !value ? null : (
      <div className='mb-4'>
        <div className='d-flex align-items-top'>
          {icon}
          {/*<div className='mr-1 text-secondary' style={{ width: 90 }}>{label}:</div>*/}
          <div>{value}</div>
        </div>
        {
          currentUser[UID] === user[UID] &&
          <small
            onClick={handleOpen}
            ref={handleRef}
          >
            <span className='text-muted'>Visible to: </span>
            {currVisibility === ONLY_ME && 'Only me'}
            {currVisibility === MEMBERS && 'Club members'}
            <span className='text-primary' style={{ cursor: 'pointer' }}> (change)</span>
          </small>
        }
        <Menu
          id="customized-menu"
          anchorEl={refs[label]}
          keepMounted
          open={!!openMenus[label]}
          onClose={handleClose}
        >
          <MenuItem onClick={() => {
            onVisibilityChanged(ONLY_ME)
            handleClose()
          }}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Only me" />
          </MenuItem>
          <MenuItem onClick={() => {
            onVisibilityChanged(MEMBERS)
            handleClose()
          }}>
            <ListItemIcon>
              <GroupIcon />
            </ListItemIcon>
            <ListItemText primary="Club members" />
          </MenuItem>
        </Menu>
      </div>
    )
  }

  function handleVisibilityChanged (keys) {
    return async (val) => {
      keys.forEach(key => {
        visibility = visibility.set(key, val)
      })
      await updateUserData({ visibility: visibility.toJS() }, { merge: true })
    }
  }

  const handleLinkToFacebook = async () => {
    try {
      await linkToFacebook(currentUser, userData, updateUserData)
    } catch (error) {
      setErrorMessage('Failed to link to your Facebook account')
    }
  }

  const connectedToFacebook = Boolean(_.findWhere(currentUser.providerData, { providerId: 'facebook.com' }))

  return (
    <SwipeableDrawer
      open
      anchor="right"
      onOpen={() => {
      }}
      onClose={() => onClose()}
    >
      {
        errorMessage && (
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
        )
      }

      <div className='clearfix' style={{ minWidth: 270 }}>
        <IconButton
          className='float-left'
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={() => onClose()}
        >
          <CloseIcon />
        </IconButton>
      </div>
      <div className='mx-5'>
        <div className='mb-5'>
          <div className='d-flex justify-content-center mb-4 align-items-center'>
            <Avatar className={classes.avatar} src={user[PHOTO_URL]}>{initials(user[DISPLAY_NAME])}</Avatar>
          </div>
          <div className='d-flex justify-content-center mb-4 align-items-center'>
            {user[DISPLAY_NAME]}
          </div>
          {
            currentUser[UID] === user[UID] &&
            !connectedToFacebook &&
            <div>
              <small>
                <span className='text-muted'>Missing photo? </span>
                <span className='text-primary' style={{ cursor: 'pointer' }} onClick={handleLinkToFacebook}>Link to Facebook</span>
              </small>
            </div>
          }
        </div>
        {
          getKeyVal(
            'Phone',
            getPhone(),
            <SmartPhoneIcon className='mr-2' style={{ fill: '#D2D6DB' }} />,
            visibility.get(PHONE) || defaultVisibility[PHONE],
            (val) => handleVisibilityChanged([PHONE])(val)
          )
        }
        {
          getKeyVal(
            'Address',
            getAddress(),
            <HomeIcon className='mr-2' style={{ fill: '#D2D6DB' }} />,
            visibility.get(ADDRESS1) || defaultVisibility[ADDRESS1],
            (val) => handleVisibilityChanged([ADDRESS1, ADDRESS2, CITY, STATE, ZIP])(val)
          )
        }
        {
          getKeyVal(
            'Email',
            user[EMAIL], // getEmail(),
            <EmailIcon className='mr-2' style={{ fill: '#D2D6DB' }} />,
            visibility.get(EMAIL) || defaultVisibility[EMAIL],
            (val) => handleVisibilityChanged([EMAIL])(val)
          )
        }
        {
          getKeyVal(
            'Birthday',
            user[DATE_OF_BIRTH] && moment(user[DATE_OF_BIRTH]).format('MMMM D'),
            <CakeIcon className='mr-2' style={{ fill: '#D2D6DB' }} />,
            visibility.get(DATE_OF_BIRTH) || defaultVisibility[DATE_OF_BIRTH],
            (val) => handleVisibilityChanged([DATE_OF_BIRTH])(val)
          )
        }
      </div>
    </SwipeableDrawer>
  )
}


UserProfile.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  updateUserData: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,
  visibility: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser, userData } }) => {
  return {
    currentUser,
    userData: userData || new IMap(),
    visibility: userData ? userData.get('visibility') : new IMap()
  }
}

export default connect(mapStateToProps)(UpdateUserData(UserProfile))
