import { fromJS } from 'immutable'
import { SIGN_OUT_FAILED, SIGN_OUT_START, SIGN_OUT_SUCCEEDED } from './identityActions'

const initialState = fromJS({
  isSigningIn: false,
  signInError: null,
  isSigningOut: false,
  signOutError: null
})

const ACTION_HANDLERS = {
  [SIGN_OUT_START]: (state = initialState) => {
    state = state.merge(fromJS({
      isSigningOut: true,
      signOutError: null
    }))
    return state
  },
  [SIGN_OUT_SUCCEEDED]: (state = initialState) => {
    state = state.merge(fromJS({
      isSigningOut: false,
      signOutError: null
    }))
    return state
  },
  [SIGN_OUT_FAILED]: (state = initialState, { error }) => {
    state = state.merge(fromJS({
      isSigningOut: false,
      signOutError: error
    }))
    return state
  }
}

export default function reducer (state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
