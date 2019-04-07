import { fromJS } from 'immutable'
import firebase from 'firebase'
import 'firebase/auth'

const PREFIX = 'CURRENT_USER'

export const FETCHING_CURRENT_USER = `${PREFIX}_FETCHING_CURRENT_USER`
export const FETCHED_CURRENT_USER = `${PREFIX}_FETCHED_CURRENT_USER`
let isRegistered
export const fetchCurrentUser = () => {
  return (dispatch, getState) => {
    if (getState().currentUser.get('isLoading') || getState().currentUser.get('isLoaded')) {
      return
    }
    dispatch({
      type: FETCHING_CURRENT_USER
    })
    if (!isRegistered) {
      isRegistered = true
      firebase.auth().onAuthStateChanged((user) => {
        dispatch({
          type: FETCHED_CURRENT_USER
        })
      })
    }
  }
}

const initialState = fromJS({
  data: null,
  isLoaded: false,
  isLoading: false
})

const ACTION_HANDLERS = {
  [FETCHED_CURRENT_USER]: (state = initialState) => {
    console.log('123', firebase.auth().currentUser)
    state = state.merge(
      fromJS({
        data: firebase.auth().currentUser,
        isLoaded: true,
        isLoading: false
      })
    )
    return state
  },
  [FETCHING_CURRENT_USER]: (state = initialState) => {
    state = state.set('isLoading', true)
    return state
  }
}

export default function reducer (state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
