import 'firebase/functions'
import firebase from 'firebase'
import React, { useEffect, useState } from "react"
import { DISPLAY_NAME, PHOTO_URL, UID } from '../../fields'
import Chip from '@material-ui/core/Chip'
import * as PropTypes from 'prop-types'
import * as Sentry from '@sentry/browser'
import { connect } from 'react-redux'
import Paper from '@material-ui/core/Paper'
import DirectionsRun from '@material-ui/icons/DirectionsRun'
import Avatar from '@material-ui/core/Avatar'
import FuzzySearch from 'fuzzy-search'
import LoggedInState from '../../components/HOC/LoggedInState'
import UserProfile from './UserProfile'
import { makeStyles } from '@material-ui/core'
import { withRouter } from 'react-router-dom'
import { compose, findWhere, sortBy } from 'underscore'
import { MEMBERS, ROOT } from '../../urls'
import SearchBox from '../../components/SearchBox'
import Snackbar from '@material-ui/core/Snackbar'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Map as IMap } from 'immutable'

function MembersPage ({ currentUser, location: { pathname }, history, userData }) {
  const useStyles = makeStyles(() => ({
    chipAvatar: {
      width: 32,
      height: 32
    }
  }))
  const classes = useStyles()

  const [isLoading, setIsLoading] = useState(true)
  const [showError, setShowError] = useState(false)
  const [users, setUsers] = useState([])
  useEffect(() => {
    if (!currentUser) {
      return
    }
    (async function () {
      try {
        // return setUsers(require('./members.json'))
        const resp = await firebase.functions().httpsCallable('getMembers')()
        const data = sortBy(
          resp.data,
          (user) => user[UID] === currentUser[UID] ? '_' : user[DISPLAY_NAME].toLowerCase()
        )
        setUsers(data)
      } catch (err) {
        console.warn('error from getMembers:', err)
        if (err && err.message) {
          const error = JSON.parse(err.message)
          if (error.status === 403) {
            history.push(ROOT)
            return
          }
        }
        Sentry.captureException(err)
        setShowError(true)
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const selected = findWhere(users, { [UID]: pathnames[1] })
    if (selected) {
      setSelected(selected)
    } else {
      history.push(MEMBERS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, pathname])

  const [search, setSearch] = useState('')

  const handleChipSelected = (user) => {
    console.log('user:', user)
    history.push(`${MEMBERS}/${user[UID]}`)
  }

  const handleDrawerClosed = () => {
    history.push(MEMBERS)
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
          if (user[UID] === currentUser[UID]) {
            return 'primary'
          }
          return 'default'
        }

        if (user[UID] === currentUser[UID]) {
          user[PHOTO_URL] = userData.get(PHOTO_URL)
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

  if (!currentUser) {
    // todo: show loading
    return <></>
  }
  return (
    <>
      {
        showError &&
        <Snackbar
          open
          autoHideDuration={6000}
          message={'Oops! Something went wrong.'}
        />
      }
      {
        !!selected &&
        <UserProfile
          user={selected}
          style={{ width: 250 }}
          onClose={handleDrawerClosed}
        />
      }
      <SearchBox onChange={setSearch} />
      <Paper className='px-2 py-3'>
        <div className='d-flex justify-content-between flex-wrap'>
          {
            isLoading ?
              <CircularProgress className='mx-auto' /> :
              getChips()
          }
        </div>
      </Paper>
    </>
  )
}

MembersPage.propTypes = {
  currentUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { currentUser, userData } }) => {
  return {
    currentUser,
    userData: userData || new IMap()
  }
}

export default compose(
  withRouter,
  LoggedInState(),
  connect(mapStateToProps)
)(MembersPage)
