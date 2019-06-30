import 'firebase/functions'
import firebase from 'firebase'
import React, { useEffect, useState } from "react"
import { DISPLAY_NAME, PHOTO_URL, UID } from '../../fields'
import Chip from '@material-ui/core/Chip'
import * as PropTypes from 'prop-types'
import { updateUserData as updateUserDataAction } from '../../reducers/currentUser'
import { connect } from 'react-redux'
import Paper from '@material-ui/core/Paper'
import DirectionsRun from '@material-ui/icons/DirectionsRun'
import Avatar from '@material-ui/core/Avatar'
import FuzzySearch from 'fuzzy-search'
import LoggedInState from '../../components/LoggedInState'
import UserProfile from './UserProfile'
import { makeStyles } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import _ from 'underscore'
import { MEMBERS_DIRECTORY } from '../../urls'
import SearchBox from '../../components/SearchBox'

function MembersDirectory ({ currentUser, location: { pathname }, history }) {
  const useStyles = makeStyles(() => ({
    chipAvatar: {
      width: 32,
      height: 32
    }
  }))
  const classes = useStyles()

  const [users, setUsers] = useState([])
  useEffect(() => {
    if (!currentUser) {
      return
    }
    (async function () {
      const resp = await firebase.functions().httpsCallable('getMembers')()
      setUsers(resp.data)
    })()
  }, [currentUser])

  const [selected, setSelected] = useState()
  useEffect(() => {
    if (users.length === 0) {
      return
    }
    const pathnames = pathname.split('/').filter((val) => !!val)
    if (pathnames.length < 2) {
      setSelected()
      return
    }
    const selected = _.findWhere(users, { [UID]: pathnames[1] })
    if (selected) {
      setSelected(selected)
    } else {
      history.push(MEMBERS_DIRECTORY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, pathname])

  const [search, setSearch] = useState('')

  const handleChipSelected = (user) => {
    history.push(`${MEMBERS_DIRECTORY}/${user[UID]}`)
  }

  const handleDrawerClosed = () => {
    history.push(`${MEMBERS_DIRECTORY}`)
  }

  const getChips = () => {
    let filteredUsers = users
    if (search) {
      const searcher = new FuzzySearch(users, [DISPLAY_NAME], {
        caseSensitive: false
      })
      filteredUsers = searcher.search(search)
    }

    return filteredUsers.map(
      (user) => {
        let label = user[DISPLAY_NAME]

        function getColor () {
          if (user.uid === currentUser.uid) {
            return 'primary'
          }
          return 'default'
        }

        return <Chip
          className='my-1 mx-1'
          avatar={
            user[PHOTO_URL] ?
              <Avatar className={classes.chipAvatar} src={user[PHOTO_URL]} /> :
              <Avatar className={classes.chipAvatar}><DirectionsRun /></Avatar>
          }
          onClick={() => handleChipSelected(user)}
          key={user[UID]}
          label={label}
          color={getColor()}
        />
      }
    )
  }

  return !currentUser ?
    <></> :
    <div className='container-fluid mb-4'>
      {
        !!selected &&
        <UserProfile
          user={selected}
          style={{ width: 250 }}
          onClose={handleDrawerClosed}
        />
      }
      <SearchBox onChange={setSearch} />
      <div className='row'>
        <div className='col-12'>
          <Paper className='px-2 py-3'>
            <div className='d-flex justify-content-between flex-wrap'>
              {getChips()}
            </div>
          </Paper>
        </div>
      </div>
    </div>
}

MembersDirectory.propTypes = {
  currentUser: PropTypes.object,
  updateUserData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

const mapDispatchToProps = {
  updateUserData: updateUserDataAction
}

const mapStateToProps = ({ currentUser: { currentUser, userData } }) => {
  return {
    currentUser,
    userData
  }
}

export default LoggedInState({
  name: 'membersDirectory',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps, mapDispatchToProps)(withRouter(MembersDirectory)))
