import { auth } from '../firebase'
import {
  Avatar,
  ClickAwayListener,
  Divider,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper
} from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { ACCOUNT, CONTACTS, PROFILE, ROOT, USERS } from '../urls'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoggedInState from './HOC/LoggedInState'
import { Map as IMap } from 'immutable'
import { makeStyles } from '@material-ui/core/styles'
import {
  KeyboardArrowDown as ArrowDropDownIcon,
  KeyboardArrowUp as ArrowDropUpIcon
} from '@material-ui/icons'
// @ts-ignore
import initials from 'initials'
import { withRouter } from 'react-router-dom'
import { compose } from 'underscore'
import { calc, IS_A_MEMBER } from '../utilities/membershipUtils'
import gravatar from 'gravatar'
import rp from 'request-promise'
import { CurrentUserStore, UserOptionalProps } from '../entities/User'

interface Props {
  allowUsersPage: boolean
  allowContactsPage: boolean
  userData: any
  history: any
}

function Profile({ allowUsersPage, allowContactsPage, userData, history }: Props) {
  const useStyles = makeStyles({
    avatarWrapper: {
      alignItems: 'center',
      cursor: 'pointer',
      display: 'flex'
    },
    avatar: {
      cursor: 'pointer',
      width: 40,
      height: 40,
      backgroundColor: 'rgb(98, 71, 234)',
      fontSize: 13.33333
    },
    carrot: {
      color: '#fff',
      height: 24,
      width: 24
    },
    popper: {
      zIndex: 10000
    },
    menuItem: {
      padding: '10px 40px'
    }
  })
  const classes = useStyles()
  const anchorRef: any = React.useRef(null)
  const [open, setOpen] = React.useState(false)
  const [isGravatarFetched, setIsGravatarFetched] = useState(false)
  const [gravatarUrl, setGravatarUrl] = useState()
  const currentUserData: UserOptionalProps = userData.toJS()

  useEffect(() => {
    if (!userData || isGravatarFetched) {
      return
    }
    const func = async () => {
      if (!currentUserData.photoURL && !isGravatarFetched && currentUserData.email) {
        console.log('userData[EMAIL]:', currentUserData.email)
        const uri = gravatar.url(currentUserData.email, {
          protocol: 'https',
          default: '404'
        })
        try {
          console.log('before RP')
          await rp(uri)
          console.log('after RP')
          setGravatarUrl(uri)
        } catch (error) {
          console.log('after RP-EXCEPTION', error)
        } finally {
          setIsGravatarFetched(true)
        }
      }
    }

    func()
  }, [userData, isGravatarFetched, currentUserData.email, currentUserData.photoURL])

  function handleToggle() {
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = (url: string) => (event: any) => {
    if (
      anchorRef.current &&
      event &&
      anchorRef.current.contains(event.target)
    ) {
      return
    }
    history.push(url)

    setOpen(false)
  }


  if (!currentUserData.photoURL && !isGravatarFetched) {
    return null
  }
  const avatarUrl = currentUserData.photoURL || gravatarUrl
  return (
    <>
      <div
        className={classes.avatarWrapper}
        ref={anchorRef}
        onClick={handleToggle}
      >
        <Avatar className={classes.avatar} src={avatarUrl}>
          {!avatarUrl && initials(currentUserData.displayName)}
        </Avatar>
        <div>
          {open ? (
            <ArrowDropUpIcon className={classes.carrot} />
          ) : (
            <ArrowDropDownIcon className={classes.carrot} />
          )}
        </div>
      </div>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        transition
        placement="bottom-end"
        className={classes.popper}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'center top' }}>
            <Paper id="menu-list-grow">
              <ClickAwayListener onClickAway={handleClose('')}>
                <MenuList>
                  <MenuItem
                    onClick={handleClose(PROFILE)}
                    className={classes.menuItem}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={handleClose(ACCOUNT)}
                    className={classes.menuItem}
                  >
                    Account
                  </MenuItem>
                  {allowUsersPage && (
                    <MenuItem
                      onClick={handleClose(USERS)}
                      className={classes.menuItem}
                    >
                      Users
                    </MenuItem>
                  )}
                  {allowContactsPage && (
                    <MenuItem
                      onClick={handleClose(CONTACTS)}
                      className={classes.menuItem}
                    >
                      Contacts
                    </MenuItem>
                  )}
                  <Divider />
                  <MenuItem
                    onClick={event =>
                      auth.signOut() && handleClose(ROOT)(event)
                    }
                    className={classes.menuItem}
                  >
                    Sign out
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}

Profile.propTypes = {
  allowUsersPage: PropTypes.bool.isRequired,
  allowContactsPage: PropTypes.bool.isRequired,
  currentUser: PropTypes.object,
  userData: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  isMember: PropTypes.bool.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, currentUser, userData } }: CurrentUserStore) => {
  return {
    allowUsersPage:
      !!currentUser &&
      (!!permissions.usersRead[currentUser.uid] ||
        !!permissions.usersWrite[currentUser.uid]),
    allowContactsPage:
      !!currentUser &&
      (!!permissions.contactsRead[currentUser.uid] ||
        !!permissions.contactsWrite[currentUser.uid]),
    // @ts-ignore
    userData: userData || new IMap(),
    isMember: userData && calc(userData.toJS())[IS_A_MEMBER]
  }
}

export default compose(
  withRouter,
  LoggedInState({ name: 'Profile' }),
  connect(mapStateToProps)
)(Profile)