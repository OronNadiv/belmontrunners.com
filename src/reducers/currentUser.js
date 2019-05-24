import firebase from 'firebase'
import 'firebase/auth'

const PREFIX = 'CURRENT_USER'

export const FETCHING_CURRENT_USER = `${PREFIX}_FETCHING_CURRENT_USER`
export const FETCHED_CURRENT_USER = `${PREFIX}_FETCHED_CURRENT_USER`
let isRegistered
export const fetchCurrentUser = () => {
  return (dispatch, getState) => {
    if (getState().currentUser.isLoading || getState().currentUser.lastChanged) {
      return
    }
    dispatch({
      type: FETCHING_CURRENT_USER
    })
    if (!isRegistered) {
      isRegistered = true
      firebase.auth().onAuthStateChanged(() => {
        dispatch({
          type: FETCHED_CURRENT_USER
        })
      })
    }
  }
}

const initialState = {
  isLoading: false,
  lastChanged: 0
}

const ACTION_HANDLERS = {
  [FETCHING_CURRENT_USER]: (state = initialState) => {
    state = {
      ...state,
      isLoading: true
    }
    return state
  },
  [FETCHED_CURRENT_USER]: (state = initialState) => {
    state = {
      ...state,
      isLoading: false,
      lastChanged: new Date().valueOf()
    }
    return state
  }
}

export default function reducer (state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
