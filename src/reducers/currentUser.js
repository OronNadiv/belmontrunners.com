import firebase from 'firebase'
import Promise from 'bluebird'

const PREFIX = 'CURRENT_USER'

export const FETCHING_CURRENT_USER = `${PREFIX}_FETCHING_CURRENT_USER`
export const FETCHED_CURRENT_USER = `${PREFIX}_FETCHED_CURRENT_USER`

export const USER_DATA_UPDATE_REQUEST = `${PREFIX}USER_DATA_UPDATE_REQUEST`
export const USER_DATA_UPDATE_SUCCESS = `${PREFIX}USER_DATA_UPDATE_SUCCESS`
export const USER_DATA_UPDATE_FAILURE = `${PREFIX}USER_DATA_UPDATE_FAILURE`

let isRegistered

const fetchUserData = () => {
  const userRef = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
  return userRef
    .get()
    .then((userDoc) => {
      const userData = userDoc.data() || {}
      return userData
    })
}

const fetchPermissions = () => {
  return Promise
    .props({
      docUsersRead: firebase.firestore().doc('permissions/usersRead').get(),
      docUsersWrite: firebase.firestore().doc('permissions/usersWrite').get(),
      docUsersDelete: firebase.firestore().doc('permissions/usersDelete').get(),
      docSubscribersRead: firebase.firestore().doc('permissions/subscribersRead').get(),
      docSubscribersWrite: firebase.firestore().doc('permissions/subscribersWrite').get()
    })
    .then(({ docUsersRead, docUsersWrite, docUsersDelete, docSubscribersRead, docSubscribersWrite }) => {
      return {
        usersRead: docUsersRead.data(),
        usersWrite: docUsersWrite.data(),
        usersDelete: docUsersDelete.data(),
        subscribersRead: docSubscribersRead.data(),
        subscribersWrite: docSubscribersWrite.data()
      }
    })
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
      firebase.auth().onAuthStateChanged(() => {
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
          return Promise
            .all([fetchPermissions(), fetchUserData()])
            .spread((permissions, userData) => {
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
            })
        }
      })
    }
  }
}

export const updateUserData = (values, options) => {
  return (dispatch, getState) => {
    if (getState().currentUser.isCurrentUserLoading) {
      return
    }
    dispatch({
      type: USER_DATA_UPDATE_REQUEST
    })
    const userRef = firebase.firestore().doc(`users/${firebase.auth().currentUser.uid}`)
    return userRef
      .set(values, options)
      .then((res) => {
        console.log('res', res)
        return fetchUserData()
      })
      .then((userData) => {
        dispatch({
          type: USER_DATA_UPDATE_SUCCESS,
          data: userData
        })
      })
      .catch((error) => {
        dispatch({
          type: USER_DATA_UPDATE_FAILURE,
          error
        })
      })
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
