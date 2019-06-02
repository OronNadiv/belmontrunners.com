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
      docRead: firebase.firestore().doc('permissions/usersRead').get(),
      docWrite: firebase.firestore().doc('permissions/usersWrite').get(),
      docDelete: firebase.firestore().doc('permissions/usersDelete').get()
    })
    .then(({ docRead, docWrite, docDelete }) => {
      const dataRead = docRead.data()
      const dataWrite = docWrite.data()
      const dataDelete = docDelete.data()
      return {
        usersRead: dataRead,
        usersWrite: dataWrite,
        usersDelete: dataDelete
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
    usersWrite: {}
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
    console.log('state:', state,
      'currentUser:', currentUser,
      'permissions:', permissions,
      'userData:', userData
    )
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
    console.log('state:', state)
    state = {
      ...state,
      userDataUpdating: true,
      userDataUpdateError: null
    }
    return state
  },
  [USER_DATA_UPDATE_SUCCESS]: (state = initialState, { data }) => {
    console.log('state:', state, 'data:', data)
    state = {
      ...state,
      userData: data,
      userDataUpdating: false,
      userDataUpdateError: null
    }
    return state
  },
  [USER_DATA_UPDATE_FAILURE]: (state = initialState, { error }) => {
    console.log('state:', state, 'error:', error)
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
