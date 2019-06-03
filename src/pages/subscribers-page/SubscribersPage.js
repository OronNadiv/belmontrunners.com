import React, { Component } from 'react'
import firebase from 'firebase'
import Chip from '@material-ui/core/Chip'
import FuzzySearch from 'fuzzy-search'
import AddDialog from './AddDialog'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import AddIcon from '@material-ui/icons/AddCircle'
import CopyIcon from '@material-ui/icons/FileCopy'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/LoggedInState'
import { connect } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import Promise from 'bluebird'
import normalizeEmail from 'normalize-email'
import _ from 'underscore'
import { CopyToClipboard } from 'react-copy-to-clipboard'

const ARRAY_KEY = 'values'

class SubscribersPage extends Component {
  constructor (props) {
    super(props)
    this.docRef = firebase.firestore().doc('subscribers/items')

    this.state = {
      search: '',
      active: [],
      inactive: []
    }
  }

  copyToClipboard (active) {
    const items = _.map(active, ({ displayName, email }) => {
      if (displayName) {
        return `${displayName} <${email}>`
      } else {
        return email
      }
    })
    const copyToClipboard = items.join('; ')
    this.setState({ copyToClipboard })
  }

  componentDidMount () {
    console.log('SubscribersPage.componentDidMount called')

    Promise
      .props({
        usersCollection: firebase.firestore().collection('users').get(),
        subscriptionsDoc: this.docRef.get()
      })
      .then(({ usersCollection, subscriptionsDoc }) => {
        let data = subscriptionsDoc.data()

        if (!data || !data[ARRAY_KEY]) {
          data = { [ARRAY_KEY]: [] }
        }
        const subs = data[ARRAY_KEY]

        const users = []
        usersCollection.forEach(user => {
          const data = user.data()
          data.uid = user.id
          users.push(data)
        })
        console.log('user:', users)
        users.forEach((user) => {
          const foundSub = subs.find((sub) => {
            return sub.uid === user.uid
          })
          if (foundSub) {
            foundSub.displayName = user.displayName
            foundSub.email = user.email
          }
        })

        // set user values for existing subs
        console.log('subs:', subs)
        subs.forEach((sub) => {
          const foundUser = users.find((user) => {
            return normalizeEmail(sub.email) === normalizeEmail(user.email)
          })
          if (foundUser) {
            sub.displayName = foundUser.displayName
            sub.email = foundUser.email
            sub.uid = foundUser.uid
          }
        })

        users.forEach((user) => {
          const foundSub = _.findWhere(subs, { uid: user.uid })
          if (foundSub) {
            return
          }
          console.log('foundSub:', foundSub)
          let newSub = _.pick(user, 'uid', 'displayName', 'email')
          console.log('newSub:', newSub)
          newSub.isActive = true
          subs.push(newSub)
        })

        const active = subs.filter((item) => item.isActive)
        const inactive = subs.filter((item) => !item.isActive)


        this.setState({ active, inactive })
        this.copyToClipboard(active)
      })
      .catch(console.error)
  }


  saveChanges (active, inactive) {
    console.log('active size:', active.length)
    console.log('inactive size:', inactive.length)

    const values = active.concat(inactive)
    this.docRef
      .set({ [ARRAY_KEY]: values })
      .then(() => {
        console.log('saved')
      })
    this.copyToClipboard(active)
  }


  handleMoveChip (item) {
    const moveItem = ({ from, to }) => {
      from = _.without(from, item)
      to.unshift(item)
      return { from, to }
    }

    if (item.isActive) {
      const { from, to } = moveItem({ from: this.state.active, to: this.state.inactive })
      item.isActive = !item.isActive
      this.saveChanges(from, to)
      this.setState({ active: from, inactive: to })
    } else {
      const { from, to } = moveItem({ from: this.state.inactive, to: this.state.active })
      item.isActive = !item.isActive
      this.saveChanges(to, from)
      this.setState({ inactive: from, active: to })
    }
  }

  getChips (array, isActive) {
    const { search } = this.state
    if (search) {
      const searcher = new FuzzySearch(array, ['displayName', 'email'], {
        caseSensitive: false
      })
      array = searcher.search(search)
    }

    const res = array.map(
      (item, index) => {
        const label = `${item.displayName || ''} ${item.email}`.trim()
        return <Chip
          className='my-1 mx-1'
          key={index}
          label={label}
          color={isActive ? 'primary' : 'default'}
          onDelete={() => this.handleMoveChip(item)}
          deleteIcon={!isActive ? <AddIcon /> : undefined}
        />
      }
    )
    return res
  }

  handleAdd (email) {
    let { active, inactive } = this.state
    let index = active.findIndex((curr) => {
      return normalizeEmail(curr.email) === normalizeEmail(email)
    })

    if (index > -1) {
      const item = active[index]
      active.splice(index, 1)
      active.unshift(item)
    } else {
      index = inactive.findIndex((curr) => {
        return normalizeEmail(curr.email) === normalizeEmail(email)
      })
      if (index > -1) {
        const item = inactive[index]
        inactive.splice(index, 1)
        active.unshift(item)
      } else {
        active.unshift({ email, isActive: true })
      }
    }
    this.setState({ active, inactive, showAddDialog: false })
    this.saveChanges(active, inactive)
  }

  render () {
    const { allowWrite } = this.props
    const { active, inactive, showAddDialog } = this.state
    return (
      <div className='container-fluid'>
        {
          showAddDialog &&
          <AddDialog
            onCancel={() => this.setState({ showAddDialog: false })}
            onAdd={(email) => {
              this.handleAdd(email)
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
              placeholder="Search"
              onChange={(event) => {
                this.setState({
                  search: event.target.value
                })
              }}
            />
            <IconButton style={{
              padding: 10
            }} aria-label="Search">
              <SearchIcon />
            </IconButton>
            <Divider style={{ width: 1, height: 28, margin: 4 }} />
            {
              allowWrite && <IconButton
                color="primary"
                style={{ padding: 10 }}
                aria-label="Directions"
                onClick={() => {
                  this.setState({ showAddDialog: true })
                }}
              >
                <AddIcon />
              </IconButton>
            }
          </Paper>
        </div>
        <div className='row my-4 mx-2'>
          <div className='col-6'>
            <Paper className='px-2 py-3'>
              <Typography variant="h5" component="h3">
                Active ({active.length})
                <CopyToClipboard
                  text={this.state.copyToClipboard}
                  onCopy={() => {
                    console.log('this.state.copyToClipboard:', this.state.copyToClipboard)
                    this.setState({ copied: true })
                  }}>
                  <IconButton>
                    <CopyIcon />
                  </IconButton>
                </CopyToClipboard>
              </Typography>
              {this.getChips(active, true)}
            </Paper>
          </div>
          <div className='col-6'>
            <Paper className='px-2 py-3'>
              <Typography variant="h5" component="h3">
                Inactive ({inactive.length})
              </Typography>
              {this.getChips(inactive, false)}
            </Paper>
          </div>
        </div>
      </div>
    )
  }
}

SubscribersPage.propTypes = {
  allowWrite: PropTypes.bool.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, currentUser } }) => {
  return {
    allowWrite: !!currentUser && !!permissions.subscribersWrite[currentUser.uid]
  }
}

export default LoggedInState({
  name: 'SubscribersPage',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps)(SubscribersPage))
