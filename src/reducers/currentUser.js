import firebase from 'firebase'
import Promise from 'bluebird'
import * as Sentry from '@sentry/browser'

const PREFIX = 'CURRENT_USER'

export const FETCHING_CURRENT_USER = `${PREFIX}_FETCHING_CURRENT_USER`
export const FETCHED_CURRENT_USER = `${PREFIX}_FETCHED_CURRENT_USER`

export const USER_DATA_UPDATE_REQUEST = `${PREFIX}USER_DATA_UPDATE_REQUEST`
export const USER_DATA_UPDATE_SUCCESS = `${PREFIX}USER_DATA_UPDATE_SUCCESS`
export const USER_DATA_UPDATE_FAILURE = `${PREFIX}USER_DATA_UPDATE_FAILURE`

let isRegistered

const fetchUserData = async () => {
  const userRef = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
  const userDoc = await userRef.get()
  const userData = userDoc.data() || {}
  return userData
}

const fetchPermissions = async () => {
  const { docUsersRead, docUsersWrite, docUsersDelete, docSubscribersRead, docSubscribersWrite } = await Promise
    .props({
      docUsersRead: firebase.firestore().doc('permissions/usersRead').get(),
      docUsersWrite: firebase.firestore().doc('permissions/usersWrite').get(),
      docUsersDelete: firebase.firestore().doc('permissions/usersDelete').get(),
      docSubscribersRead: firebase.firestore().doc('permissions/subscribersRead').get(),
      docSubscribersWrite: firebase.firestore().doc('permissions/subscribersWrite').get()
    })
  return {
    usersRead: docUsersRead.data(),
    usersWrite: docUsersWrite.data(),
    usersDelete: docUsersDelete.data(),
    subscribersRead: docSubscribersRead.data(),
    subscribersWrite: docSubscribersWrite.data()
  }
}

export const fetchCurrentUser = () => {
  return (dispatch, getState) => {
    if (getState().currentUser.isCurrentUserLoading) {
      return
    }
    dispatch({
      type: FETCHING_CURRENT_USER
    })
    if (!isRegistered) {
      isRegistered = true
      firebase.auth().onAuthStateChanged(async () => {
        if (!firebase.auth().currentUser) {
          console.log('current user is null')
          dispatch({
            type: FETCHED_CURRENT_USER,
            data: {
              currentUser: null,
              permissions: { usersRead: {}, usersWrite: {} },
              userData: {}
            }
          })
        } else {
          console.log('current user is not null')
          try {
            const [permissions, userData] = await Promise
              .all([fetchPermissions(), fetchUserData()])
            console.log('permissions', permissions)
            console.log('userData', userData)
            dispatch({
              type: FETCHED_CURRENT_USER,
              data: {
                currentUser: firebase.auth().currentUser,
                permissions,
                userData
              }
            })
          } catch (error) {
            Sentry.captureException(error)
            console.error(error)
          }
        }
      })
    }
  }
}

export const updateUserData = (values, options) => {
  return async (dispatch, getState) => {
    if (getState().currentUser.isCurrentUserLoading) {
      return
    }
    dispatch({
      type: USER_DATA_UPDATE_REQUEST
    })
    const userRef = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
    try {
      const res = await userRef.set(values, options)
      console.log('res', res)
      const userData = await fetchUserData()
      dispatch({
        type: USER_DATA_UPDATE_SUCCESS,
        data: userData
      })
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
      dispatch({
        type: USER_DATA_UPDATE_FAILURE,
        error
      })
    }
  }
}

const initialState = {
  isCurrentUserLoading: false,
  isCurrentUserLoaded: false,
  currentUser: null,
  permissions: {
    usersRead: {},
    usersWrite: {},
    usersDelete: {},
    subscribersRead: {}
  },
  userData: {},
  userDataUpdating: false,
  userDataUpdateError: null
}

const ACTION_HANDLERS = {
  [FETCHING_CURRENT_USER]: (state = initialState) => {
    state = {
      ...state,
      isCurrentUserLoading: true,
      isCurrentUserLoaded: false
    }
    return state
  },
  [FETCHED_CURRENT_USER]: (state = initialState, { data: { permissions, currentUser, userData } }) => {
    state = {
      ...state,
      currentUser,
      permissions,
      userData,
      isCurrentUserLoading: false,
      isCurrentUserLoaded: true
    }
    return state
  },


  [USER_DATA_UPDATE_REQUEST]: (state = initialState) => {
    state = {
      ...state,
      userDataUpdating: true,
      userDataUpdateError: null
    }
    return state
  },
  [USER_DATA_UPDATE_SUCCESS]: (state = initialState, { data }) => {
    state = {
      ...state,
      userData: data,
      userDataUpdating: false,
      userDataUpdateError: null
    }
    return state
  },
  [USER_DATA_UPDATE_FAILURE]: (state = initialState, { error }) => {
    state = {
      ...state,
      userDataUpdating: false,
      userDataUpdateError: error
    }
    return state
  }
}

export default function reducer (state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
