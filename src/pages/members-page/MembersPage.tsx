import { functions } from '../../firebase'
import React, { useEffect, useState } from 'react'
import { DISPLAY_NAME, UID } from '../../fields'
import * as PropTypes from 'prop-types'
import * as Sentry from '@sentry/browser'
import { connect } from 'react-redux'
import {
  Avatar,
  Chip,
  CircularProgress,
  makeStyles,
  Paper,
  Snackbar
} from '@material-ui/core'
import DirectionsRun from '@material-ui/icons/DirectionsRun'
import FuzzySearch from 'fuzzy-search'
import LoggedInState from '../../components/HOC/LoggedInState'
import UserProfile from './UserProfile'
import { withRouter } from 'react-router-dom'
import { compose, findWhere, sortBy } from 'underscore'
import { MEMBERS, ROOT } from '../../urls'
import SearchBox from '../../components/SearchBox'
import { Map as IMap } from 'immutable'
import { CurrentUserStore, UserOptionalProps } from '../../entities/User'

interface Props {
  currentUser: firebase.User
  location: { pathname: string }
  history: { push: (arg0: string) => void }
  userData: any
}

function MembersPage({
                       currentUser,
                       location: { pathname },
                       history,
                       userData
                     }: Props) {
  const currentUserData: UserOptionalProps = userData.toJS()
  const useStyles = makeStyles(() => ({
    chipAvatar: {
      width: 32,
      height: 32
    }
  }))
  const classes = useStyles()

  const [isLoading, setIsLoading] = useState(true)
  const [showError, setShowError] = useState(false)
  const [users, setUsers] = useState<UserOptionalProps[]>([])

  useEffect(() => {
    if (!currentUser) {
      return
    }
    ;(async function() {
      try {
        // return setUsers(require('./members.json'))
        const resp = await functions.httpsCallable('getMembers')()
        const data: UserOptionalProps[] = sortBy(resp.data, (user: UserOptionalProps) => {
          if (!user.displayName) {
            return
          }
          return user.uid === currentUser.uid
            ? '_'
            : user.displayName.toLowerCase()
        })
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
    const pathnames = pathname.split('/').filter(val => !!val)
    if (pathnames.length < 2) {
      setSelected(undefined)
      return
    }
    const res = findWhere(users, { [UID]: pathnames[1] })
    if (res) {
      setSelected(res)
    } else {
      history.push(MEMBERS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, pathname])

  const [search, setSearch] = useState('')

  const handleChipSelected = (user: UserOptionalProps) => {
    console.log('user:', user)
    history.push(`${MEMBERS}/${user.uid}`)
  }

  const handleDrawerClosed = () => {
    history.push(MEMBERS)
  }

  const getChips = () => {
    let filteredUsers = users || []
    if (search) {
      const searcher = new FuzzySearch(users, [DISPLAY_NAME], {
        caseSensitive: false
      })
      filteredUsers = searcher.search(search)
    }

    return filteredUsers.map((user: UserOptionalProps) => {
      const label = user.displayName

      function getColor() {
        if (user.uid === currentUser.uid) {
          return 'primary'
        }
        return 'default'
      }

      if (user.uid === currentUser.uid) {
        user.photoURL = currentUserData.photoURL
      }

      const avatarUrl = user.photoURL || user.gravatarUrl || undefined
      return (
        <Chip
          className="my-1 mx-1"
          avatar={
            <Avatar className={classes.chipAvatar} src={avatarUrl}>
              {!avatarUrl && <DirectionsRun />}
            </Avatar>
          }
          onClick={() => handleChipSelected(user)}
          key={user.uid}
          label={label}
          color={getColor()}
        />
      )
    })
  }

  if (!currentUser) {
    // todo: show loading
    return <></>
  }
  return (
    <>
      {showError && (
        <Snackbar
          open
          autoHideDuration={6000}
          message={'Oops! Something went wrong.'}
        />
      )}
      {!!selected && (
        <UserProfile
          user={selected}
          style={{ width: 250 }}
          onClose={handleDrawerClosed}
        />
      )}
      <SearchBox onChange={setSearch} />
      <Paper className="px-2 py-3">
        <div className="d-flex justify-content-between flex-wrap">
          {isLoading ? <CircularProgress className="mx-auto" /> : getChips()}
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

const mapStateToProps = ({ currentUser: { currentUser, userData } }: CurrentUserStore) => {
  return {
    currentUser,
    // @ts-ignore
    userData: userData || new IMap()
  }
}

export default compose(
  withRouter,
  LoggedInState(),
  connect(mapStateToProps)
)(MembersPage)
