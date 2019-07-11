import 'firebase/auth'
import firebase from 'firebase'
import { Avatar, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper,Divider } from '@material-ui/core'
import React from 'react'
import { ACCOUNT, CONTACTS, MEMBERS, PROFILE, ROOT, USERS } from '../urls'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoggedInState from './HOC/LoggedInState'
import { DISPLAY_NAME, PHOTO_URL, UID } from '../fields'
import { Map as IMap } from 'immutable'
import { makeStyles } from '@material-ui/core/styles'
import { KeyboardArrowDown as ArrowDropDownIcon, KeyboardArrowUp as ArrowDropUpIcon } from '@material-ui/icons'
import initials from 'initials'
import { withRouter } from 'react-router-dom'
import { compose } from 'underscore'
import { calc, IS_A_MEMBER } from '../utilities/membershipUtils'

function Profile ({ allowUsersPage, allowContactsPage, isMember, userData, history }) {

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
  const anchorRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)

  function handleToggle () {
    setOpen(prevOpen => !prevOpen)
  }

  const handleClose = (url) => (event) => {
    if (anchorRef.current && event && anchorRef.current.contains(event.target)) {
      return
    }
    history.push(url)

    setOpen(false)
  }

  userData = userData.toJS()

  return (
    <>
      <div className={classes.avatarWrapper} ref={anchorRef} onClick={handleToggle}>
        <Avatar className={classes.avatar} src={userData[PHOTO_URL]}>
          {
            initials(userData[DISPLAY_NAME])
          }
        </Avatar>
        <div>
          {
            open ?
              <ArrowDropUpIcon className={classes.carrot} /> :
              <ArrowDropDownIcon className={classes.carrot} />
          }
        </div>
      </div>
      <Popper open={open} anchorEl={anchorRef.current} transition placement='bottom-end' className={classes.popper}>
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: 'center top' }}
          >
            <Paper id='menu-list-grow'>
              <ClickAwayListener onClickAway={handleClose()}>
                <MenuList>
                  <MenuItem onClick={handleClose(PROFILE)} className={classes.menuItem}>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleClose(ACCOUNT)} className={classes.menuItem}>
                    Account
                  </MenuItem>
                  {
                    isMember &&
                    <MenuItem onClick={handleClose(MEMBERS)} className={classes.menuItem}>
                      Members
                    </MenuItem>
                  }
                  {
                    allowUsersPage &&
                    <MenuItem onClick={handleClose(USERS)} className={classes.menuItem}>
                      Users
                    </MenuItem>
                  }
                  {
                    allowContactsPage &&
                    <MenuItem onClick={handleClose(CONTACTS)} className={classes.menuItem}>
                      Contacts
                    </MenuItem>
                  }
                  <Divider />
                  <MenuItem onClick={(event) => firebase.auth().signOut() && handleClose(ROOT)(event)}
                            className={classes.menuItem}>
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

const mapStateToProps = ({ currentUser: { permissions, currentUser, userData } }) => {
  return {
    allowUsersPage: !!currentUser && (
      !!permissions.usersRead[currentUser[UID]] ||
      !!permissions.usersWrite[currentUser[UID]]),
    allowContactsPage: !!currentUser && (
      !!permissions.contactsRead[currentUser[UID]] ||
      !!permissions.contactsWrite[currentUser[UID]]),
    userData: userData || new IMap(),
    isMember: userData && calc(userData.toJS())[IS_A_MEMBER]
  }
}

export default compose(
  withRouter,
  LoggedInState({ name: 'Profile' }),
  connect(mapStateToProps)
)(Profile)

