import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import HomeIcon from '@material-ui/icons/Home'
import MyProfileIcon from '@material-ui/icons/AccountCircle'
import MembersDirectoryIcon from '@material-ui/icons/People'
import UsersIcon from '@material-ui/icons/PeopleOutline'
import ContactsIcon from '@material-ui/icons/Contacts'
import SignOutIcon from '@material-ui/icons/PowerSettingsNew'
import SignInIcon from '@material-ui/icons/ExitToApp'
import JoinUsIcon from '@material-ui/icons/PersonAdd'
import moment from 'moment'

import Profile from './Profile'
import {
  CONTACTS,
  FORGOT_PASSWORD,
  JOIN,
  MEMBERS_DIRECTORY,
  MY_PROFILE,
  RESET_PASSWORD,
  ROOT,
  SIGN_IN,
  USERS
} from '../urls'
import { Link, withRouter } from 'react-router-dom'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme } from '@material-ui/core'
import $ from 'jquery'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import CloseIcon from '@material-ui/icons/Close'
import Divider from '@material-ui/core/Divider'
import firebase from 'firebase'
import ListItem from '@material-ui/core/ListItem'
import List from '@material-ui/core/List'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Toolbar from '@material-ui/core/Toolbar'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { MEMBERSHIP_EXPIRES_AT, UID } from '../fields'

const TOOLBAR_HEIGHT = 72
const DRAWER_WIDTH = 240
const BACKGROUND_IMAGE = 'linear-gradient(90deg,#141da2,#9b5cf6)'


function HeaderArea ({ location: { pathname }, isCurrentUserLoaded, currentUser, allowUsersPage, allowContactsPage, isMember }) {
  const [transparentBackground, setTransparentBackground] = useState(true)
  const [showDrawer, setShowDrawer] = useState(false)

  useEffect(() => {
    const evalBackground = () => {
      if (
        pathname !== ROOT &&
        pathname !== SIGN_IN &&
        pathname !== FORGOT_PASSWORD &&
        pathname !== RESET_PASSWORD
      ) {
        setTransparentBackground(false)
        return
      }
      const nav_offset_top = TOOLBAR_HEIGHT + 50

      const scroll = $(window).scrollTop()
      if (scroll >= nav_offset_top) {
        setTransparentBackground(false)
      } else {
        setTransparentBackground(true)
      }
    }
    $(window).scroll(evalBackground)
    evalBackground()
    return () => {
      $(window).unbind('scroll')
    }
  }, [pathname])

  const theme = useTheme()
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'))

  const rootStyle = {}
  const appBarStyle = {}
  if (transparentBackground && !isSmallDevice) {
    appBarStyle.background = 'transparent'
  } else {
    appBarStyle.position = `fixed`
    appBarStyle.transform = `translateY(${TOOLBAR_HEIGHT}px)`
    if (!isSmallDevice) {
      appBarStyle.transition = 'transform 500ms ease, background 500ms ease'
    }
    appBarStyle.backgroundImage = BACKGROUND_IMAGE
    appBarStyle.top = -TOOLBAR_HEIGHT
    rootStyle.height = TOOLBAR_HEIGHT

  }
  const useStyles = makeStyles(() => ({
    root: {
      flexGrow: 1,
      ...rootStyle
    },
    appBar: {
      boxShadow: 'none',
      ...appBarStyle
    },
    toolbar: {
      height: TOOLBAR_HEIGHT,
      margin: isSmallDevice ? 0 : '0 3em'
    },
    growLeft: {},
    growMiddle: {
      flexGrow: 1
    },
    growRight: {},
    membersDirectory: {
      font: '500 12px/80px "Roboto", sans-serif',
      textTransform: 'uppercase',
      color: 'white'
    },
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0
    },
    drawerPaper: {
      width: DRAWER_WIDTH
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      ...theme.mixins.toolbar,
      justifyContent: 'flex-start',
      backgroundColor: '#9b5cf6',
      height: TOOLBAR_HEIGHT
    },
    drawerHeaderCloseIcon: {
      color: 'white'
    },
    drawerList: {
      paddingTop: 20,
      paddingLeft: 10
    },
    drawerLink: {
      color: theme.palette.text.primary
    }
  }))
  const classes = useStyles()

  const handleOpenDrawer = () => {
    setShowDrawer(true)
  }

  const handleDrawerClose = (event = {}) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setShowDrawer(false)
  }

  const isSignedOut = isCurrentUserLoaded && !currentUser
  const isSignedIn = isCurrentUserLoaded && currentUser

  return (
    <div className={classes.root}>
      <AppBar position="absolute" className={classes.appBar}>
        {
          isSmallDevice &&
          <SwipeableDrawer
            className={classes.drawer}
            anchor="right"
            open={showDrawer}
            onOpen={handleOpenDrawer}
            classes={{
              paper: classes.drawerPaper
            }}
            onClose={handleDrawerClose}
          >
            <div className={classes.drawerHeader}>
              <IconButton onClick={handleDrawerClose}>
                <CloseIcon className={classes.drawerHeaderCloseIcon} />
              </IconButton>
            </div>
            <Divider />
            <List className={classes.drawerList}>
              {
                isSignedIn &&
                <Link to={ROOT} onClick={handleDrawerClose}>
                  <ListItem button>
                    <ListItemIcon><HomeIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='Home' className={classes.drawerLink} />
                  </ListItem>
                </Link>
              }
              {
                isSignedIn &&
                <Link to={MY_PROFILE} onClick={handleDrawerClose}>
                  <ListItem button>
                    <ListItemIcon><MyProfileIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='My profile' className={classes.drawerLink} />
                  </ListItem>
                </Link>
              }

              {
                isMember &&
                <Link to={MEMBERS_DIRECTORY} onClick={handleDrawerClose}>
                  <ListItem button>
                    <ListItemIcon><MembersDirectoryIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='Members Directory' className={classes.drawerLink} />
                  </ListItem>
                </Link>
              }

              {
                allowUsersPage &&
                <Link to={USERS} onClick={handleDrawerClose}>
                  <ListItem button>
                    <ListItemIcon><UsersIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='Users' className={classes.drawerLink} />
                  </ListItem>
                </Link>
              }

              {
                allowContactsPage &&
                <Link to={CONTACTS} onClick={handleDrawerClose}>
                  <ListItem button>
                    <ListItemIcon><ContactsIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='Contacts' className={classes.drawerLink} />
                  </ListItem>
                </Link>
              }


              {
                isSignedIn &&
                <Link to={ROOT}
                      onClick={() => {
                        handleDrawerClose()
                        firebase.auth().signOut()
                      }}>
                  <ListItem button>
                    <ListItemIcon><SignOutIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='Sign out' className={classes.drawerLink} />
                  </ListItem>
                </Link>
              }
              {
                isSignedOut &&
                <Link to={SIGN_IN} onClick={handleDrawerClose}>
                  <ListItem button>
                    <ListItemIcon><SignInIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='Sign in' className={classes.drawerLink} />
                  </ListItem>

                </Link>
              }
              {
                isSignedOut &&
                <Link to={{
                  pathname: JOIN
                }} onClick={handleDrawerClose}>
                  <ListItem button>
                    <ListItemIcon><JoinUsIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='Join us' className={classes.drawerLink} />
                  </ListItem>
                </Link>
              }
            </List>
          </SwipeableDrawer>
        }

        <Toolbar className={classes.toolbar}>

          <div className={classes.growLeft} />

          <Link to={ROOT}>
            <img src="img/logo.png" alt='' />
          </Link>
          {
            /*
            Disabling for now until we have multiple menu item.  Only one item does not look good.

            !isSmallDevice &&
            <Link to={MEMBERS_DIRECTORY} className={classes.membersDirectory}>
              <div className='text-white' style={{ marginLeft: 250 }}>
                Members
              </div>
            </Link>
            */
          }
          <div className={classes.growMiddle} />

          {
            isSmallDevice &&
            <IconButton edge="start" color="inherit" aria-label="Menu" onClick={() => setShowDrawer(!showDrawer)}>
              <MenuIcon fontSize="large" />
            </IconButton>
          }

          {
            !isSmallDevice && isCurrentUserLoaded && currentUser &&
            <Profile />
          }
          {
            !isSmallDevice && isCurrentUserLoaded && !currentUser &&
            <Link to={SIGN_IN} className='signin-btn text-white'>
              <Button className='text-white'>
                Sign in
              </Button>
            </Link>
          }
          {
            !isSmallDevice && isCurrentUserLoaded && !currentUser && pathname.trim() !== JOIN &&
            <Link to={{
              pathname: JOIN
            }}>
              <Button variant='contained' color='primary' className='ml-5'>
                Join Us
              </Button>
            </Link>
          }

          <div className={classes.growRight} />

        </Toolbar>
      </AppBar>
    </div>
  )
}

HeaderArea.propTypes = {
  allowUsersPage: PropTypes.bool.isRequired,
  allowContactsPage: PropTypes.bool.isRequired,
  isCurrentUserLoaded: PropTypes.bool.isRequired,
  currentUser: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  isMember: PropTypes.bool.isRequired
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, currentUser, permissions, userData } }) => {
  return {
    allowUsersPage: !!currentUser && (
      !!permissions.usersRead[currentUser[UID]] ||
      !!permissions.usersWrite[currentUser[UID]]),
    allowContactsPage: !!currentUser && (
      !!permissions.contactsRead[currentUser[UID]] ||
      !!permissions.contactsWrite[currentUser[UID]]),
    isMember: !!(userData && userData.get(MEMBERSHIP_EXPIRES_AT) && moment(userData.get(MEMBERSHIP_EXPIRES_AT)).isAfter(moment())),
    isCurrentUserLoaded,
    currentUser
  }
}

export default connect(mapStateToProps)(withRouter(HeaderArea))
