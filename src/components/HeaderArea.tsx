import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  AppBar,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  Toolbar,
  useMediaQuery,
  useTheme
} from '@material-ui/core'
import {
  AccountCircle as ProfileIcon,
  Close as CloseIcon,
  Contacts as ContactsIcon,
  ExitToApp as SignInIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  People as MembersIcon,
  PeopleOutline as UsersIcon,
  PersonAdd as JoinUsIcon,
  PowerSettingsNew as SignOutIcon,
  Settings as AccountIcon
} from '@material-ui/icons'
import Profile from './Profile'
import {
  ACCOUNT,
  CONTACTS,
  FORGOT_PASSWORD,
  JOIN,
  MEMBERS,
  PROFILE,
  RESET_PASSWORD,
  ROOT,
  SIGN_IN,
  USERS
} from '../urls'
import { RouteComponentProps } from 'react-router'
import { Link, withRouter } from 'react-router-dom'
import $ from 'jquery'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { calc, IS_A_MEMBER } from '../utilities/membershipUtils'
import { UID } from '../fields'
import firebase from 'firebase'
import { ICurrentUserStore } from "../reducers/ICurrentUserStore";
import { compose } from 'underscore'

const TOOLBAR_HEIGHT = 72
const DRAWER_WIDTH = 240
const BACKGROUND_IMAGE = 'linear-gradient(90deg,#141da2,#9b5cf6)'

interface IHeaderAreaProps extends RouteComponentProps<{}> {
  isCurrentUserLoaded: boolean,
  currentUser: firebase.User,
  allowUsersPage: boolean,
  allowContactsPage: boolean,
  isMember: boolean
}

function HeaderArea (props: IHeaderAreaProps) {
  const { location: { pathname }, isCurrentUserLoaded, currentUser, allowUsersPage, allowContactsPage, isMember } = props
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
      const nav_offset_top: number = TOOLBAR_HEIGHT + 50

      const scroll = $(window).scrollTop
      if (scroll && Number(scroll) >= nav_offset_top) {
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

  const rootStyle: { height?: number } = {}
  const appBarStyle: {
    background?: string,
    position?: 'fixed',
    transform?: string,
    transition?: string,
    backgroundImage?: string,
    top?: number,
  } = {}
  if (transparentBackground && !isSmallDevice) {
    appBarStyle.background = 'transparent'
  } else {
    appBarStyle.position = 'fixed'
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
    members: {
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

  const handleDrawerClose = (event: { type?: string, key?: string } = {}) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return
    }
    setShowDrawer(false)
  }

  const isSignedOut: boolean = isCurrentUserLoaded && !currentUser
  const isSignedIn: boolean = isCurrentUserLoaded && !!currentUser

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
                <>
                  <Link to={PROFILE} onClick={handleDrawerClose}>
                    <ListItem button>
                      <ListItemIcon><ProfileIcon color='primary' /></ListItemIcon>
                      <ListItemText primary='Profile' className={classes.drawerLink} />
                    </ListItem>
                  </Link>
                  <Link to={ACCOUNT} onClick={handleDrawerClose}>
                    <ListItem button>
                      <ListItemIcon><AccountIcon color='primary' /></ListItemIcon>
                      <ListItemText primary='Account' className={classes.drawerLink} />
                    </ListItem>
                  </Link>
                </>
              }

              {
                isMember &&
                <Link to={MEMBERS} onClick={handleDrawerClose}>
                  <ListItem button>
                    <ListItemIcon><MembersIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='Members' className={classes.drawerLink} />
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
            <Link to={MEMBERS} className={classes.members}>
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

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, currentUser, permissions, userData } }: ICurrentUserStore) => {
  return {
    allowUsersPage: !!currentUser && (permissions.usersRead[currentUser[UID]] || permissions.usersWrite[currentUser[UID]]),
    allowContactsPage: !!currentUser && (permissions.contactsRead[currentUser[UID]] || permissions.contactsWrite[currentUser[UID]]),
    isMember: userData && calc(userData)[IS_A_MEMBER],
    isCurrentUserLoaded,
    currentUser
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps)
)(HeaderArea)