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
import Snackbar from '@material-ui/core/Snackbar'
import { UID } from '../../fields'
import moment from 'moment'
import { fromJS, List as IList } from 'immutable'
import { ROOT } from '../../urls'
import { Redirect } from 'react-router-dom'
import * as Sentry from '@sentry/browser'
import CloseIcon from '@material-ui/icons/Close'

const ARRAY_KEY = 'values'

class ContactsPage extends Component {
  constructor (props) {
    super(props)
    this.docRef = firebase.firestore().doc('subscribers/items')

    this.state = {
      search: '',
      active: new IList(),
      inactive: new IList()
    }
  }

  copyToClipboard () {
    const items = this.state.active.map(item => {
      const displayName = item.get('displayName')
      const email = item.get('email')
      if (displayName) {
        return `${displayName} <${email}>`
      } else {
        return email
      }
    })
    const copyToClipboard = items.join('; ')
    this.setState({ copyToClipboard })
  }

  async componentDidMount () {
    console.log('ContactsPage.componentDidMount called')

    try {
      const { usersCollection, contactsDoc } = await Promise
        .props({
          usersCollection: firebase.firestore().collection('users').get(),
          contactsDoc: this.docRef.get()
        })
      let data = contactsDoc.data()

      if (!data || !data[ARRAY_KEY]) {
        data = { [ARRAY_KEY]: [] }
      }
      const contacts = data[ARRAY_KEY]

      const users = []
      usersCollection.forEach(user => {
        const data = user.data()
        data.uid = user.id
        users.push(data)
      })
      console.log('user:', users)
      users.forEach((user) => {
        const foundContact = contacts.find((contact) => {
          return contact.uid === user.uid
        })
        if (foundContact) {
          foundContact.displayName = user.displayName
          foundContact.email = user.email
        }
      })

      // set user values for existing contacts
      console.log('contacts:', contacts)
      contacts.forEach((contact) => {
        const foundUser = users.find((user) => {
          return normalizeEmail(contact.email) === normalizeEmail(user.email)
        })
        if (foundUser) {
          contact.displayName = foundUser.displayName
          contact.email = foundUser.email
          contact.uid = foundUser.uid
        }
      })

      users.forEach((user) => {
        const foundContact = _.findWhere(contacts, { uid: user.uid })
        if (foundContact) {
          return
        }
        let newContact = _.pick(user, 'uid', 'displayName', 'email')
        newContact.isActive = true
        contacts.push(newContact)
      })

      const active = fromJS(contacts.filter((item) => item.isActive))
      const inactive = fromJS(contacts.filter((item) => !item.isActive))

      this.setState({ active, inactive })
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
    }
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (!prevState.active.equals(this.state.active) || !prevState.inactive.equals(this.state.inactive)) {
      this.saveChanges()
    }
    if (!prevState.active.equals(this.state.active)) {
      this.copyToClipboard()
    }
  }

  async saveChanges () {
    const { active, inactive } = this.state

    console.log('active size:', active.size)
    console.log('inactive size:', inactive.size)

    const values = active.concat(inactive).toJS()
    try {
      await this.docRef.set({ [ARRAY_KEY]: values })
      console.log('saved')
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
    }
  }


  handleMoveChip (item) {
    const moveItem = ({ from, to }) => {
      const index = from.findIndex((curr) => curr.equals(item))
      from = from.remove(index)
      const newItem = item.set('isActive', !item.get('isActive'))

      to = to.unshift(newItem)
      return { from, to }
    }

    if (item.get('isActive')) {
      const { from, to } = moveItem({ from: this.state.active, to: this.state.inactive })
      this.setState({ active: from, inactive: to })
    } else {
      const { from, to } = moveItem({ from: this.state.inactive, to: this.state.active })
      this.setState({ inactive: from, active: to })
    }
  }

  getChips (array, isActive) {
    const { allowWrite } = this.props
    const { search } = this.state
    array = array.toJS()
    if (search) {
      const searcher = new FuzzySearch(array, ['displayName', 'email'], {
        caseSensitive: false
      })
      array = searcher.search(search)
    }

    const res = array.map(
      (item, index) => {
        let label
        if (item.displayName) {
          label = `${item.displayName || ''} (${item.email})`
        } else {
          label = item.email
        }
        return <Chip
          className='my-1 mx-1'
          key={index}
          label={label}
          color={isActive ? 'primary' : 'default'}
          onDelete={allowWrite ? () => this.handleMoveChip(fromJS(item)) : undefined}
          deleteIcon={!isActive ? <AddIcon /> : undefined}
        />
      }
    )
    return res
  }

  handleAdd (email) {
    let { active, inactive } = this.state
    const { currentUser } = this.props
    let index = active.findIndex((curr) => {
      return normalizeEmail(curr.get('email')) === normalizeEmail(email)
    })

    if (index > -1) {
      const item = active.get(index)
      active = active.remove(index)
      active = active.unshift(item)
    } else {
      index = inactive.findIndex((curr) => {
        return normalizeEmail(curr.get('email')) === normalizeEmail(email)
      })
      if (index > -1) {
        const item = inactive.get(index)
        inactive = inactive.remove(index)
        active = active.unshift(item)
      } else {
        active = active.unshift(fromJS({
          email,
          isActive: true,
          addedBy: currentUser[UID],
          addedAt: moment().utc().format()
        }))
      }
    }
    this.setState({ active, inactive, showAddDialog: false })
  }

  render () {
    const { currentUser, allowRead, allowWrite } = this.props
    const { active, inactive, showAddDialog, copied } = this.state

    if (currentUser && !allowRead) {
      return <Redirect to={ROOT} />
    }

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
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          open={copied}
          autoHideDuration={6000}
          onClose={() => this.setState({ copied: false })}
          message={<span id="message-id">Copied to clipboard</span>}
          action={[
            <IconButton key="close" aria-label="Close" color="inherit" onClick={() => this.setState({ copied: false })}>
              <CloseIcon />
            </IconButton>
          ]}
        />

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
            {allowWrite && <Divider style={{ width: 1, height: 28, margin: 4 }} />}
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
        <div className='row'>
          <div className='col-6'>
            <Paper className='px-2 py-3'>
              <Typography variant="h5" component="h3" className='ml-3'>
                Active ({active.size})
                <CopyToClipboard
                  text={this.state.copyToClipboard}
                  onCopy={() => {
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
              <Typography variant="h5" component="h3" className='ml-3'>
                Inactive ({inactive.size})
              </Typography>
              {this.getChips(inactive, false)}
            </Paper>
          </div>
        </div>
      </div>
    )
  }
}

ContactsPage.propTypes = {
  allowRead: PropTypes.bool.isRequired,
  allowWrite: PropTypes.bool.isRequired,
  currentUser: PropTypes.object
}

const mapStateToProps = ({ currentUser: { permissions, currentUser } }) => {
  return {
    allowRead: !!currentUser && !!permissions.contactsRead[currentUser.uid],
    allowWrite: !!currentUser && !!permissions.contactsWrite[currentUser.uid],
    currentUser
  }
}

export default LoggedInState({
  name: 'ContactsPage',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps)(ContactsPage))
