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
import FaceIcon from '@material-ui/icons/Face'
import Avatar from '@material-ui/core/Avatar'
import FuzzySearch from 'fuzzy-search'
import LoggedInState from '../../components/LoggedInState'
import UserProfile from './UserProfile'

function MembersDirectory ({ currentUser }) {
  const [items, setItems] = useState([])
  // const [items, setItems] = useState(require('./members.json'))
  const [selected, setSelected] = useState()
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!currentUser) {
      return
    }
    (async function () {
      const resp = await firebase.functions().httpsCallable('getMembers')()
      setItems(resp.data)
    })()
  }, [currentUser])

  const getChips = () => {
    let filteredItems = items
    if (search) {
      const searcher = new FuzzySearch(items, [DISPLAY_NAME], {
        caseSensitive: false
      })
      filteredItems = searcher.search(search)
    }

    return filteredItems.map(
      (item) => {
        let label = item[DISPLAY_NAME]

        function getColor () {
          if (item.uid === currentUser.uid) {
            return 'primary'
          }
          return 'default'
        }

        return <Chip
          className='my-1 mx-1'
          avatar={item[PHOTO_URL] ? <Avatar src={item[PHOTO_URL]} /> : <Avatar><FaceIcon /></Avatar>}
          onClick={() => setSelected(item)}
          key={item[UID]}
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
          item={selected}
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
