import React, { useCallback, useEffect, useState } from 'react'
import MUIDataTable from 'mui-datatables'
import { User } from 'firebase/auth'
import { doc, collection, setDoc, getDocs } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import DeleteIcon from '@material-ui/icons/Delete'
import * as PropTypes from 'prop-types'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  CREATED_AT,
  DATE_OF_BIRTH,
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
import { animateScroll } from 'react-scroll'
import googleLibPhoneNumber from 'google-libphonenumber'
import _, { compose } from 'underscore'
import { connect } from 'react-redux'
import { Avatar, Checkbox, IconButton } from '@material-ui/core'
import * as Sentry from '@sentry/browser'
import { getAvatar, IRedisState, IUser } from '../../entities/User'
import { ROOT } from '../../urls'
import { Redirect } from 'react-router-dom'
import ConfirmDeletion from './ConfirmDeletion'
import calc from '../../utilities/membershipUtils'
import { firestore, functions } from '../../firebase'
import { useWindowDimensions } from '../../utilities/getWindowDimentions';

const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()

const DATE_OF_BIRTH_FORMAT = 'MM/DD'
const MEMBERSHIP_EXPIRES_AT_FORMAT = 'YYYY-MM-DD HH:mm'
const MEMBERSHIP_STATUS = 'MEMBERSHIP_STATUS'

interface Props {
  firebaseUser: User,
  allowRead: boolean,
  allowWrite: boolean
  allowDelete: boolean
}

interface IUserWithMembershipStatus extends IUser {
  [MEMBERSHIP_STATUS]: string
}


function UsersPage({ firebaseUser, allowDelete, allowRead, allowWrite }: Props) {
  const [rows, setRows] = useState<IUserWithMembershipStatus[]>([])
  const [rowToDelete, setRowToDelete] = useState<IUserWithMembershipStatus | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadMembers = useCallback(async () => {
    const usersRef = collection(firestore, 'users')
    const docs = await getDocs(usersRef)
    // exception will be handled by ErrorBoundary
    const res: any = []
    docs.forEach((docData) => {
      try {
        const data: IUser = docData.data() as IUser
        if (data.phone) {
          const number = phoneUtil.parseAndKeepRawInput(data.phone, 'US')
          data.phone = phoneUtil.format(number, PNF.NATIONAL)
        } else {
          data.phone = ''
        }
        data.photoURL = getAvatar(data)

        const userData: IUserWithMembershipStatus = {
          [UID]: docData.id,
          [PHOTO_URL]: data.photoURL || '',
          [DISPLAY_NAME]: data.displayName,
          [EMAIL]: data.email,
          [ADDRESS1]: data.address1 || '',
          [ADDRESS2]: data.address2 || '',
          [CITY]: (data.city || '').toLowerCase().trim()
            .split(' ')
            .map((s: string) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' '),
          [STATE]: data.state || '',
          [ZIP]: data.zip || '',
          [GENDER]: data.gender || '',
          [DATE_OF_BIRTH]: data.dateOfBirth ? moment(data.dateOfBirth).format(DATE_OF_BIRTH_FORMAT) : '',
          [CREATED_AT]: data.createdAt ? moment(data.createdAt).format(MEMBERSHIP_EXPIRES_AT_FORMAT) : '',
          [MEMBERSHIP_EXPIRES_AT]: data.membershipExpiresAt ? moment(data.membershipExpiresAt).format(MEMBERSHIP_EXPIRES_AT_FORMAT) : '',
          [MEMBERSHIP_STATUS]: '',
          [EMAIL_VERIFIED]: !!data.emailVerified,
          [NOT_INTERESTED_IN_BECOMING_A_MEMBER]: !!data.notInterestedInBecomingAMember
        }

        try {
          const calc1 = calc(userData)
          if (calc1.isAMember) {
            userData[MEMBERSHIP_STATUS] = 'Is a member'
          } else if (calc1.isMembershipExpired) {
            userData[MEMBERSHIP_STATUS] = 'Was a member'
          } else if (calc1.wasNeverAMember) {
            userData[MEMBERSHIP_STATUS] = 'Not a member'
          } else if (calc1.isMembershipExpiresSoon) {
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

  useEffect(() => {
    animateScroll.scrollToTop({ duration: 0 })
  }, [firebaseUser])

  useEffect(() => {
    allowRead && loadMembers()
  }, [allowRead, loadMembers])

  const { height } = useWindowDimensions();

  const handleNotInterested = async (userData: IUserWithMembershipStatus, isChecked: boolean) => {
    const userRef = doc(firestore, `users/${userData.uid}`)
    await setDoc(userRef, { [NOT_INTERESTED_IN_BECOMING_A_MEMBER]: isChecked }, { merge: true })
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
            const userData = _.findWhere(rows, { [UID]: tableMeta.rowData[0] }) as IUserWithMembershipStatus
            if (!userData) {
              return value
            }

            return (
              <Checkbox
                checked={!!value}
                disabled={!allowWrite || calc(userData).isAMember}
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
      display: false,
      // @ts-ignore
      filter: false
    }
  })

  if (firebaseUser && !allowRead) {
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
              await httpsCallable(functions, 'deleteUser')({ [UID]: row[UID] })
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
              rowsPerPage: 100,
              tableBodyMaxHeight: `${height/1.5}px`,
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
  firebaseUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, firebaseUser } }: IRedisState) => {
  if (!firebaseUser) {
    throw new Error('missing current user')
  }
  const uid = firebaseUser.uid
  return {
    allowRead: permissions && permissions.usersRead[uid],
    allowWrite: permissions && permissions.usersWrite[uid],
    allowDelete: permissions && permissions.usersDelete[uid],
    firebaseUser: firebaseUser || {}
  }
}

export default compose(
  LoggedInState(),
  connect(mapStateToProps)
)(UsersPage)
