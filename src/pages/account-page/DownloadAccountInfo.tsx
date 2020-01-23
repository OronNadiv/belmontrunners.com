import 'firebase/auth'
import { Map as IMap } from 'immutable'
import React, { useState } from 'react'
import * as PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'underscore'
import { Button, Card, CardContent, Typography } from '@material-ui/core'
import UpdateUserData from '../../components/HOC/UpdateUserData'
// @ts-ignore
import DownloadButton from 'react-dfb'
import moment from 'moment'
import { IRedisState, IUser } from '../../entities/User'

interface Props {
  firebaseUser: firebase.User
  userData: any,
  isSubmitting: boolean
}

function DownloadAccountInfo({ firebaseUser, userData, isSubmitting }: Props) {
  const userDataJS: IUser = userData.toJS()

  const [downloadData, setDownloadData] = useState()

  const handleDownloadPI = () => {
    setDownloadData({
      mime: 'application/json',
      fileName: `account-${moment().format()}.txt`,
      contentBase64: btoa(JSON.stringify(userDataJS, null, 2))
    })
  }

  return (
    firebaseUser && (
      <Card className="d-flex flex-row align-content-center my-4">
        <div className="mr-auto">
          <CardContent>
            <Typography component="h6" variant="h6">
              Export account data
            </Typography>
            <Typography color="textSecondary">
              Get all your personal information
            </Typography>
          </CardContent>
        </div>
        <span className="px-3 d-flex">
          <div className="align-self-center">
            <DownloadButton
              downloadData={downloadData}
              onClick={handleDownloadPI}
            >
              <Button
                variant="contained"
                color="primary"
                disabled={isSubmitting}
              >
                Download
              </Button>
            </DownloadButton>
          </div>
        </span>
      </Card>
    )
  )
}

DownloadAccountInfo.propTypes = {
  // from HOC
  updateUserData: PropTypes.func.isRequired,

  firebaseUser: PropTypes.object.isRequired,
  userData: PropTypes.object.isRequired,

  onSubmitting: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
}

const mapStateToProps = ({ currentUser: { firebaseUser, userData } }: IRedisState) => {
  return {
    firebaseUser,
    // @ts-ignore
    userData: userData || new IMap()
  }
}

export default compose(
  UpdateUserData,
  connect(mapStateToProps)
)(DownloadAccountInfo)
