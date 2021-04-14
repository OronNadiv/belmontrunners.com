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
  Announcement as BlogIcon,
  Close as CloseIcon,
  Contacts as ContactsIcon,
  ExitToApp as SignInIcon,
  Home as HomeIcon,
  Menu as MenuIcon,
  People as MembersIcon,
  PeopleOutline as UsersIcon,
  PersonAdd as JoinUsIcon,
  PowerSettingsNew as SignOutIcon,
  SupervisedUserCircle as LeadershipIcon,
  QuestionAnswer as FAQIcon,
  Settings as AccountIcon
} from '@material-ui/icons'
import Profile from './Profile'
import {
  ACCOUNT,
  BLOG,
  CONTACTS,
  FAQ,
  FORGOT_PASSWORD,
  JOIN,
  ABOUT_US,
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
import calc from '../utilities/membershipUtils'
import firebase from 'firebase/app'
import { IRedisState, IUser } from '../entities/User'
import { compose } from 'underscore'
import { auth } from '../firebase'

const TOOLBAR_HEIGHT = 72
const DRAWER_WIDTH = 240
const BACKGROUND_IMAGE = 'linear-gradient(90deg,#141da2,#9b5cf6)'

interface Props extends RouteComponentProps {
  isCurrentUserLoaded: boolean,
  firebaseUser: firebase.User,
  allowUsersPage: boolean,
  allowContactsPage: boolean,
  isMember: boolean
}

function Header({ location: { pathname }, isCurrentUserLoaded, firebaseUser, allowUsersPage, allowContactsPage, isMember }: Props) {
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

      const scroll = $(window).scrollTop()
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
    menuItem: {
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

  const isSignedOut: boolean = isCurrentUserLoaded && !firebaseUser
  const isSignedIn: boolean = isCurrentUserLoaded && !!firebaseUser

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

              <Link to={ABOUT_US} onClick={handleDrawerClose}>
                <ListItem button>
                  <ListItemIcon><LeadershipIcon color='primary' /></ListItemIcon>
                  <ListItemText primary='About Us' className={classes.drawerLink} />
                </ListItem>
              </Link>

              <Link to={FAQ} onClick={handleDrawerClose}>
                <ListItem button>
                  <ListItemIcon><FAQIcon color='primary' /></ListItemIcon>
                  <ListItemText primary='FAQ' className={classes.drawerLink} />
                </ListItem>
              </Link>

              <a href={BLOG} onClick={handleDrawerClose}>
                <ListItem button>
                  <ListItemIcon><BlogIcon color='primary' /></ListItemIcon>
                  <ListItemText primary='Latest news' className={classes.drawerLink} />
                </ListItem>
              </a>

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
                      onClick={async () => {
                        handleDrawerClose()
                        await auth.signOut()
                      }}>
                  <ListItem button>
                    <ListItemIcon><SignOutIcon color='primary' /></ListItemIcon>
                    <ListItemText primary='Sign out' className={classes.drawerLink} />
                  </ListItem>
                </Link>
              }
            </List>
          </SwipeableDrawer>
        }

        <Toolbar className={classes.toolbar}>
          <div className='d-flex w-100 align-items-center'>
            <Link to={ROOT}>
              <img src="img/logo.png" alt='' style={{ verticalAlign: 'initial' }} />
            </Link>

            <div style={{ flexGrow: 1 }} />

            <div className='d-flex justify-content-around' style={{ flexGrow: 3 }}>
              {
                !isSmallDevice &&
                <>
                  <Link to={ABOUT_US} className={classes.menuItem}>
                    <div className='text-white d-flex align-items-center'>
                      <span className='mx-2'>About Us</span>
                    </div>
                  </Link>
                  <Link to={FAQ} className={classes.menuItem}>
                    <div className='text-white d-flex align-items-center'>
                      <span className='mx-2'>FAQ</span>
                    </div>
                  </Link>
                  <a href={BLOG} className={classes.menuItem}>
                    <div className='text-white d-flex align-items-center'>
                      <span className='mx-2'>Latest news</span>
                    </div>
                  </a>
                </>
              }
              {
                !isSmallDevice && isMember &&
                <Link to={MEMBERS} className={classes.menuItem} /*style={{ marginLeft: '2em' }}*/>
                  <div className='text-white d-flex align-items-center'>
                    <span className='mx-2'>Members</span>
                  </div>
                </Link>
              }
            </div>

            <div style={{ flexGrow: 1.5 }} />
          </div>
          <div style={{ width: !isSignedOut ? '10em' : '20em' }}
               className='d-flex flex-row-reverse justify-content-between'>
            {
              isSmallDevice &&
              <IconButton edge="start" color="inherit" aria-label="Menu" onClick={() => setShowDrawer(!showDrawer)}>
                <MenuIcon fontSize="large" />
              </IconButton>
            }
            {
              !isSmallDevice && isSignedIn &&
              <Profile />
            }
            {
              !isSmallDevice && isSignedOut && pathname.trim() !== JOIN &&
              <Link to={{
                pathname: JOIN
              }}>
                <Button variant='contained' color='primary' className='ml-5'>
                  Join Us
                </Button>
              </Link>
            }
            {
              !isSmallDevice && isSignedOut &&
              <Link to={SIGN_IN} className='signin-btn text-white'>
                <Button className='text-white'>
                  Sign in
                </Button>
              </Link>
            }
          </div>
        </Toolbar>
      </AppBar>
    </div>
  )
}

Header.propTypes = {
  allowUsersPage: PropTypes.bool.isRequired,
  allowContactsPage: PropTypes.bool.isRequired,
  isCurrentUserLoaded: PropTypes.bool.isRequired,
  firebaseUser: PropTypes.object,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  isMember: PropTypes.bool.isRequired
}

const mapStateToProps = ({ currentUser: { isCurrentUserLoaded, firebaseUser, permissions, userData } }: IRedisState) => {
  const userDataJS: IUser = userData ? userData.toJS() : undefined
  return {
    allowUsersPage: !firebaseUser ? false : !!(permissions.usersRead[firebaseUser.uid] || permissions.usersWrite[firebaseUser.uid]),
    allowContactsPage: !firebaseUser ? false : !!(permissions.contactsRead[firebaseUser.uid] || permissions.contactsWrite[firebaseUser.uid]),
    isMember: userData && calc(userDataJS).isAMember,
    isCurrentUserLoaded,
    firebaseUser
  }
}

export default compose(
  withRouter,
  connect(mapStateToProps)
)(Header)
