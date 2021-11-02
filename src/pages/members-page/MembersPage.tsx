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
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { compose, findWhere, isString, sortBy } from 'underscore'
import { MEMBERS, ROOT } from '../../urls'
import SearchBox from '../../components/SearchBox'
import { Map as IMap } from 'immutable'
import { getAvatar, IRedisState, IUser } from '../../entities/User'
import { User } from 'firebase/auth'
import { FunctionsError, httpsCallable } from 'firebase/functions'

interface Props extends RouteComponentProps {
  firebaseUser: User
  userData: any
}

function MembersPage({
                       firebaseUser,
                       location: { pathname },
                       history,
                       userData
                     }: Props) {
  const userDataJS: IUser = userData.toJS()
  const useStyles = makeStyles(() => ({
    chipAvatar: {
      width: 32,
      height: 32
    }
  }))
  const classes = useStyles()

  const [isLoading, setIsLoading] = useState(true)
  const [showError, setShowError] = useState(false)
  const [users, setUsers] = useState<IUser[]>([])

  useEffect(() => {
    if (!firebaseUser) {
      return
    }
    ;(async function() {
      try {
        // return setUsers(require('./members.json'))
        const getMembers = httpsCallable(functions, 'getMembers')
        const resp : {data: IUser[]} = await getMembers() as {data: IUser[]}
        const data: IUser[] = sortBy(resp.data, (user: IUser) => {
          if (!user.displayName) {
            return
          }
          return user.uid === firebaseUser.uid
              ? '_'
              : user.displayName.toLowerCase()
        })
        setUsers(data)
      } catch (err) {
        console.warn('error from getMembers:', err)
        if (err) {
          const funcErr = err as FunctionsError
          if (funcErr.message) {
            const error = JSON.parse(funcErr.message)
            if (error.status === 403) {
              history.push(ROOT)
              return
            }
          }
        }
        Sentry.captureException(err)
        setShowError(true)
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser])

  const [selected, setSelected] = useState<IUser>()
  useEffect(() => {
    if (users.length === 0 || !isString(pathname)) {
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

  const handleChipSelected = (user: IUser) => {
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

    return filteredUsers.map((user) => {
      const label = user.displayName

      function getColor() {
        if (user.uid === firebaseUser.uid) {
          return 'primary'
        }
        return 'default'
      }

      if (user.uid === firebaseUser.uid) {
        user.photoURL = userDataJS.photoURL
      }

      const avatarUrl = getAvatar(user)
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

  if (!firebaseUser) {
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
                // @ts-ignore
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
  firebaseUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { firebaseUser, userData } }: IRedisState) => {
  return {
    firebaseUser,
    userData: userData ||
        // @ts-ignore
        new IMap()
  }
}

export default compose(
    withRouter,
    LoggedInState(),
    connect(mapStateToProps)
)(MembersPage)
