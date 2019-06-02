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
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/LoggedInState'
import { connect } from 'react-redux'
import Typography from '@material-ui/core/Typography'

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

  componentDidMount () {
    console.log('SubscribersPage.componentDidMount called')
    this.docRef.get().then(doc => {
      let data = doc.data()

      if (!data || !data[ARRAY_KEY]) {
        data = { [ARRAY_KEY]: [] }
      }
      console.log('data:', data)
      const active = data[ARRAY_KEY].filter((item) => item.isActive)
      const inactive = data[ARRAY_KEY].filter((item) => !item.isActive)
      this.setState({ active, inactive })
    })
  }

  extracted ({ from, to }, item) {
    from = from.filter((curr) => {
      return curr !== item
    })
    to.unshift(item)
    return { from, to }
  }

  saveChanges () {
    const values = this.state.active.concat(this.state.inactive)
    console.log('values:', values)
    this.docRef
      .set({ [ARRAY_KEY]: values })
      .then(() => {
        console.log('saved')
      })
  }

  handleMoveChip (item) {
    const { isActive } = item
    if (isActive) {
      const { from, to } = this.extracted({ from: this.state.active, to: this.state.inactive }, item)
      item.isActive = !isActive
      this.setState({ active: from, inactive: to })
    } else {
      const { from, to } = this.extracted({ from: this.state.inactive, to: this.state.active }, item)
      console.log('inactive:', from, 'active:', to)
      item.isActive = !isActive
      this.setState({ inactive: from, active: to })
    }
    this.saveChanges()
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
        console.log('active', item, index)
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

  findAndRemove (email, array) {
    let item
    const existingIndex = array.findIndex((curr) => {
      return curr.email.trim().toLowerCase() === email.trim().toLowerCase()
    })
    if (existingIndex > -1) {
      item = array.splice(existingIndex, 1)[0]
    }
    return item
  }

  render () {
    const { allowWrite } = this.props
    const { active, inactive, showAddDialog } = this.state
    console.log('active:', active, 'inactive:', inactive)
    return (
      <div className='container-fluid'>
        {
          showAddDialog &&
          <AddDialog
            onCancel={() => this.setState({ showAddDialog: false })}
            onAdd={(email) => {
              let item = { email, isActive: true, key: email }
              let foundItem = this.findAndRemove(email, this.state.active) || this.findAndRemove(email, this.state.inactive)
              console.log('foundItem:', foundItem, 'item:', item)
              active.unshift(foundItem || item)
              this.setState({ active, showAddDialog: false })
              this.saveChanges()
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
                Active
              </Typography>
              {this.getChips(active, true)}
            </Paper>
          </div>
          <div className='col-6'>
            <Paper className='px-2 py-3'>
              <Typography variant="h5" component="h3">
                Inactive
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
