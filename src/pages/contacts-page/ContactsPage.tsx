import React, { useCallback, useEffect, useState } from 'react'
import { firestore } from '../../firebase'
import {
  Checkbox,
  Chip,
  IconButton,
  Paper,
  Snackbar,
  Typography
} from '@material-ui/core'
import FuzzySearch from 'fuzzy-search'
import {
  Close as CloseIcon,
  FileCopy as CopyIcon,
  SaveAlt as SaveIcon
} from '@material-ui/icons'
import * as PropTypes from 'prop-types'
import LoggedInState from '../../components/HOC/LoggedInState'
import { connect } from 'react-redux'
import normalizeEmail from 'normalize-email'
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {
  DISPLAY_NAME,
  EMAIL,
  SUBSCRIBERS_ARRAY_KEY
} from '../../fields'
import moment from 'moment'
import { ROOT } from '../../urls'
import { Redirect } from 'react-router-dom'
import * as Sentry from '@sentry/browser'
import { ExportToCsv } from 'export-to-csv'
// @ts-ignore
import { parseFullName } from 'parse-full-name'
import SearchBox from '../../components/SearchBox'
import { compose } from 'underscore'
import { fromJS, List as IList } from 'immutable'
import { CurrentUserStore, User } from '../../entities/User'
import Contact from './Contact'
import Help from './Help'

interface Props {
  currentUser: User
  allowRead: boolean
}

function ContactsPage({ currentUser, allowRead }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([])
  // @ts-ignore
  const [filteredContacts, setFilteredContacts] = useState(new IList())
  const [search, setSearch] = useState('')
  const [showMembers, setShowMembers] = useState(true)
  const [showUsers, setShowUsers] = useState(true)
  const [showSubscribers, setShowSubscribers] = useState(true)
  const [clipboard, setClipboard] = useState('')
  const [copied, setCopied] = useState(false)

  const exportToCSV = () => {
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
    const items = filteredContacts.map((item: any) => {
      const itemJS: User = item.toJS()
      const displayName = itemJS.displayName
      const email = itemJS.email
      const name = parseFullName(displayName)
      return {
        'Email Address': email,
        'First Name': name.first || '',
        'Last Name': name.last || ''
      }
    })
    csvExporter.generateCsv(items.toJS())
  }

  useEffect(() => {
    if (!currentUser || !allowRead) {
      return
    }

    ;(async function() {
      try {
        const contactsData = await firestore
          .doc('subscribers/items')
          .get()
        const data: any = contactsData.data()
        const contactsTmp: Contact[] = data[SUBSCRIBERS_ARRAY_KEY]

        setContacts(contactsTmp)
      } catch (error) {
        Sentry.captureException(error)
        console.error(error)
      }
    })()
  }, [currentUser, allowRead])

  const applyFilter = useCallback(() => {
    let tmpContacts = contacts
    if (search) {
      const searcher = new FuzzySearch(contacts, [DISPLAY_NAME, EMAIL], {
        caseSensitive: false
      })
      tmpContacts = searcher.search(search)
    }

    tmpContacts = tmpContacts.filter(contact => {
      return (
        (showMembers && contact.isMember) ||
        (showUsers &&
          ((showMembers && contact.uid) ||
            (contact.uid && !contact.isMember))) ||
        (showSubscribers && !contact.uid)
      )
    })
    setFilteredContacts(fromJS(tmpContacts))
  }, [contacts, search, showMembers, showUsers, showSubscribers])

  useEffect(() => {
    applyFilter()
  }, [applyFilter])

  const copyToClipboard = useCallback(() => {
    const items = filteredContacts.map((item: any) => {
      const itemJS: User = item.toJS()

      const displayName = itemJS.displayName
      const email = itemJS.email
      if (displayName) {
        return `${displayName} <${email}>`
      } else {
        return email
      }
    })
    setClipboard(items.join('; '))
  }, [filteredContacts])

  useEffect(() => {
    copyToClipboard()
  }, [copyToClipboard])

  const getChips = () => {
    return filteredContacts.toJS().map((contact: Contact) => {
      let label
      if (contact.displayName) {
        label = `${contact.displayName || ''} (${contact.email})`
      } else {
        label = contact.email
      }

      function getColor() {
        if (contact.isMember) {
          return 'primary'
        }
        if (contact.uid) {
          return 'secondary'
        }
        return 'default'
      }

      return (
        <Chip
          className="my-1 mx-1"
          key={contact.uid || normalizeEmail(contact.email)}
          label={label}
          color={getColor()}
        />
      )
    })
  }

  if (currentUser && !allowRead) {
    return <Redirect to={ROOT} />
  }

  return (
    <>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        open={copied}
        autoHideDuration={6000}
        onClose={() => setCopied(false)}
        message={<span id="message-id">Copied to clipboard</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={() => setCopied(false)}
          >
            <CloseIcon />
          </IconButton>
        ]}
      />

      <SearchBox placeholder="Fuzzy Search" onChange={setSearch} />

      <div className="d-flex flex-row flex-wrap justify-content-center mb-4">
        <div className="d-flex flex-row align-items-center">
          <span onClick={() => setShowMembers(!showMembers)}>
            <Checkbox checked={showMembers} />
            <Chip label="Members" color="primary" />
          </span>
          <Help />
        </div>
        <div className="d-flex flex-row align-items-center mx-4">
          <span onClick={() => setShowUsers(!showUsers)}>
            <Checkbox checked={showUsers} />
            <Chip label="Users" color="secondary" />
          </span>
          <Help />
        </div>
        <div className="d-flex flex-row align-items-center">
          <span onClick={() => setShowSubscribers(!showSubscribers)}>
            <Checkbox checked={showSubscribers} />
            <Chip label="Subscribers" color="default" />
          </span>
          <Help />
        </div>
      </div>
      <Paper className="px-2 py-3">
        <Typography variant="h5" component="h3" className="ml-3">
          Contacts ({filteredContacts.size})
          <CopyToClipboard
            text={clipboard}
            onCopy={() => {
              setCopied(true)
            }}
          >
            <IconButton disabled={!filteredContacts.size}>
              <CopyIcon />
            </IconButton>
          </CopyToClipboard>
          <IconButton onClick={exportToCSV} disabled={!filteredContacts.size}>
            <SaveIcon />
          </IconButton>
        </Typography>
        <div className="d-flex justify-content-between flex-wrap">
          {getChips()}
        </div>
      </Paper>
    </>
  )
}

ContactsPage.propTypes = {
  allowRead: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, currentUser } }: CurrentUserStore) => {
  return {
    allowRead: !!currentUser && !!permissions.contactsRead[currentUser.uid],
    currentUser
  }
}

export default compose(
  LoggedInState(),
  connect(mapStateToProps)
)(ContactsPage)
