import React, { useState } from 'react'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Card, CardContent, Typography } from '@material-ui/core'
import ChangePasswordDialog from './ChangePasswordDialog'
import { IRedisState } from '../../entities/User'
import { User } from 'firebase/auth'

interface Props {
  firebaseUser: User
  isSubmitting: boolean
}

function ChangeEmail({ firebaseUser, isSubmitting }: Props) {
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(
    false
  )

  return (
    firebaseUser && (
      <>
        <Card className="d-flex flex-row align-content-center my-4">
          <div className="mr-auto">
            <CardContent>
              <Typography component="h6" variant="h6">
                Password
              </Typography>
              <Typography color="textSecondary">
                Change your password
              </Typography>
            </CardContent>
          </div>
          <span className="px-3 d-flex">
            <Button
              variant="contained"
              color="primary"
              className="align-self-center"
              onClick={() => setShowChangePasswordDialog(true)}
              disabled={isSubmitting}
            >
              Change Password
            </Button>
          </span>
        </Card>
        {showChangePasswordDialog && (
          <ChangePasswordDialog
            // @ts-ignore
            onClose={() => setShowChangePasswordDialog(false)}
          />
        )}
      </>
    )
  )
}

ChangeEmail.propTypes = {
  firebaseUser: PropTypes.object.isRequired,
  onSubmitting: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

const mapStateToProps = ({ currentUser: { firebaseUser } }: IRedisState) => {
  return {
    firebaseUser
  }
}

// @ts-ignore
export default connect(mapStateToProps)(ChangeEmail)
