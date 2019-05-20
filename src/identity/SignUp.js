import React, { Component } from 'react'

import './Signup.scss'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import SignUpStepper from './SignUpStepper'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'

class SignUp extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fullName: '',
      email: '',
      password: '',
      invalidFullNameMessage: '',
      invalidEmailMessage: '',
      invalidPasswordMessage: '',
      generalErrorMessage: ''
    }
  }

  render () {
    console.log('Signup render called')
    const { close } = this.state
    const { currentUser } = this.props

    if (currentUser || close) {
      return <Redirect
        to={{
          pathname: "/",
          state: { from: '/join' }
        }}
      />
    }

    return (
      <Dialog
        open
        // fullWidth
        maxWidth='sm'
        onClose={() => this.setState({ close: true })}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>
          Join Us
        </DialogTitle>

        <DialogContent>
          <SignUpStepper />
        </DialogContent>
      </Dialog>
    )
  }
}

SignUp.propTypes = {
  currentUser: PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser.get('data')
  }
}

export default connect(mapStateToProps)(SignUp)
