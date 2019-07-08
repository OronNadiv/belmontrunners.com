import React from 'react'
import { TableCell, TableHead, TableRow, TableSortLabel } from '@material-ui/core'
import * as PropTypes from 'prop-types'
import {
  CREATED_AT,
  DATE_OF_BIRTH,
  DID_RECEIVED_SHIRT,
  DISPLAY_NAME,
  EMAIL,
  EMAIL_VERIFIED,
  GENDER,
  MEMBERSHIP_EXPIRES_AT,
  PHONE,
  PHOTO_URL
} from '../../fields'

export const ADDRESS = 'address'

const headRows = [
  { id: PHOTO_URL, numeric: false, disablePadding: false, label: 'Photo' },
  { id: DISPLAY_NAME, numeric: false, disablePadding: false, label: 'Name' },
  { id: EMAIL, numeric: false, disablePadding: false, label: 'Email' },
  { id: PHONE, numeric: false, disablePadding: false, label: 'Phone' },
  { id: ADDRESS, numeric: false, disablePadding: false, label: 'Address' },
  { id: DATE_OF_BIRTH, numeric: false, disablePadding: false, label: 'Birthday' },
  { id: GENDER, numeric: false, disablePadding: false, label: 'Gender' },
  { id: MEMBERSHIP_EXPIRES_AT, numeric: false, disablePadding: false, label: 'Membership Expires' },
  { id: DID_RECEIVED_SHIRT, numeric: false, disablePadding: false, label: 'Received Shirt' },
  { id: CREATED_AT, numeric: false, disablePadding: false, label: 'Account Creation' },
  { id: EMAIL_VERIFIED, numeric: false, disablePadding: false, label: 'Email Verified' }
]

function EnhancedTableHead ({ order, orderBy, onRequestSort }) {
  const createSortHandler = property => event => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {
          headRows.map(row => (
            <TableCell
              key={row.id}
              align={row.numeric ? 'right' : 'left'}
              padding={row.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === row.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === row.id}
                direction={order}
                onClick={createSortHandler(row.id)}
              >
                {row.label}
              </TableSortLabel>
            </TableCell>
          ))
        }
      </TableRow>
    </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired
}

export default EnhancedTableHead
