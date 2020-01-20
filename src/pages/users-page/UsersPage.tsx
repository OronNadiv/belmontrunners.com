import React, { useCallback, useEffect, useState } from 'react'
import MUIDataTable from 'mui-datatables'
import firebase from 'firebase/app'
import DeleteIcon from '@material-ui/icons/Delete'
import * as PropTypes from 'prop-types'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  CREATED_AT,
  DATE_OF_BIRTH,
  DID_RECEIVED_SHIRT,
  DISPLAY_NAME,
  EMAIL,
  EMAIL_VERIFIED,
  GENDER,
  MEMBERSHIP_EXPIRES_AT,
  NOT_INTERESTED_IN_BECOMING_A_MEMBER,
  PHONE,
  PHOTO_URL,
  STATE,
  UID,
  ZIP
} from '../../fields'
import moment from 'moment'
import LoggedInState from '../../components/HOC/LoggedInState'
import { goToTop } from 'react-scrollable-anchor'
import googleLibPhoneNumber from 'google-libphonenumber'
import _, { compose } from 'underscore'
import { connect } from 'react-redux'
import { Avatar, Checkbox, IconButton } from '@material-ui/core'
import * as Sentry from '@sentry/browser'
import { User, CurrentUserStore } from '../../entities/User'
import { ROOT } from '../../urls'
import { Redirect } from 'react-router-dom'
import ConfirmDeletion from './ConfirmDeletion'
import {
  calc,
  IS_A_MEMBER,
  IS_MEMBERSHIP_EXPIRED,
  IS_MEMBERSHIP_EXPIRES_SOON,
  WAS_NEVER_A_MEMBER
} from '../../utilities/membershipUtils'
import { firestore } from '../../firebase'

const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()

const DATE_OF_BIRTH_FORMAT = 'MM/DD'
const MEMBERSHIP_EXPIRES_AT_FORMAT = 'YYYY-MM-DD HH:mm'
const MEMBERSHIP_STATUS = 'MEMBERSHIP_STATUS'

interface UsersPageProps {
  currentUser: any,
  allowRead: boolean,
  allowWrite: boolean
  allowDelete: boolean
}

interface UserDataExtended extends User {
  MEMBERSHIP_STATUS: string
}


function UsersPage(props: UsersPageProps) {
  const { currentUser, allowDelete, allowRead, allowWrite } = props

  const [rows, setRows] = useState<UserDataExtended[]>([])
  const [rowToDelete, setRowToDelete] = useState<UserDataExtended | undefined>(undefined)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const loadMembers = useCallback(async () => {
    const usersRef = firestore.collection('users')
    const doc = await usersRef.get()
    // exception will be handled by ErrorBoundary
    const res: any = []
    doc.forEach((docData) => {
      try {
        const data = docData.data()
        if (data[PHONE]) {
          const number = phoneUtil.parseAndKeepRawInput(data[PHONE], 'US')
          data[PHONE] = phoneUtil.format(number, PNF.NATIONAL)
        } else {
          data[PHONE] = ''
        }

        const userData: UserDataExtended = {
          [UID]: docData.id,
          [PHOTO_URL]: data[PHOTO_URL] || '',
          [DISPLAY_NAME]: data[DISPLAY_NAME],
          [EMAIL]: data[EMAIL],
          [DID_RECEIVED_SHIRT]: !!data[DID_RECEIVED_SHIRT],
          [ADDRESS1]: data[ADDRESS1] || '',
          [ADDRESS2]: data[ADDRESS2] || '',
          [CITY]: (data[CITY] || '').toLowerCase().trim()
            .split(' ')
            .map((s: string) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' '),
          [STATE]: data[STATE] || '',
          [ZIP]: data[ZIP] || '',
          [GENDER]: data[GENDER] || '',
          [DATE_OF_BIRTH]: data[DATE_OF_BIRTH] ? moment(data[DATE_OF_BIRTH]).format(DATE_OF_BIRTH_FORMAT) : '',
          [CREATED_AT]: moment(data[CREATED_AT]).format(MEMBERSHIP_EXPIRES_AT_FORMAT),
          [MEMBERSHIP_EXPIRES_AT]: data[MEMBERSHIP_EXPIRES_AT] ? moment(data[MEMBERSHIP_EXPIRES_AT]).format(MEMBERSHIP_EXPIRES_AT_FORMAT) : '',
          [MEMBERSHIP_STATUS]: '',
          [EMAIL_VERIFIED]: !!data[EMAIL_VERIFIED],
          [NOT_INTERESTED_IN_BECOMING_A_MEMBER]: !!data[NOT_INTERESTED_IN_BECOMING_A_MEMBER]
        }

        try {
          const calc1 = calc(userData)
          if (calc1[IS_A_MEMBER]) {
            userData[MEMBERSHIP_STATUS] = 'Is a member'
          } else if (calc1[IS_MEMBERSHIP_EXPIRED]) {
            userData[MEMBERSHIP_STATUS] = 'Was a member'
          } else if (calc1[WAS_NEVER_A_MEMBER]) {
            userData[MEMBERSHIP_STATUS] = 'Not a member'
          } else if (calc1[IS_MEMBERSHIP_EXPIRES_SOON]) {
            userData[MEMBERSHIP_STATUS] = 'Membership expires soon'
          } else {
            throw new Error(`Unknown membership status.  calc: ${JSON.stringify(calc1)}`)
          }
        } catch (error) {
          Sentry.captureException(error)
          console.error(error)
        }

        res.push(userData)
      } catch (err) {
        console.error('ERROR PROCESSING USER.',
          'err:', err)
      }
    })
    setRows(res)
  }, [])

  useEffect(goToTop, [currentUser])

  useEffect(() => {
    allowRead && loadMembers()
  }, [allowRead, loadMembers])

  const handleToggleReceivedShirt = async (userData: UserDataExtended, isChecked: boolean) => {
    const userRef = firestore.doc(`users/${userData[UID]}`)
    await userRef.set({ [DID_RECEIVED_SHIRT]: isChecked }, { merge: true })
  }

  const handleNotInterested = async (userData: UserDataExtended, isChecked: boolean) => {
    const userRef = firestore.doc(`users/${userData[UID]}`)
    await userRef.set({ [NOT_INTERESTED_IN_BECOMING_A_MEMBER]: isChecked }, { merge: true })
  }

  const columns = [
    {
      name: PHOTO_URL,
      label: 'Photo',
      options: {
        filter: false,
        searchable: false,
        // eslint-disable-next-line react/display-name
        customBodyRender: (value: any, tableMeta: any, updateValue: (s: any, c: any, p: any) => any) => {
          // console.log(tableMeta)
          return value ?
            <Avatar style={{ width: 40, height: 40, backgroundColor: 'rgb(98, 71, 234)', fontSize: 13.33333 }}
                    src={value} />
            : ''
        }
      }
    },
    {
      name: DISPLAY_NAME,
      label: 'Name',
      options: {
        filter: false
      }
    },
    {
      name: EMAIL,
      label: 'Email',
      options: {
        filter: false
      }
    },
    {
      name: PHONE,
      label: 'Phone',
      options: {
        filter: false,
        searchable: false
      }
    },
    {
      name: ADDRESS1,
      label: 'Address1',
      options: {
        filter: false
      }
    },
    {
      name: ADDRESS2,
      label: 'Address2',
      options: {
        filter: false
      }
    },
    {
      name: CITY,
      label: 'City'
    },
    {
      name: STATE,
      label: 'State'
    },
    {
      name: ZIP,
      label: 'Zip'
    },
    {
      name: DATE_OF_BIRTH,
      label: 'Birthday',
      options: {
        filter: false
      }
    },
    {
      name: GENDER,
      label: 'Gender',
      options: {
        searchable: false
      }
    },
    {
      name: NOT_INTERESTED_IN_BECOMING_A_MEMBER,
      label: 'Not interested in becoming a member',
      options: {
        searchable: false,

        // eslint-disable-next-line react/display-name
        customBodyRender: (value: any, tableMeta: any, updateValue: (s: any, c: any, p: any) => any) => {
          // console.log(tableMeta)

          try {
            if (!tableMeta.rowData) {
              return value
            }
            const userData = _.findWhere(rows, { [UID]: tableMeta.rowData[0] }) as UserDataExtended
            if (!userData) {
              return value
            }

            return (
              <Checkbox
                checked={!!value}
                disabled={!allowWrite || !!calc(userData)[IS_A_MEMBER]}
                onChange={async (event, isChecked) => {
                  try {
                    await handleNotInterested(userData, isChecked)
                    updateValue(isChecked, undefined, undefined)
                  } catch (error) {
                    Sentry.captureException(error)
                    console.error(error)
                  }
                }}
              />
            )
          } catch (error) {
            Sentry.captureException(error)
            console.error(error)
            return value
          }
        }
      }
    },
    {
      name: MEMBERSHIP_EXPIRES_AT,
      label: 'Membership Expires',
      options: {
        filter: false,
        searchable: false
      }
    },
    {
      name: MEMBERSHIP_STATUS,
      label: 'Membership Status',
      options: {}
    },
    {
      name: DID_RECEIVED_SHIRT,
      label: 'Received Shirt',
      options: {
        searchable: false,

        // eslint-disable-next-line react/display-name
        customBodyRender: (value: any, tableMeta: any, updateValue: (s: any, c: any, p: any) => any) => {
          // console.log(tableMeta)

          return (
            <Checkbox
              checked={!!value}
              disabled={!allowWrite}
              onChange={async (event, isChecked) => {
                try {
                  const userData = _.findWhere(rows, { [UID]: tableMeta.rowData[0] }) as UserDataExtended
                  await handleToggleReceivedShirt(userData, isChecked)
                  updateValue(isChecked, undefined, undefined)
                } catch (error) {
                  Sentry.captureException(error)
                  console.error(error)
                }
              }}
            />
          )
        }
      }
    },
    {
      name: CREATED_AT,
      label: 'Account Creation',
      options: {
        filter: false,
        searchable: false
      }
    },
    {
      name: EMAIL_VERIFIED,
      label: 'Email Verified',
      options: {
        searchable: false,
        // eslint-disable-next-line react/display-name
        customBodyRender: (value: any) => {
          return (
            <Checkbox
              checked={value}
              disabled
            />
          )
        }

      }
    }
  ]

  columns.unshift({
    name: UID,
    options: {
      // @ts-ignore
      display: false,
      filter: false
    }
  })

  if (currentUser && !allowRead) {
    return <Redirect to={ROOT} />
  }

  return (
    <>
      {
        rowToDelete &&
        <ConfirmDeletion
          row={rowToDelete}
          onClose={async (shouldDelete: boolean) => {
            const row = rowToDelete
            try {
              if (!shouldDelete) {
                setRowToDelete(undefined)
                return
              }
              console.log(`Deleting: ${JSON.stringify(row)}`)
              setIsSubmitting(true)
              await firebase.functions().httpsCallable('deleteUser')({ [UID]: row[UID] })
              console.log('Deleted successfully')
              setRowToDelete(undefined)
              await loadMembers()
            } catch (error) {
              Sentry.captureException(error)
              console.log('Deletion failed.',
                'error:', error)
            } finally {
              setIsSubmitting(false)
            }
          }}
        />
      }

      {
        !rows.length ? '' :
          <MUIDataTable
            title={'Users List'}
            data={rows}
            columns={columns}
            options={{
              selectableRows: allowDelete ? 'single' : 'none',
              print: false,
              responsive: 'stacked',
              rowsPerPage: 100,
              // eslint-disable-next-line react/display-name
              customToolbarSelect: (selectedRows) => {
                return allowDelete &&
                  <IconButton aria-label="Delete" disabled={isSubmitting} onClick={() => {
                    const { dataIndex } = selectedRows.data[0]
                    const row = rows[dataIndex]
                    row && setRowToDelete(row)
                  }}>
                    <DeleteIcon />
                  </IconButton>
              }
            }}
          />
      }
    </>
  )
}

UsersPage.propTypes = {
  allowRead: PropTypes.bool.isRequired,
  allowWrite: PropTypes.bool.isRequired,
  allowDelete: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = (state: CurrentUserStore) => {
  const permissions = state.currentUser.permissions
  const currentUser = state.currentUser.currentUser
  if (!currentUser) {
    throw new Error('missing current user')
  }
  const uid = currentUser.uid
  return {
    allowRead: permissions && permissions.usersRead[uid],
    allowWrite: permissions && permissions.usersWrite[uid],
    allowDelete: permissions && permissions.usersDelete[uid],
    currentUser: currentUser || {}
  }
}

export default compose(
  LoggedInState(),
  connect(mapStateToProps)
)(UsersPage)
