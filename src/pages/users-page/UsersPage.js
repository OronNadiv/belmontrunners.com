import firebase from 'firebase'
import * as PropTypes from 'prop-types'
import {
  Avatar,
  Checkbox,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow
} from '@material-ui/core'
import { Delete as DeleteIcon } from '@material-ui/icons'
import { connect } from 'react-redux'
import moment from 'moment'
import googleLibPhoneNumber from 'google-libphonenumber'
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
  LAST_SIGNED_IN_AT,
  MEMBERSHIP_EXPIRES_AT,
  PHONE,
  PHOTO_URL,
  STATE,
  UID,
  ZIP
} from '../../fields'
import LoggedInState from '../../components/HOC/LoggedInState'
import { ROOT } from '../../urls'
import { Redirect } from 'react-router-dom'
import s from 'underscore.string'
import ConfirmDeletion from './ConfirmDeletion'
import FuzzySearch from 'fuzzy-search'
import * as Sentry from '@sentry/browser'
import { ExportToCsv } from 'export-to-csv'
import SearchBox from '../../components/SearchBox'
import initials from 'initials'
import { compose, indexOf } from 'underscore'
import React, { useCallback, useEffect, useState } from 'react'
import { goToTop } from 'react-scrollable-anchor'
import EnhancedTableHead, { ADDRESS } from './EnhancedTableHead'
import EnhancedTableToolbar from './EnhancedTableToolbar'

const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()
const DATE_OF_BIRTH_FORMAT = 'MM/DD'
const MEMBERSHIP_EXPIRES_AT_FORMAT = 'YYYY-MM-DD HH:mm'

function desc (rowA, rowB, columnName) {
  switch (columnName) {
    case CREATED_AT:
      return moment(rowB[columnName] || moment(0), MEMBERSHIP_EXPIRES_AT_FORMAT).diff(moment(rowA[columnName] || moment(0), MEMBERSHIP_EXPIRES_AT_FORMAT))
    case LAST_SIGNED_IN_AT:
      return moment(rowB[columnName] || moment(0), MEMBERSHIP_EXPIRES_AT_FORMAT).diff(moment(rowA[columnName] || moment(0), MEMBERSHIP_EXPIRES_AT_FORMAT))
    case MEMBERSHIP_EXPIRES_AT:
      return moment(rowB[columnName] || moment(0), MEMBERSHIP_EXPIRES_AT_FORMAT).diff(moment(rowA[columnName] || moment(0), MEMBERSHIP_EXPIRES_AT_FORMAT))
    case DATE_OF_BIRTH:
      return moment(rowB[columnName] || moment(0), DATE_OF_BIRTH_FORMAT).diff(moment(rowA[columnName] || moment(0), DATE_OF_BIRTH_FORMAT))
    default:
      return s.naturalCmp(rowB[columnName], rowA[columnName])
  }
}

function stableSort (rows, cmp) {
  const rowIndexPairs = rows.map((row, index) => [row, index])
  rowIndexPairs.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return rowIndexPairs.map(el => el[0])
}

function getSorting (order, columnName) {
  return order === 'desc' ? (a, b) => desc(a, b, columnName) : (a, b) => -desc(a, b, columnName)
}

function getColor (membershipExpires) {
  if (membershipExpires && moment(membershipExpires, MEMBERSHIP_EXPIRES_AT_FORMAT).isBefore(moment())) {
    return 'red'
  }
  return 'initial'
}

function EnhancedTable ({ currentUser, allowRead, allowWrite, allowDelete }) {
  const [rows, setRows] = useState([])
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState(DISPLAY_NAME)
  const [page, setPage] = useState(0)
  const [dense, setDense] = useState(true)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [rowToDelete, setRowToDelete] = useState()
  const [search, setSearch] = useState('')
  const [filteredRows, setFilteredRows] = useState([])

  const handleToggleReceivedShirt = async (row, checked) => {
    try {
      const index = indexOf(rows, row)
      rows[index][DID_RECEIVED_SHIRT] = checked
      const userRef = firebase.firestore().doc(`users/${row[UID]}`)
      await userRef.set({ [DID_RECEIVED_SHIRT]: checked }, { merge: true })
      setRows([...rows])
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
    }
  }

  const loadMembers = useCallback(async () => {
    const usersRef = firebase.firestore().collection('users')
    const doc = await usersRef.get()
    // exception will be handled by ErrorBoundary
    let rows = []
    doc.forEach((doc) => {
      let data
      try {
        data = doc.data()
        data[UID] = doc.id
        data[ADDRESS] = [data[ADDRESS1], data[ADDRESS2], data[CITY], data[STATE], data[ZIP]].join(' ').trim()
        if (data[PHONE]) {
          const number = phoneUtil.parseAndKeepRawInput(data[PHONE], 'US')
          data[PHONE] = phoneUtil.format(number, PNF.NATIONAL)
        }
        data[DATE_OF_BIRTH] = data[DATE_OF_BIRTH] ? moment(data[DATE_OF_BIRTH]).format(DATE_OF_BIRTH_FORMAT) : ''
        data[LAST_SIGNED_IN_AT] = moment(data[LAST_SIGNED_IN_AT]).format(MEMBERSHIP_EXPIRES_AT_FORMAT)
        data[CREATED_AT] = moment(data[CREATED_AT]).format(MEMBERSHIP_EXPIRES_AT_FORMAT)
        data[MEMBERSHIP_EXPIRES_AT] = data[MEMBERSHIP_EXPIRES_AT] ? moment(data[MEMBERSHIP_EXPIRES_AT]).format(MEMBERSHIP_EXPIRES_AT_FORMAT) : ''
        data[EMAIL_VERIFIED] = !!data[EMAIL_VERIFIED]
        data[DID_RECEIVED_SHIRT] = !!data[DID_RECEIVED_SHIRT]
        rows.push(data)
      } catch (err) {
        console.error('ERROR PROCESSING USER.',
          'data:', data,
          'err:', err)
      }
    })
    setRows(rows)
  }, [])

  useEffect(goToTop, [currentUser])

  useEffect(() => {
    allowRead && loadMembers()
  }, [allowRead, loadMembers])

  const handleRequestSort = (event, property) => {
    const isDesc = orderBy === property && order === 'desc'
    setOrder(isDesc ? 'asc' : 'desc')
    setOrderBy(property)
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setPage(0)
    setRowsPerPage(event.target.value)
  }

  const handleChangeDense = (event) => {
    setDense(event.target.checked)
  }

  const handleExport = () => {
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      useBom: true,
      useKeysAsHeaders: true,
      filename: 'users-' + moment().format()
    }

    const csvExporter = new ExportToCsv(options)
    csvExporter.generateCsv(rows)
  }

  useEffect(() => {
    let tmpRows = rows
    if (search) {
      const searcher = new FuzzySearch(tmpRows, [DISPLAY_NAME, EMAIL], {
        caseSensitive: false
      })
      tmpRows = searcher.search(search)
    }
    setFilteredRows([...tmpRows])
  }, [search, rows])

  if (currentUser && !allowRead) {
    return <Redirect to={ROOT} />
  }

  // at that point, read is allowed


  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredRows.length - page * rowsPerPage)

  return (
    <>
      {
        rowToDelete &&
        <ConfirmDeletion
          row={rowToDelete}
          onClose={async () => {
            setRowToDelete()
            await loadMembers()
          }}
        />
      }
      <SearchBox placeholder="Fuzzy Search" onChange={setSearch} />
      <Paper style={{ overflowX: 'scroll' }}>
        <EnhancedTableToolbar onExport={handleExport} />
        <div className={{ overflowX: 'auto' }}>
          <Table
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(filteredRows, getSorting(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow
                      key={index}
                      hover
                    >
                      <TableCell>
                        <Avatar style={{
                          width: 40,
                          height: 40,
                          backgroundColor: 'rgb(98, 71, 234)',
                          fontSize: 13.33333
                        }} src={row[PHOTO_URL]}>
                          {
                            initials(row[DISPLAY_NAME])
                          }
                        </Avatar>
                      </TableCell>
                      <TableCell onClick={() => {
                        console.log('uid:', row[UID])
                      }}>{row[DISPLAY_NAME]}</TableCell>
                      <TableCell>{row[EMAIL]}</TableCell>
                      <TableCell>{row[PHONE]}</TableCell>
                      <TableCell>{row[ADDRESS]}</TableCell>
                      <TableCell>{row[DATE_OF_BIRTH]}</TableCell>
                      <TableCell>{row[GENDER]}</TableCell>
                      <TableCell style={{ color: getColor(row[MEMBERSHIP_EXPIRES_AT]) }}>
                        {row[MEMBERSHIP_EXPIRES_AT]}
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={row[DID_RECEIVED_SHIRT]}
                          disabled={!allowWrite}
                          onChange={(event, checked) => handleToggleReceivedShirt(row, checked)}
                        />
                      </TableCell>
                      <TableCell>{row[CREATED_AT]}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={row[EMAIL_VERIFIED]}
                          disabled
                        />
                      </TableCell>
                      {
                        allowDelete &&
                        <TableCell>
                          <IconButton aria-label="Delete" onClick={() => {
                            setRowToDelete(row)
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      }
                    </TableRow>
                  )
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 49 * emptyRows }}>
                  <TableCell colSpan={10} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          backIconButtonProps={{
            'aria-label': 'Previous Page'
          }}
          nextIconButtonProps={{
            'aria-label': 'Next Page'
          }}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </>
  )
}

EnhancedTable.propTypes = {
  allowRead: PropTypes.bool.isRequired,
  allowWrite: PropTypes.bool.isRequired,
  allowDelete: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, currentUser } }) => {
  return {
    allowRead: !!currentUser && !!permissions.usersRead[currentUser[UID]],
    allowWrite: !!currentUser && !!permissions.usersWrite[currentUser[UID]],
    allowDelete: !!currentUser && !!permissions.usersDelete[currentUser[UID]],
    currentUser: currentUser || {}
  }
}

export default compose(
  LoggedInState(),
  connect(mapStateToProps)
)(EnhancedTable)
