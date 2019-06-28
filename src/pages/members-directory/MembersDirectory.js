import 'firebase/functions'
import firebase from 'firebase'
import React, { useEffect, useState } from "react"
import { DISPLAY_NAME, PHOTO_URL, UID } from '../../fields'
import Chip from '@material-ui/core/Chip'
import * as PropTypes from 'prop-types'
import { updateUserData as updateUserDataAction } from '../../reducers/currentUser'
import { connect } from 'react-redux'
import SearchIcon from '@material-ui/icons/Search'
import IconButton from '@material-ui/core/IconButton'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import DirectionsRun from '@material-ui/icons/DirectionsRun'
import Avatar from '@material-ui/core/Avatar'
import FuzzySearch from 'fuzzy-search'
import LoggedInState from '../../components/LoggedInState'
import UserProfile from './UserProfile'
import { makeStyles } from '@material-ui/core'

const useStyles = makeStyles({
  avatar: {
    width: 32,
    height: 32
  }
})


function MembersDirectory ({ currentUser }) {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!currentUser) {
      return
    }
    (async function () {
      const resp = await firebase.functions().httpsCallable('getMembers')()
      setUsers(resp.data)
    })()
  }, [currentUser])

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
              <Avatar className={useStyles.avatar} src={user[PHOTO_URL]} /> :
              <Avatar className={useStyles.avatar}><DirectionsRun /></Avatar>
          }
          onClick={() => setSelected(user)}
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
          onClose={() => {
            setSelected()
          }}
        />
      }
      <div className='d-flex justify-content-center row'>
        <Paper style={{
          margin: '20px 0',
          padding: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          width: 400
        }}>
          <InputBase
            style={{
              marginLeft: 8,
              flex: 1
            }}
            placeholder='Fuzzy Search'
            onChange={(event) => {
              setSearch(event.target.value)
            }}
          />
          <IconButton style={{
            padding: 10
          }} aria-label="Search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </div>
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
  userData: PropTypes.object.isRequired
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
})(connect(mapStateToProps, mapDispatchToProps)(MembersDirectory))
