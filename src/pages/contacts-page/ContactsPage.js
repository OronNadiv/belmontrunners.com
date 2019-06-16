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
import { DISPLAY_NAME, EMAIL, MEMBERSHIP_EXPIRES_AT, UID } from '../../fields'
import moment from 'moment'
import { fromJS, List as IList } from 'immutable'
import { ROOT } from '../../urls'
import { Redirect } from 'react-router-dom'
import * as Sentry from '@sentry/browser'
import CloseIcon from '@material-ui/icons/Close'
import Checkbox from '@material-ui/core/Checkbox'

const ARRAY_KEY = 'values'
const IS_ACTIVE = 'isActive'
const IS_MEMBER = 'isMember'

const SHOW_MEMBERS = 'showMembers'
const SHOW_USERS = 'showUsers'
const SHOW_SUBSCRIBERS = 'showSubscribers'

class ContactsPage extends Component {
  constructor (props) {
    super(props)
    this.docRef = firebase.firestore().doc('subscribers/items')

    this.state = {
      search: '',
      [SHOW_MEMBERS]: true,
      [SHOW_USERS]: true,
      [SHOW_SUBSCRIBERS]: true,
      active: new IList(),
      inactive: new IList(),
      filteredActive: new IList(),
      filteredInactive: new IList()
    }
  }

  copyToClipboard () {
    const { filteredActive } = this.state
    const items = filteredActive.map(item => {
      const displayName = item.get(DISPLAY_NAME)
      const email = item.get(EMAIL)
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

      // load all users
      const users = []
      usersCollection.forEach(userDoc => {
        const user = userDoc.data()
        user[UID] = userDoc.id
        users.push(user)
      })

      /*
      Update contacts information from users by UID.
      Handles case where a user changed a displayName or email
       */
      users.forEach((user) => {
        const foundContact = contacts.find((contact) => {
          return contact[UID] === user[UID]
        })
        if (foundContact) {
          foundContact[DISPLAY_NAME] = user[DISPLAY_NAME] || ''
          foundContact[EMAIL] = user[EMAIL]
          foundContact[MEMBERSHIP_EXPIRES_AT] = user[MEMBERSHIP_EXPIRES_AT] || ''
        }
      })

      /*
      Update contacts information from users by EMAIL.
      This handles cases where a user was created with an email of an existing subscriber.
      Now we "promote" this subscriber to be a user.
       */
      contacts.forEach((contact) => {
        const foundUser = users.find((user) => {
          return normalizeEmail(contact[EMAIL]) === normalizeEmail(user[EMAIL])
        })
        if (foundUser) {
          contact[UID] = foundUser[UID]
          contact[DISPLAY_NAME] = foundUser[DISPLAY_NAME] || ''
          contact[MEMBERSHIP_EXPIRES_AT] = foundUser[MEMBERSHIP_EXPIRES_AT] || ''
        }
      })

      /*
      Add new users to the contacts list
       */
      users.forEach((user) => {
        const foundContact = _.findWhere(contacts, { [UID]: user[UID] })
        if (foundContact) {
          return
        }
        const contact = {
          [UID]: user[UID],
          [DISPLAY_NAME]: user[DISPLAY_NAME] || '',
          [EMAIL]: user[EMAIL],
          [MEMBERSHIP_EXPIRES_AT]: user[MEMBERSHIP_EXPIRES_AT] || '',
          [IS_ACTIVE]: true
        }
        contacts.push(contact)
      })

      // set isMember
      contacts.forEach((contact) => {
        const membershipExpiresAt = contact[MEMBERSHIP_EXPIRES_AT]
        const isMember = membershipExpiresAt && moment(membershipExpiresAt).isAfter(moment())
        contact[IS_MEMBER] = !!isMember
      })

      const active = fromJS(contacts.filter((item) => item[IS_ACTIVE]))
      const inactive = fromJS(contacts.filter((item) => !item[IS_ACTIVE]))

      this.setState({ active, inactive })
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
    }
  }

  async componentDidUpdate (prevProps, prevState, snapshot) {
    if (!prevState.active.equals(this.state.active) ||
      !prevState.inactive.equals(this.state.inactive)) {
      await this.saveChanges()
      // apply filter if active or inactive has changed.
      this.applyFilter()
    } else if (prevState.search !== this.state.search ||
      prevState[SHOW_MEMBERS] !== this.state[SHOW_MEMBERS] ||
      prevState[SHOW_USERS] !== this.state[SHOW_USERS] ||
      prevState[SHOW_SUBSCRIBERS] !== this.state[SHOW_SUBSCRIBERS]) {
      // apply filter if filter criteria have changed.
      this.applyFilter()
    }

    if (!prevState.filteredActive.equals(this.state.filteredActive)) {
      this.copyToClipboard()
    }
  }

  async saveChanges () {
    console.log('saveChanges  called')
    const { active, inactive } = this.state

    console.log('active size:', active.size)
    console.log('inactive size:', inactive.size)

    const contacts = active.concat(inactive).toJS()
    try {
      await this.docRef.set({ [ARRAY_KEY]: contacts })
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
      const newItem = item.set(IS_ACTIVE, !item.get(IS_ACTIVE))

      to = to.unshift(newItem)
      return { from, to }
    }

    if (item.get(IS_ACTIVE)) {
      const { from, to } = moveItem({ from: this.state.active, to: this.state.inactive })
      this.setState({ active: from, inactive: to })
    } else {
      const { from, to } = moveItem({ from: this.state.inactive, to: this.state.active })
      this.setState({ inactive: from, active: to })
    }
  }

  applyFilter () {
    const { active, inactive, search } = this.state
    const showMembers = this.state[SHOW_MEMBERS]
    const showUsers = this.state[SHOW_USERS]
    const showSubscribers = this.state[SHOW_SUBSCRIBERS]

    const applyFilterInner = (contacts) => {
      contacts = contacts.toJS()
      if (search) {
        const searcher = new FuzzySearch(contacts, [DISPLAY_NAME, EMAIL], {
          caseSensitive: false
        })
        contacts = searcher.search(search)
      }
      contacts = contacts.filter(contact => {
        return (showMembers && contact[IS_MEMBER]) ||
          (showUsers && ((showMembers && contact[UID]) || (contact[UID] && !contact[IS_MEMBER]))) ||
          (showSubscribers && !contact[UID])
      })
      return fromJS(contacts)
    }
    this.setState({
      filteredActive: applyFilterInner(active),
      filteredInactive: applyFilterInner(inactive)
    })

  }

  getChips (contacts, isActive) {
    const { allowWrite } = this.props
    return contacts.toJS().map(
      (contact) => {
        let label
        if (contact[DISPLAY_NAME]) {
          label = `${contact[DISPLAY_NAME] || ''} (${contact[EMAIL]})`
        } else {
          label = contact[EMAIL]
        }

        function getColor () {
          if (contact[IS_MEMBER]) {
            return 'primary'
          }
          if (contact[UID]) {
            return 'secondary'
          }
          return 'default'
        }

        return <Chip
          className='my-1 mx-1'
          key={contact[UID] || normalizeEmail(contact[EMAIL])}
          label={label}
          color={getColor()}
          onDelete={allowWrite ? () => this.handleMoveChip(fromJS(contact)) : undefined}
          deleteIcon={!isActive ? <AddIcon /> : undefined}
        />
      }
    )
  }

  handleAdd (email) {
    let { active, inactive } = this.state
    const { currentUser } = this.props
    let indexActive = active.findIndex((curr) => {
      return normalizeEmail(curr.get('email')) === normalizeEmail(email)
    })

    if (indexActive > -1) {
      // add to the top.
      const item = active.get(indexActive)
      active = active.remove(indexActive)
      active = active.unshift(item)
    } else {
      const indexInactive = inactive.findIndex((curr) => {
        return normalizeEmail(curr.get('email')) === normalizeEmail(email)
      })
      if (indexInactive > -1) {
        let item = inactive.get(indexInactive)
        item = item.set(IS_ACTIVE, true)
        inactive = inactive.remove(indexInactive)
        active = active.unshift(item)
      } else {
        active = active.unshift(fromJS({
          [EMAIL]: email,
          [IS_ACTIVE]: true,
          addedBy: currentUser[UID],
          addedAt: moment().utc().format()
        }))
      }
    }
    this.setState({ active, inactive, showAddDialog: false })
  }

  render () {
    console.log('render()  called')

    const { currentUser, allowRead, allowWrite } = this.props
    const { filteredActive, filteredInactive, showAddDialog, copied } = this.state

    if (currentUser && !allowRead) {
      return <Redirect to={ROOT} />
    }

    return (
      <div className='container-fluid mb-4'>
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
        <div className='row mb-3'>
          <div className='d-flex flex-row mx-auto'>
            <div className='d-flex flex-row align-items-center'
                 onClick={() => this.setState({ [SHOW_MEMBERS]: !this.state[SHOW_MEMBERS] })}
            >
              <Checkbox
                checked={this.state[SHOW_MEMBERS]}

              />
              <Chip
                label='Members'
                color='primary'
              />
            </div>
            <div className='d-flex flex-row align-items-center mx-4'
                 onClick={() => this.setState({ [SHOW_USERS]: !this.state[SHOW_USERS] })}
            >
              <Checkbox
                checked={this.state[SHOW_USERS]}
              />
              <Chip
                label='Users'
                color='secondary'
              />
            </div>
            <div className='d-flex flex-row align-items-center'
                 onClick={() => this.setState({ [SHOW_SUBSCRIBERS]: !this.state[SHOW_SUBSCRIBERS] })}
            >
              <Checkbox
                checked={this.state[SHOW_SUBSCRIBERS]}
              />
              <Chip
                label='Subscribers'
                color='default'
              />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-6'>
            <Paper className='px-2 py-3'>
              <Typography variant="h5" component="h3" className='ml-3'>
                Active ({filteredActive.size})
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
              {this.getChips(filteredActive, true)}
            </Paper>
          </div>
          <div className='col-6'>
            <Paper className='px-2 py-3'>
              <Typography variant="h5" component="h3" className='ml-3'>
                Inactive ({filteredInactive.size})
              </Typography>
              {this.getChips(filteredInactive, false)}
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
    allowRead: !!currentUser && !!permissions.contactsRead[currentUser[UID]],
    allowWrite: !!currentUser && !!permissions.contactsWrite[currentUser[UID]],
    currentUser
  }
}

export default LoggedInState({
  name: 'ContactsPage',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps)(ContactsPage))
