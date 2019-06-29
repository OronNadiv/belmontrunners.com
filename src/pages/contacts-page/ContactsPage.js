import React, { Component } from 'react'
import firebase from 'firebase'
import Chip from '@material-ui/core/Chip'
import FuzzySearch from 'fuzzy-search'
import AddDialog from './AddDialog'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/AddCircle'
import CopyIcon from '@material-ui/icons/FileCopy'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/LoggedInState'
import { connect } from 'react-redux'
import Typography from '@material-ui/core/Typography'
import normalizeEmail from 'normalize-email'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Snackbar from '@material-ui/core/Snackbar'
import { DISPLAY_NAME, EMAIL, SUBSCRIBER_IS_ACTIVE, SUBSCRIBERS_ARRAY_KEY, UID } from '../../fields'
import moment from 'moment'
import { fromJS, List as IList } from 'immutable'
import { ROOT } from '../../urls'
import { Redirect } from 'react-router-dom'
import * as Sentry from '@sentry/browser'
import CloseIcon from '@material-ui/icons/Close'
import Checkbox from '@material-ui/core/Checkbox'
import { ExportToCsv } from 'export-to-csv'
import { parseFullName } from 'parse-full-name'
import SaveIcon from '@material-ui/icons/SaveAlt'
import SearchBox from '../../components/SearchBox'

const IS_MEMBER = 'isMember'

const SHOW_MEMBERS = 'showMembers'
const SHOW_USERS = 'showUsers'
const SHOW_SUBSCRIBERS = 'showSubscribers'

class ContactsPage extends Component {
  constructor (props) {
    super(props)
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

  exportToCSV () {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useBom: true,
      useKeysAsHeaders: true,
      filename: 'contacts-' + moment().format()
    }

    const csvExporter = new ExportToCsv(options)
    const { filteredActive } = this.state
    const items = filteredActive
      .map(item => {
        const displayName = item.get(DISPLAY_NAME)
        const email = item.get(EMAIL)
        const name = parseFullName(displayName)
        return {
          "Email Address": email,
          "First Name": name.first || '',
          "Last Name": name.last || ''
        }
      })
    csvExporter.generateCsv(items.toJS())
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
      const contactsData = await firebase.firestore().doc('subscribers/items').get()
      const contacts = contactsData.data()[SUBSCRIBERS_ARRAY_KEY]

      const active = fromJS(contacts.filter((item) => item[SUBSCRIBER_IS_ACTIVE]))
      const inactive = fromJS(contacts.filter((item) => !item[SUBSCRIBER_IS_ACTIVE]))

      this.setState({ active, inactive })
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
    }
  }

  async componentDidUpdate (prevProps, prevState, snapshot) {
    if (!prevState.active.equals(this.state.active) ||
      !prevState.inactive.equals(this.state.inactive)) {
      if (this.props.allowWrite) {
        await this.saveChanges()
      }
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
    const { active, inactive } = this.state

    const contacts = active.concat(inactive).toJS()
    try {
      await firebase.firestore().doc('subscribers/items').set({ [SUBSCRIBERS_ARRAY_KEY]: contacts })
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
    }
  }

  handleMoveChip (item) {
    const moveItem = ({ from, to }) => {
      const index = from.findIndex((curr) => curr.equals(item))
      from = from.remove(index)
      const newItem = item.set(SUBSCRIBER_IS_ACTIVE, !item.get(SUBSCRIBER_IS_ACTIVE))

      to = to.unshift(newItem)
      return { from, to }
    }

    if (item.get(SUBSCRIBER_IS_ACTIVE)) {
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
    // const { allowWrite } = this.props
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
          // onDelete={allowWrite ? () => this.handleMoveChip(fromJS(contact)) : undefined}
          // deleteIcon={!isActive ? <AddIcon /> : undefined}
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
        item = item.set(SUBSCRIBER_IS_ACTIVE, true)
        inactive = inactive.remove(indexInactive)
        active = active.unshift(item)
      } else {
        active = active.unshift(fromJS({
          [EMAIL]: email,
          [SUBSCRIBER_IS_ACTIVE]: true,
          addedBy: currentUser[UID],
          addedAt: moment().utc().format()
        }))
      }
    }
    this.setState({ active, inactive, showAddDialog: false })
  }

  render () {
    const { currentUser, allowRead, allowWrite } = this.props
    const { filteredActive, /*filteredInactive,*/ showAddDialog, copied } = this.state

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

        <SearchBox placeholder="Fuzzy Search" onChange={(search) => this.setState({ search })}>
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
        </SearchBox>

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
          <div className='col-12'>
            <Paper className='px-2 py-3'>
              <Typography variant="h5" component="h3" className='ml-3'>
                Contacts ({filteredActive.size})
                <CopyToClipboard
                  text={this.state.copyToClipboard}
                  onCopy={() => {
                    this.setState({ copied: true })
                  }}>
                  <IconButton>
                    <CopyIcon />
                  </IconButton>
                </CopyToClipboard>
                <IconButton onClick={() => this.exportToCSV()}>
                  <SaveIcon />
                </IconButton>

              </Typography>
              <div className='d-flex justify-content-between flex-wrap'>
                {this.getChips(filteredActive, true)}
              </div>
            </Paper>
          </div>
          {
            /*
            <div className='col-6'>
              <Paper className='px-2 py-3'>
                <Typography variant="h5" component="h3" className='ml-3'>
                  Inactive ({filteredInactive.size})
                </Typography>
                {this.getChips(filteredInactive, false)}
              </Paper>
            </div>
            */
          }
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
