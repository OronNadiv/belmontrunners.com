import firebase from 'firebase'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import SaveIcon from '@material-ui/icons/SaveAlt'
import Switch from '@material-ui/core/Switch'
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
  SHIRT_GENDER,
  SHIRT_SIZE,
  STATE,
  UID,
  ZIP
} from '../../fields'
import { Checkbox } from '@material-ui/core'
import LoggedInState from '../../components/LoggedInState'
import { ROOT } from '../../urls'
import { Redirect } from 'react-router-dom'
import s from 'underscore.string'
import DeleteIcon from '@material-ui/icons/Delete'
import ConfirmDeletion from './ConfirmDeletion'
import IconButton from '@material-ui/core/IconButton'
import InputBase from '@material-ui/core/InputBase'
import SearchIcon from '@material-ui/icons/Search'
import FuzzySearch from 'fuzzy-search'
import * as Sentry from '@sentry/browser'
import { ExportToCsv } from 'export-to-csv'

const ADDRESS = 'address'
const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()
const DATE_OF_BIRTH_FORMAT = 'MM/DD'
const MEMBERSHIP_EXPIRES_AT_FORMAT = 'YYYY-MM-DD HH:mm'

const SHIRT_SIZES_ORDER = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

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
    case SHIRT_SIZE:
      let a = SHIRT_SIZES_ORDER.indexOf(rowA[columnName])
      let b = SHIRT_SIZES_ORDER.indexOf(rowB[columnName])
      if (b < a) {
        return -1
      } else if (b > a) {
        return 1
      } else {
        return 0
      }
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

function EnhancedTableHead (props) {
  const { order, orderBy, onRequestSort } = props
  const createSortHandler = property => event => {
    onRequestSort(event, property)
  }

  return (
    <TableHead>
      <TableRow>
        {headRows.map(row => (
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
        ))}
      </TableRow>
    </TableHead>
  )
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.string.isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired
}

class EnhancedTableToolbar extends Component {
  render () {
    const { onExport } = this.props
    return (
      <Toolbar className='d-flex justify-content-between '>
        <div>
          <Typography variant="h6" id="tableTitle">
            Users
          </Typography>
        </div>
        {
          onExport && <IconButton aria-label="Export" onClick={() => {
            onExport()
          }}>
            <SaveIcon />
          </IconButton>
        }
      </Toolbar>
    )
  }
}

EnhancedTableToolbar.propTypes = {
  onExport: PropTypes.func
}

const headRows = [
  { id: DISPLAY_NAME, numeric: false, disablePadding: false, label: 'Name' },
  { id: EMAIL, numeric: false, disablePadding: false, label: 'Email' },
  { id: PHONE, numeric: false, disablePadding: false, label: 'Phone' },
  { id: ADDRESS, numeric: false, disablePadding: false, label: 'Address' },
  { id: DATE_OF_BIRTH, numeric: false, disablePadding: false, label: 'Birthday' },
  { id: GENDER, numeric: false, disablePadding: false, label: 'Gender' },
  { id: SHIRT_GENDER, numeric: false, disablePadding: false, label: 'Shirt Gender' },
  { id: SHIRT_SIZE, numeric: false, disablePadding: false, label: 'Shirt Size' },
  { id: MEMBERSHIP_EXPIRES_AT, numeric: false, disablePadding: false, label: 'Membership Expires' },
  { id: DID_RECEIVED_SHIRT, numeric: false, disablePadding: false, label: 'Received Shirt' },
  { id: CREATED_AT, numeric: false, disablePadding: false, label: 'Account Creation' },
  { id: EMAIL_VERIFIED, numeric: false, disablePadding: false, label: 'Email Verified' }
]

function getColor (membershipExpires) {
  if (membershipExpires && moment(membershipExpires, MEMBERSHIP_EXPIRES_AT_FORMAT).isBefore(moment())) {
    return 'red'
  }
  return 'initial'
}

class EnhancedTable extends Component {

  constructor (props) {
    super(props)
    this.state = {
      rows: [],
      order: 'asc',
      orderBy: DISPLAY_NAME,
      page: 0,
      dense: true,
      rowsPerPage: 25
    }
    this.handleChangeDense = this.handleChangeDense.bind(this)
    this.handleChangePage = this.handleChangePage.bind(this)
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this)
    this.handleRequestSort = this.handleRequestSort.bind(this)
  }

  async loadMembers () {
    console.log('in loadMembers.')

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
        console.log(doc.id, data[DATE_OF_BIRTH])
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
    this.setState({ rows })
  }

  componentDidMount () {
    this.props.allowRead && this.loadMembers()
  }

  componentDidUpdate (prevProps) {
    prevProps.allowRead !== this.props.allowRead && this.props.allowRead && this.loadMembers()
  }


  handleRequestSort (event, property) {
    const { orderBy, order } = this.state
    const isDesc = orderBy === property && order === 'desc'
    this.setState({
      order: isDesc ? 'asc' : 'desc',
      orderBy: property,
      page: 0
    })

  }

  handleChangePage (event, newPage) {
    this.setState({ page: newPage })
  }

  handleChangeRowsPerPage (event) {
    this.setState({
      page: 0,
      rowsPerPage: event.target.value
    })
  }

  handleChangeDense (event) {
    this.setState({ dense: event.target.checked })
  }

  handleExport () {
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
    csvExporter.generateCsv(this.state.rows)
  }

  render () {
    const { currentUser, allowRead, allowWrite, allowDelete } = this.props
    console.log('render called.',
      'allowRead:', allowRead,
      'allowWrite:', allowWrite,
      'allowDelete:', allowDelete
    )

    if (currentUser && !allowRead) {
      return <Redirect to={ROOT} />
    }

    // at that point, read is allowed

    const { rowsPerPage, page, order, orderBy, dense, rowToDelete, search } = this.state
    let { rows } = this.state
    if (search) {
      const searcher = new FuzzySearch(rows, [DISPLAY_NAME, EMAIL], {
        caseSensitive: false
      })
      rows = searcher.search(search)
    }


    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage)

    return (
      <div className='container-fluid'>
        {
          rowToDelete &&
          <ConfirmDeletion
            row={rowToDelete}
            onClose={() => {
              this.setState({ rowToDelete: null })
              this.loadMembers()
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
              placeholder="Fuzzy Search"
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
          </Paper>
        </div>
        <div className='row mx-1'>
          <Paper className=''>
            <EnhancedTableToolbar onExport={() => this.handleExport()} />
            <div className={{ overflowX: 'auto' }}>
              <Table
                aria-labelledby="tableTitle"
                size={dense ? 'small' : 'medium'}
              >
                <EnhancedTableHead
                  order={order}
                  orderBy={orderBy}
                  onRequestSort={this.handleRequestSort}
                  rowCount={rows.length}
                />
                <TableBody>
                  {stableSort(rows, getSorting(order, orderBy))
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => {
                      return (
                        <TableRow
                          key={index}
                          hover
                        >
                          <TableCell onClick={() => {
                            console.log('uid:', row[UID])
                          }}>{row[DISPLAY_NAME]}</TableCell>
                          <TableCell>{row[EMAIL]}</TableCell>
                          <TableCell>{row[PHONE]}</TableCell>
                          <TableCell>{row[ADDRESS]}</TableCell>
                          <TableCell>{row[DATE_OF_BIRTH]}</TableCell>
                          <TableCell>{row[GENDER]}</TableCell>
                          <TableCell>{row[SHIRT_GENDER]}</TableCell>
                          <TableCell>{row[SHIRT_SIZE]}</TableCell>
                          <TableCell style={{ color: getColor(row[MEMBERSHIP_EXPIRES_AT]) }}>
                            {row[MEMBERSHIP_EXPIRES_AT]}
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={row[DID_RECEIVED_SHIRT]}
                              disabled={!allowWrite}
                              onChange={async (event, checked) => {
                                const index = rows.indexOf(row)
                                rows[index][DID_RECEIVED_SHIRT] = checked
                                console.log('val', checked, index, row)

                                const userRef = firebase.firestore().doc(`users/${row[UID]}`)
                                try {
                                  await userRef.set({ [DID_RECEIVED_SHIRT]: checked }, { merge: true })
                                  this.setState({ rows })
                                  console.log('val', checked, index, row)
                                } catch (error) {
                                  Sentry.captureException(error)
                                  console.log(error)
                                }
                              }}
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
                                this.setState({ rowToDelete: row })
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
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              backIconButtonProps={{
                'aria-label': 'Previous Page'
              }}
              nextIconButtonProps={{
                'aria-label': 'Next Page'
              }}
              onChangePage={this.handleChangePage}
              onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
          </Paper>
          <FormControlLabel
            control={<Switch checked={dense} onChange={this.handleChangeDense} />}
            label="Dense padding"
          />
        </div>
      </div>
    )
  }
}

EnhancedTable.propTypes = {
  allowRead: PropTypes.bool.isRequired,
  allowWrite: PropTypes.bool.isRequired,
  allowDelete: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, currentUser } }) => {
  return {
    allowRead: !!currentUser && !!permissions.usersRead[currentUser.uid],
    allowWrite: !!currentUser && !!permissions.usersWrite[currentUser.uid],
    allowDelete: !!currentUser && !!permissions.usersDelete[currentUser.uid],
    currentUser: currentUser || {}
  }
}

export default LoggedInState({
  name: 'usersPage',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps)(EnhancedTable))
