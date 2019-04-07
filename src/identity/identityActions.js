import firebase from 'firebase'
import 'firebase/auth'

const PREFIX = 'IDENTITY'

export const SIGN_IN_START = `${PREFIX}_SIGN_IN_START`
export const SIGN_IN_SUCCEEDED = `${PREFIX}_SIGN_IN_SUCCEEDED`
export const SIGN_IN_FAILED = `${PREFIX}_SIGN_IN_FAILED`

export const SIGN_UP_START = `${PREFIX}_SIGN_UP_START`
export const SIGN_UP_SUCCEEDED = `${PREFIX}_SIGN_UP_SUCCEEDED`
export const SIGN_UP_FAILED = `${PREFIX}_SIGN_UP_FAILED`

export const SIGN_OUT_START = `${PREFIX}SIGN_OUT_START`
export const SIGN_OUT_SUCCEEDED = `${PREFIX}_SIGN_OUT_SUCCEEDED`
export const SIGN_OUT_FAILED = `${PREFIX}_SIGN_OUT_FAILED`

export const SEND_PASSWORD_RESET_EMAIL_START = `${PREFIX}SEND_PASSWORD_RESET_EMAIL_START`
export const SEND_PASSWORD_RESET_EMAIL_SUCCEEDED = `${PREFIX}_SEND_PASSWORD_RESET_EMAIL_SUCCEEDED`
export const SEND_PASSWORD_RESET_EMAIL_FAILED = `${PREFIX}_SEND_PASSWORD_RESET_EMAIL_FAILED`

export const signIn = (email, password) => {
  return (dispatch) => {
    dispatch({
      type: SIGN_IN_START
    })

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        dispatch({
          type: SIGN_IN_SUCCEEDED
        })
      })
      .catch((error) => {
        dispatch({
          type: SIGN_IN_FAILED,
          error
        })
      })
  }
}
export const signUp = (firstname, lastname, email, password) => {
  return (dispatch) => {
    dispatch({
      type: SIGN_UP_START
    })

    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('calling updateProfile')
        return firebase.auth().currentUser.updateProfile({
          displayName: `${firstname} ${lastname}`
        })
          .then(() => {
            dispatch({
              type: SIGN_UP_SUCCEEDED
            })

          })
      }).catch((error) => {
      dispatch({
        type: SIGN_UP_FAILED,
        error
      })
    })
  }
}

export const signOut = () => {
  return (dispatch) => {
    dispatch({
      type: SIGN_OUT_START
    })

    firebase.auth().signOut()
      .then(() => {
        dispatch({
          type: SIGN_OUT_SUCCEEDED
        })
      })
      .catch((error) => {
        dispatch({
          type: SIGN_OUT_FAILED,
          error
        })
      })
  }
}

export const sendPasswordResetEmail = (email) => {
  return (dispatch) => {
    dispatch({
      type: SEND_PASSWORD_RESET_EMAIL_START
    })

    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        dispatch({
          type: SEND_PASSWORD_RESET_EMAIL_SUCCEEDED
        })
      })
      .catch((error) => {
        dispatch({
          type: SEND_PASSWORD_RESET_EMAIL_FAILED,
          error
        })
      })
  }
}
