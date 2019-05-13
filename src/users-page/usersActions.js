import firebase from 'firebase'
import 'firebase/auth'
import "firebase/firestore"

const publicIp = require('public-ip')

const PREFIX = 'USERS'

export const LOAD_START = `${PREFIX}_MEMBERS_LOAD_START`
export const LOAD_SUCCEEDED = `${PREFIX}_MEMBERS_LOAD_SUCCEEDED`
export const LOAD_FAILED = `${PREFIX}_MEMBERS_LOAD_FAILED`

export const loadMembers = () => {
  return (dispatch) => {
    dispatch({
      type: MEMBERS_LOAD_START
    })

    const currentVisit = firebase.firestore().doc(`users`)
    return currentVisit.get()
      .then((users) => {
        dispatch({
          type: MEMBERS_LOAD_SUCCEEDED,
          users
        })
      }
      .catch((err) => {
        dispatch({
          type: MEMBERS_LOAD_FAILED,
          err
        })
      }
  }
}
