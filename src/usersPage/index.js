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
            data.address = data.address1
            if (data.address2) {
              data.address += '\n' + data.address2
            }
            data.address += '\r\n' + data.city
            data.address += '\n' + data.state + ' ' + data.zip
            const number = phoneUtil.parseAndKeepRawInput(data.phone, 'US')

            data.phone = phoneUtil.format(number, PNF.NATIONAL)
            data.dateOfBirth = moment(data.dateOfBirth).format('MMMM D')
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
      <Paper style={{ height: 400, width: '100%' }}>
        <VirtualizedTable
          rowCount={this.state.members.length}
          rowGetter={({ index }) => this.state.members[index]}
          columns={[
            {
              width: 200,
              label: 'Name',
              dataKey: 'displayName'
            },
            {
              width: 200,
              label: 'Email',
              dataKey: 'email'
              // numeric: true
            },
            {
              width: 160,
              label: 'Phone',
              dataKey: 'phone'
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
              dataKey: 'dateOfBirth'
              //numeric: true
            },
            {
              width: 80,
              label: 'Shirt Gender',
              dataKey: 'shirtGender'
              //numeric: true
            },
            {
              width: 80,
              label: 'Shirt Size',
              dataKey: 'shirtSize'
              //numeric: true
            }
          ]}
        />
      </Paper>
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
