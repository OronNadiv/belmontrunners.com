import React, { useState } from 'react'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { sendEmailVerification as sendEmailVerificationAction } from '../../reducers/currentUser'
import { Button, Card, CardContent, Typography } from '@material-ui/core'
import ChangeEmailDialog from './ChangeEmailDialog'
import { IRedisState } from '../../entities/User'
import { User } from 'firebase/auth'

interface Props {
  sendEmailVerification: () => void
  firebaseUser: User
  isSubmitting: boolean
}

function ChangeEmail({ sendEmailVerification, firebaseUser, isSubmitting }: Props) {
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)

  const sendVerificationEmail = async () => {
    // todo wait for confimation the way we do with updateUserData
    sendEmailVerification()
    setEmailVerificationSent(true)
  }

  return (
    firebaseUser && (
      <>
        <Card className="d-flex flex-row align-content-center my-4">
          <div className="mr-auto">
            <CardContent>
              <Typography component="h6" variant="h6">
                Email Address
              </Typography>
              <Typography color="textSecondary">
                {firebaseUser.email} (
                {firebaseUser.emailVerified === false ? (
                  <span className="text-danger text-center">not verified</span>
                ) : (
                  <span className="text-success text-center">verified</span>
                )}
                )
                <br />
                <small>
                  {!firebaseUser.emailVerified && !emailVerificationSent && (
                    <span>
                        Click{' '}
                      <span
                        onClick={() => sendVerificationEmail()}
                        className="text-primary"
                      >
                          here
                        </span>{' '}
                      to send me a verification email
                      </span>
                  )}
                  {!firebaseUser.emailVerified && emailVerificationSent && (
                    <span className="text-success text-center">Sent</span>
                  )}
                </small>
              </Typography>
            </CardContent>
          </div>
          <span className="px-3 d-flex">
            <Button
              variant="contained"
              color="primary"
              className="align-self-center"
              onClick={() => setShowChangeEmailDialog(true)}
              disabled={isSubmitting}
            >
              Change Email
            </Button>
          </span>
        </Card>

        {showChangeEmailDialog && (
          <ChangeEmailDialog
            // @ts-ignore
            onClose={() => setShowChangeEmailDialog(false)}
          />
        )}
      </>
    )
  )
}

ChangeEmail.propTypes = {
  sendEmailVerification: PropTypes.func.isRequired,
  firebaseUser: PropTypes.object.isRequired,
  onSubmitting: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

const mapDispatchToProps = {
  sendEmailVerification: sendEmailVerificationAction
}

const mapStateToProps = ({ currentUser: { firebaseUser } }: IRedisState) => {
  return {
    firebaseUser
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
// @ts-ignore
)(ChangeEmail)
