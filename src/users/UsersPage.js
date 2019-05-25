import 'firebase/firestore'
import firebase from 'firebase'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import clsx from 'clsx'
import { withStyles } from '@material-ui/core/styles'
import TableCell from '@material-ui/core/TableCell'
import Paper from '@material-ui/core/Paper'
import { AutoSizer, Column, Table } from 'react-virtualized'
import s from 'underscore.string'
import moment from 'moment'
import googleLibPhoneNumber from 'google-libphonenumber'
import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  DATE_OF_BIRTH,
  DISPLAY_NAME,
  EMAIL,
  GENDER,
  MEMBERSHIP_EXPIRES_AT,
  PHONE,
  SHIRT_GENDER,
  SHIRT_SIZE,
  STATE,
  ZIP
} from '../fields'

const PNF = googleLibPhoneNumber.PhoneNumberFormat
const phoneUtil = googleLibPhoneNumber.PhoneNumberUtil.getInstance()

const styles = theme => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  tableRow: {
    cursor: 'pointer'
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200]
    }
  },
  tableCell: {
    flex: 1
  },
  noClick: {
    cursor: 'initial'
  }
})

class MuiVirtualizedTable extends React.PureComponent {
  static defaultProps = {
    headerHeight: 48,
    rowHeight: 48
  }

  getRowClassName = ({ index }) => {
    const { classes, onRowClick } = this.props

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null
    })
  }

  cellRenderer = ({ cellData, columnIndex }) => {
    const { columns, classes, rowHeight, onRowClick } = this.props
    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
      >
        {cellData}
      </TableCell>
    )
  }

  headerRenderer = ({ label, columnIndex }) => {
    const { headerHeight, columns, classes } = this.props

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
        variant="head"
        style={{ height: headerHeight }}
        align={columns[columnIndex].numeric || false ? 'right' : 'left'}
      >
        <span>{label}</span>
      </TableCell>
    )
  }

  render () {
    const { classes, columns, ...tableProps } = this.props
    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table height={height} width={width} {...tableProps} rowClassName={this.getRowClassName}>
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={headerProps =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index
                    })
                  }
                  className={classes.flexContainer}
                  cellRenderer={this.cellRenderer}
                  dataKey={dataKey}
                  {...other}
                />
              )
            })}
          </Table>
        )}
      </AutoSizer>
    )
  }
}

MuiVirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number
}

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable)

class UsersPage extends Component {
  constructor (props) {
    super(props)
    this.state = { members: [] }
  }

  componentDidMount () {
    this.loadMembers()
  }

  loadMembers () {
    const usersRef = firebase.firestore().collection('users')
    usersRef.get()
      .then((doc) => {
          let members = []
          doc.forEach((doc) => {
            const data = doc.data()
            data.address = data[ADDRESS1]
            if (data[ADDRESS2]) {
              data.address += ' ' + data[ADDRESS2]
            }
            data.address += ' ' + data[CITY]
            data.address += ' ' + data[STATE] + ' ' + data[ZIP]
            const number = phoneUtil.parseAndKeepRawInput(data[PHONE], 'US')

            data[PHONE] = phoneUtil.format(number, PNF.NATIONAL)
            data[DATE_OF_BIRTH] = moment(data[DATE_OF_BIRTH]).format('MMMM D')
            data[MEMBERSHIP_EXPIRES_AT] = data[MEMBERSHIP_EXPIRES_AT] ? moment(data[MEMBERSHIP_EXPIRES_AT]).format('LLLL') : ''
            members.push(data)
          })
          members = members.sort((a, b) => {
            return s.naturalCmp(a.displayName, b.displayName)
          })
          this.setState({ members })
        }
      )
      .catch((err) => console.log(err))
  }

  componentDidUpdate (prevProps) {
    if (prevProps.lastChanged !== this.props.lastChanged) {
      this.loadMembers()
    }
  }

  render () {
    return (
      <div className='container my-5'>
        <div className='row footer-bottom d-flex justify-content-between align-items-center'>

          <Paper style={{ height: 500, width: '100%' }}>
            <VirtualizedTable
              rowCount={this.state.members.length}
              rowGetter={({ index }) => this.state.members[index]}
              columns={[
                {
                  width: 200,
                  label: 'Name',
                  dataKey: DISPLAY_NAME
                },
                {
                  width: 200,
                  label: 'Email',
                  dataKey: EMAIL
                  // numeric: true
                },
                {
                  width: 160,
                  label: 'Phone',
                  dataKey: PHONE
                  // numeric: true
                },
                {
                  width: 200,
                  label: 'Address',
                  dataKey: 'address'
                  // numeric: true
                },
                {
                  width: 120,
                  label: 'Birthday',
                  dataKey: DATE_OF_BIRTH
                  //numeric: true
                },
                {
                  width: 80,
                  label: 'Gender',
                  dataKey: GENDER
                  //numeric: true
                },
                {
                  width: 80,
                  label: 'Shirt Gender',
                  dataKey: SHIRT_GENDER
                  //numeric: true
                },
                {
                  width: 80,
                  label: 'Shirt Size',
                  dataKey: SHIRT_SIZE
                  //numeric: true
                },
                {
                  width: 180,
                  label: 'Membership expires',
                  dataKey: MEMBERSHIP_EXPIRES_AT
                  //numeric: true
                }
              ]}
            />
          </Paper>
        </div>
      </div>
    )
  }
}

UsersPage.propTypes = {
  lastChanged: PropTypes.number.isRequired
}

const mapStateToProps = (state) => {
  return {
    lastChanged: state.currentUser.lastChanged
  }
}


export default connect(mapStateToProps)(UsersPage)
