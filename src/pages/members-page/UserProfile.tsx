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
import { IRedisState, IUser, IUserOptionalProps, IUserPropsVisibility, VisibilityEnum } from '../../entities/User'
import { IUpdateUserData } from '../../reducers/currentUser'

const defaultVisibility = {
  [EMAIL]: ONLY_ME,
  [PHONE]: ONLY_ME,
  [ADDRESS1]: ONLY_ME,
  [DATE_OF_BIRTH]: ONLY_ME
}

const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()
const DRAWER_WIDTH = 270

interface Props {
  onClose: () => void
  firebaseUser: firebase.User
  userData: any
  user: IUserOptionalProps
  updateUserData: IUpdateUserData
}

function UserProfile({ onClose, user, userData, updateUserData, firebaseUser }: Props) {
  const userDataJS: IUser = userData.toJS()
  const visibility: IUserPropsVisibility = userDataJS.visibility || {}
  const theme = useTheme()
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'))

  const AVATAR_WIDTH = 100
  const AVATAR_HEIGHT = 100

  const drawerPaper: { width?: string, minWidth?: number } = {}
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

  const [refs, setRefs] = useState<{ [key: string]: HTMLElement | null }>({})
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({})
  const [errorMessage, setErrorMessage] = useState('')

  function getPhone() {
    if (!user.phone) {
      return
    }
    const number = phoneUtil.parseAndKeepRawInput(user.phone, 'US')
    return phoneUtil.format(number, PNF.NATIONAL)
  }

  function getAddress() {
    if (
      user.address1 ||
      user.address2 ||
      user.city ||
      user.state ||
      user.zip
    ) {
      return (
        <div>
          {user.address1 && user.address1}
          {user.address1 && <br />}
          {user.address2 && user.address2}
          {user.address2 && <br />}
          {user.city && `${user.city}, `}
          {user.state && `${user.state} `}
          {user.zip && user.zip}
        </div>
      )
    }
    return null
  }

  const getKeyVal = (label: string,
                     icon: any,
                     currVisibility: VisibilityEnum,
                     onVisibilityChanged: (arg0: VisibilityEnum) => void,
                     value?: string | null | JSX.Element) => {
    const handleOpen = () => {
      openMenus[label] = true
      setOpenMenus({ ...openMenus })
    }

    const handleClose = () => {
      openMenus[label] = false
      setOpenMenus({ ...openMenus })
    }

    const handleRef = (ref: HTMLElement) => {
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
        {firebaseUser.uid === user.uid && (
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
          anchorEl={refs && refs[label]}
          keepMounted
          open={openMenus && openMenus[label]}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              onVisibilityChanged(VisibilityEnum.ONLY_ME)
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
              onVisibilityChanged(VisibilityEnum.MEMBERS)
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

  const handleVisibilityChanged = (keys: string[]) => {
    return async (val: VisibilityEnum) => {
      keys.forEach((key: string) => {
        visibility[key] = val
      })
      await updateUserData({ visibility }, { merge: true })
    }
  }

  const handleLinkToFacebook = async () => {
    try {
      await linkToFacebook(firebaseUser, userDataJS, updateUserData)
    } catch (error) {
      setErrorMessage('Operation failed')
    }
  }

  const connectedToFacebook = Boolean(
    findWhere(firebaseUser.providerData, { providerId: 'facebook.com' })
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
      onOpen={() => {
        // nothing to do here but this prop is still set as required.
      }}
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
          <Avatar className={` ${classes.avatar}`} src={avatarUrl || undefined}>
            {
              !avatarUrl &&
              // @ts-ignore
              initials(user[DISPLAY_NAME])
            }
          </Avatar>
          <div className="mt-3">{user[DISPLAY_NAME]}</div>
          {firebaseUser.uid === user.uid && !connectedToFacebook && (
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
            <EmailIcon className="mr-2" style={{ fill: '#D2D6DB' }} />,
            visibility[EMAIL] || defaultVisibility[EMAIL],
            (val: VisibilityEnum) => handleVisibilityChanged([EMAIL])(val),
            user.email // getEmail(),
          )}
          {getKeyVal(
            'Phone',
            <SmartPhoneIcon className="mr-2" style={{ fill: '#D2D6DB' }} />,
            visibility[PHONE] || defaultVisibility[PHONE],
            (val: VisibilityEnum) => handleVisibilityChanged([PHONE])(val),
            getPhone()
          )}
          {getKeyVal(
            'Address',
            <HomeIcon className="mr-2" style={{ fill: '#D2D6DB' }} />,
            visibility.address1 || defaultVisibility.address1,
            (val: VisibilityEnum) =>
              handleVisibilityChanged([ADDRESS1, ADDRESS2, CITY, STATE, ZIP])(val),
            getAddress()
          )}
          {getKeyVal(
            'Birthday',
            <CakeIcon className="mr-2" style={{ fill: '#D2D6DB' }} />,
            visibility[DATE_OF_BIRTH] || defaultVisibility[DATE_OF_BIRTH],
            (val: VisibilityEnum) => handleVisibilityChanged([DATE_OF_BIRTH])(val),
            user.dateOfBirth ? moment(user.dateOfBirth).format('MMMM D') : undefined
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
  firebaseUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired
}

const mapStateToProps = ({
                           currentUser: {
                             firebaseUser,
                             userData
                           }
                         }: IRedisState) => {

  return {
    firebaseUser,
    userData: userData ||
      // @ts-ignore
      new IMap()
  }
}

export default connect(mapStateToProps)(UpdateUserData(UserProfile))
