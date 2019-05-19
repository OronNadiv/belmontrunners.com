// import { fromJS } from 'immutable'
//
// const initialState = fromJS({
//   isSigningIn: false,
//   signInError: null,
//   isSigningOut: false,
//   signOutError: null
// })
//
// const ACTION_HANDLERS = {
//   [SIGN_IN_START]: (state = initialState) => {
//     state = state.merge(fromJS({
//       isSigningIn: true,
//       signInError: null
//     }))
//     return state
//   },
//   [SIGN_IN_SUCCEEDED]: (state = initialState) => {
//     state = state.merge(fromJS({
//       isSigningIn: false,
//       signInError: null
//     }))
//     return state
//   },
//   [SIGN_IN_FAILED]: (state = initialState, { error }) => {
//     state = state.merge(fromJS({
//       isSigningIn: false,
//       signInError: error
//     }))
//     return state
//   },
//
//   [SIGN_UP_START]: (state = initialState) => {
//     state = state.merge(fromJS({
//       isSigningUp: true,
//       signUpError: null
//     }))
//     return state
//   },
//   [SIGN_UP_SUCCEEDED]: (state = initialState) => {
//     state = state.merge(fromJS({
//       isSigningUp: false,
//       signUpError: null
//     }))
//     return state
//   },
//   [SIGN_UP_FAILED]: (state = initialState, { error }) => {
//     state = state.merge(fromJS({
//       isSigningUp: false,
//       signUpError: error
//     }))
//     return state
//   },
//
//
//   [SIGN_OUT_START]: (state = initialState) => {
//     state = state.merge(fromJS({
//       isSigningOut: true,
//       signOutError: null
//     }))
//     return state
//   },
//   [SIGN_OUT_SUCCEEDED]: (state = initialState) => {
//     state = state.merge(fromJS({
//       isSigningOut: false,
//       signOutError: null
//     }))
//     return state
//   },
//   [SIGN_OUT_FAILED]: (state = initialState, { error }) => {
//     state = state.merge(fromJS({
//       isSigningOut: false,
//       signOutError: error
//     }))
//     return state
//   },
//
//   [SEND_PASSWORD_RESET_EMAIL_START]: (state = initialState) => {
//     state = state.merge(fromJS({
//       isSendingPasswordResetEmail: true,
//       sendPasswordResetEmailError: null
//     }))
//     return state
//   },
//   [SEND_PASSWORD_RESET_EMAIL_SUCCEEDED]: (state = initialState) => {
//     state = state.merge(fromJS({
//       isSendingPasswordResetEmail: false,
//       sendPasswordResetEmailError: null
//     }))
//     return state
//   },
//   [SEND_PASSWORD_RESET_EMAIL_FAILED]: (state = initialState, { error }) => {
//     state = state.merge(fromJS({
//       isSendingPasswordResetEmail: false,
//       sendPasswordResetEmailError: error
//     }))
//     return state
//   }
// }
//
// export default function reducer (state = initialState, action = {}) {
//   const handler = ACTION_HANDLERS[action.type]
//   return handler ? handler(state, action) : state
// }
