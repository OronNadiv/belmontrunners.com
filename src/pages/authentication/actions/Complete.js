import 'firebase/auth'
import firebase from 'firebase'
import React, { Component } from 'react'
import queryString from 'query-string'
import PropTypes from 'prop-types'
import { ROOT } from '../../../urls'
import { Redirect, withRouter } from 'react-router-dom'
import {
  EXPIRED_ACTION_CODE,
  INVALID_ACTION_CODE_INVALID_URL,
  USER_DISABLED_INVALID_URL,
  USER_NOT_FOUND_INVALID_URL
} from '../../../messages'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'

class Complete extends Component {
  constructor (props) {
    console.log('Complete ctor called.')
    super(props)
    this.state = {}
  }

  processError (error) {
    const { code, message } = error
    console.log('code:', code, 'message:', message)
    switch (code) {
      case 'auth/expired-action-code':
        this.setState({ errorMessage: EXPIRED_ACTION_CODE })
        break
      case 'auth/invalid-action-code':
        this.setState({ errorMessage: INVALID_ACTION_CODE_INVALID_URL })
        break
      case 'auth/user-disabled':
        this.setState({ errorMessage: USER_DISABLED_INVALID_URL })
        break
      case 'auth/user-not-found':
        this.setState({ errorMessage: USER_NOT_FOUND_INVALID_URL })
        break
      default:
        console.error('confirmPasswordReset',
          'code:', code,
          'message:', message)
        this.setState({ errorMessage: message })
    }
  }

  componentDidMount () {
    const { search } = this.props.location

    const query = queryString.parse(search) || {}
    const { mode, oobCode } = query

    try {
      firebase.auth().checkActionCode(oobCode)
        .then((info) => {
          let redirect
          if (mode) {
            redirect = (
              <Redirect to={{
                pathname: `/${mode}`,
                state: {
                  info,
                  query
                }
              }} />
            )
          } else {
            redirect = <Redirect to={ROOT} />
          }

          this.setState({ redirect })
        })
        .catch((error) => {
          console.log('in catch')
          this.processError(error)
        })
    } catch (error) {
      console.log('in try-catch')
      this.processError(error)
    }
  }

  render () {
    const { redirect, errorMessage } = this.state

    if (redirect) {
      return redirect
    } else if (!errorMessage) {
      return ''
    }
    return (<Dialog
        open
        fullWidth
        maxWidth='xs'
        onClose={() => this.setState({ redirect: <Redirect to={ROOT} /> })}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>
          Error
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            <div className='text-danger text-center'>
              {errorMessage}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this.setState({ redirect: <Redirect to={ROOT} /> })}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

Complete.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    search: PropTypes.string.isRequired
  }).isRequired
}

export default withRouter(Complete)
