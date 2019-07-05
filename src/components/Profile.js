import 'firebase/auth'
import firebase from 'firebase'
import Avatar from '@material-ui/core/avatar'
import React from 'react'
import { Link } from 'react-router-dom'
import { CONTACTS, MEMBERS_DIRECTORY, MY_PROFILE, ROOT, USERS } from '../urls'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import LoggedInState from './LoggedInState'
import { DISPLAY_NAME, MEMBERSHIP_EXPIRES_AT, PHOTO_URL, UID } from '../fields'
import moment from 'moment'
import { Map as IMap } from 'immutable'
import { makeStyles } from '@material-ui/core/styles'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import initials from 'initials'

function Profile ({ allowUsersPage, allowContactsPage, isMember, userData }) {

  const useStyles = makeStyles({
    avatarWrapper: {
      display: 'flex',
      alignItems: 'center'
    },
    avatar: {
      cursor: 'pointer',
      width: 40,
      height: 40,
      backgroundColor: 'rgb(98, 71, 234)',
      fontSize: 13.33333
    },
    carrot: {
      cursor: 'pointer',
      width: 18,
      height: 18,
      color: 'rgb(98, 71, 234)'
    },
    popper: {
      zIndex: 10000
    }
  })
  const classes = useStyles()
  const anchorRef = React.useRef(null)
  const [open, setOpen] = React.useState(false)

  function handleToggle () {
    setOpen(prevOpen => !prevOpen)
  }

  function handleClose (event) {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return
    }

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
            <Paper id="menu-list-grow">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  <MenuItem onClick={handleClose}>
                    <Link to={MY_PROFILE} className="dropdown-item">
                      My profile
                    </Link>
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    {
                      isMember &&
                      <Link to={MEMBERS_DIRECTORY} className="dropdown-item">
                        Members
                      </Link>
                    }
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    {
                      allowUsersPage &&
                      <Link to={USERS} className='dropdown-item'>
                        Users
                      </Link>
                    }
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    {
                      allowContactsPage &&
                      <Link to={CONTACTS} className='dropdown-item'>
                        Contacts
                      </Link>
                    }
                  </MenuItem>
                  <div className="dropdown-divider" />
                  <MenuItem onClick={handleClose}>
                    <Link className='dropdown-item' to={ROOT}
                          onClick={() => firebase.auth().signOut()}>
                      Sign out
                    </Link>
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
    isMember: !!(userData && userData.get(MEMBERSHIP_EXPIRES_AT) && moment(userData.get(MEMBERSHIP_EXPIRES_AT)).isAfter(moment()))
  }
}

export default LoggedInState({ name: 'profile', isRequiredToBeLoggedIn: true })(connect(mapStateToProps)(Profile))
