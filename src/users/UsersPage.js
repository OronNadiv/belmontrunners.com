import 'firebase/firestore'
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
import Switch from '@material-ui/core/Switch'
import { connect } from 'react-redux'
import moment from 'moment'
import googleLibPhoneNumber from 'google-libphonenumber'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  DID_RECEIVED_SHIRT,
  DISPLAY_NAME,
  EMAIL,
  GENDER,
  MEMBERSHIP_EXPIRES_AT,
  PHONE,
  SHIRT_GENDER,
  SHIRT_SIZE,
  STATE,
  UID,
  ZIP
} from '../fields'
import { Checkbox } from '@material-ui/core'
import LoggedInState from '../views/HOC/LoggedInState'
import { ROOT } from '../views/urls'
import { Redirect } from 'react-router-dom'

const ADDRESS = 'address'
const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()

function desc (a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

function stableSort (array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  return stabilizedThis.map(el => el[0])
}

function getSorting (order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy)
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
    const classes = {}

    return (
      <Toolbar>
        <div className={classes.title}>
          <Typography variant="h6" id="tableTitle">
            Users
          </Typography>
        </div>
        <div className={classes.spacer} />
      </Toolbar>
    )
  }
}

EnhancedTableToolbar.propTypes = {}

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
  { id: DID_RECEIVED_SHIRT, numeric: false, disablePadding: false, label: 'Received Shirt' }
]

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

  loadMembers () {
    console.log('in loadmembers.')

    const usersRef = firebase.firestore().collection('users')
    return usersRef.get()
      .then((doc) => {
          let rows = []
          doc.forEach((doc) => {
            let data
            try {
              console.log(doc)
              data = doc.data()
              data[UID] = doc.id
              data[ADDRESS] = [data[ADDRESS1], data[ADDRESS2], data[CITY], data[STATE], data[ZIP]].join(' ').trim()
              if (data[PHONE]) {
                const number = phoneUtil.parseAndKeepRawInput(data[PHONE], 'US')
                data[PHONE] = phoneUtil.format(number, PNF.NATIONAL)
              }
              data[DATE_OF_BIRTH] = data[DATE_OF_BIRTH] ? moment(data[DATE_OF_BIRTH]).format('MMMM D') : ''
              data[MEMBERSHIP_EXPIRES_AT] = data[MEMBERSHIP_EXPIRES_AT] ? moment(data[MEMBERSHIP_EXPIRES_AT]).format('LLLL') : ''
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
      )
      .catch((err) => console.log(err))
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
      orderBy: property
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

  render () {
    console.log('render called.  allowRead:', this.props.allowRead)

    const { currentUser, allowRead, allowWrite } = this.props

    if (currentUser && !allowRead) {
      return <Redirect to={ROOT} />
    } else if (!allowRead) {
      return <div /> // todo: show loading spinner
    }

    // at that point, read is allowed

    const { rowsPerPage, page, order, orderBy, dense, rows } = this.state

    const classes = {}

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage)

    return (
      <div style={{ marginTop: 100 }} className='mx-5 px-3'>
        <Paper style={{ width: 'fit-content' }}>
          <EnhancedTableToolbar />
          <div className={{ overflowX: 'auto' }}>
            <Table
              className={classes.table}
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
                        <TableCell>{row[MEMBERSHIP_EXPIRES_AT]}</TableCell>
                        <TableCell>
                          <Checkbox
                            checked={row[DID_RECEIVED_SHIRT]}
                            disabled={!allowWrite}
                            onChange={(event, checked) => {
                              const index = rows.indexOf(row)
                              rows[index][DID_RECEIVED_SHIRT] = checked
                              console.log('val', checked, index, row)

                              const userRef = firebase.firestore().doc(`users/${row[UID]}`)
                              userRef.set({ [DID_RECEIVED_SHIRT]: checked }, { merge: true })
                                .then(() => {
                                  this.setState({ rows })
                                  console.log('val', checked, index, row)
                                })
                            }}
                          />
                        </TableCell>
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
    )
  }
}

EnhancedTable.propTypes = {
  allowRead: PropTypes.bool.isRequired,
  allowWrite: PropTypes.bool.isRequired,
  currentUser: PropTypes.object.isRequired
}

const mapStateToProps = ({ currentUser: { permissions, currentUser } }) => {
  return {
    allowRead: !!currentUser && !!permissions.usersRead[currentUser.uid],
    allowWrite: !!currentUser && !!permissions.usersWrite[currentUser.uid],
    currentUser: currentUser || {}
  }
}

export default LoggedInState({
  name: 'usersPage',
  isRequiredToBeLoggedIn: true
})(connect(mapStateToProps)(EnhancedTable))
