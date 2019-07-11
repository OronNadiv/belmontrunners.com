import 'firebase/auth'
import React, { useState } from 'react'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import { Button, Card, CardContent, Typography } from '@material-ui/core'
import ChangeEmailDialog from './ChangeEmailDialog'

function ChangeEmail ({ sendEmailVerification, currentUser, onSubmitting, isSubmitting }) {

  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState()
  const [emailVerificationSent, setEmailVerificationSent] = useState()

  const sendVerificationEmail = async () => {
    // todo wait for confimation the way we do with updateUserData
    sendEmailVerification()
    setEmailVerificationSent(true)
  }

  return currentUser &&
    <>
      <Card className='d-flex flex-row align-content-center my-4'>
        <div className='mr-auto'>
          <CardContent>
            <Typography component="h6" variant="h6">
              Email Address
            </Typography>
            <Typography color="textSecondary">
              {currentUser.email} (
              {
                currentUser.emailVerified === false ?
                  <span className='text-danger text-center'>not verified</span> :
                  <span className='text-success text-center'>verified</span>
              }
              )
              <div>
                <small>
                  {
                    !currentUser.emailVerified &&
                    !emailVerificationSent &&
                    <span>
                        Click <span onClick={() => sendVerificationEmail()} className="text-primary">here</span> to
                        send me a verification email
                      </span>
                  }
                  {
                    !currentUser.emailVerified &&
                    emailVerificationSent &&
                    <span className='text-success text-center'>Sent</span>
                  }
                </small>
              </div>
            </Typography>
          </CardContent>
        </div>
        <span className='px-3 d-flex'>
            <Button variant="contained" color="primary" className='align-self-center'
                    onClick={() => setShowChangeEmailDialog(true)} disabled={isSubmitting}>
              Change Email
            </Button>
          </span>
      </Card>
      {
        showChangeEmailDialog &&
        <ChangeEmailDialog onClose={() => setShowChangeEmailDialog(false)} />
      }
    </>
}

ChangeEmail.propTypes = {
  sendEmailVerification: PropTypes.func.isRequired,
  currentUser: PropTypes.object.isRequired,
  onSubmitting: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

const mapDispatchToProps = {
  sendEmailVerification: sendEmailVerificationAction
}

const mapStateToProps = ({ currentUser: { currentUser } }) => {
  return {
    currentUser
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangeEmail)
