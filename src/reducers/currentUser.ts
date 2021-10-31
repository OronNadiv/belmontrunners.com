import * as Sentry from '@sentry/browser'
import { fromJS } from 'immutable'
import { ICurrentUser, IUserPermissions, IRedisState, IUser, IUserOptionalProps } from '../entities/User'
import { auth, firestore } from '../firebase'
import { Action, Dispatch } from 'redux'
import { User, sendEmailVerification as sendEmailVerificationFirebase } from 'firebase/auth'
import {collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { props } from 'bluebird'

const moment = require('moment')

const PREFIX = 'CURRENT_USER'

export const FETCHING_CURRENT_USER = `${PREFIX}_FETCHING_CURRENT_USER`
export const FETCHED_CURRENT_USER = `${PREFIX}_FETCHED_CURRENT_USER`

export const USER_DATA_UPDATE_REQUEST = `${PREFIX}USER_DATA_UPDATE_REQUEST`
export const USER_DATA_UPDATE_SUCCESS = `${PREFIX}USER_DATA_UPDATE_SUCCESS`
export const USER_DATA_UPDATE_FAILURE = `${PREFIX}USER_DATA_UPDATE_FAILURE`

let isRegistered: boolean

const fetchUserData = async () => {
  const firebaseUser = auth.currentUser
  if (!firebaseUser) {
    throw new Error('firebaseUser is null')
  }
  const usersRef = collection(firestore, "users");

  const userRef = doc(usersRef, firebaseUser.uid)
  const userDoc = await getDoc(userRef)
  return userDoc.data() || {} as IUser
}

const fetchPermissions = async () => {
  const permissionsRef = collection(firestore, "permissions");

  const {
    docUsersRead,
    docUsersWrite,
    docUsersDelete,
    docContactsRead,
    docContactsWrite
  } = await props({
    docUsersRead:
      getDoc(doc(permissionsRef, 'usersRead')),
    docUsersWrite:
      getDoc(doc(permissionsRef, 'usersWrite')),
    docUsersDelete:
      getDoc(doc(permissionsRef, 'usersDelete')),
    docContactsRead:
      getDoc(doc(permissionsRef, 'subscribersRead')),
    docContactsWrite:
      getDoc(doc(permissionsRef, 'subscribersWrite'))
  })
  return {
    usersRead: docUsersRead.data(),
    usersWrite: docUsersWrite.data(),
    usersDelete: docUsersDelete.data(),
    contactsRead: docContactsRead.data(),
    contactsWrite: docContactsWrite.data()
  }
}

export type IFetchCurrentUser = () => (dispatch: Dispatch, getState: () => IRedisState) => void
export const fetchCurrentUser: IFetchCurrentUser = () => {
  return (dispatch: Dispatch, getState: () => IRedisState) => {
    if (getState().currentUser.isCurrentUserLoading) {
      return
    }
    dispatch({
      type: FETCHING_CURRENT_USER
    })
    if (!isRegistered) {
      isRegistered = true
      console.log('isRegistered = true')
      auth.onAuthStateChanged(async () => {
        console.log('auth.onAuthStateChanged called')
        if (!auth.currentUser) {
          console.log('current user is null')
          const data: IFetchedCurrentUserData = {
            firebaseUser: initialState.firebaseUser,
            permissions: initialState.permissions,
            userData: initialState.userData
          }
          dispatch({
            type: FETCHED_CURRENT_USER,
            data
          })
        } else {
          console.log('current user is not null')
          try {
            const [permissions, userData] = await Promise.all([
              fetchPermissions(),
              fetchUserData()
            ])
            const firebaseUser = auth.currentUser
            console.log('permissions', permissions)
            console.log('userData', userData)
            const data: IFetchedCurrentUserData = {
              firebaseUser,
              permissions : permissions as IUserPermissions,
              userData
            }
            dispatch({
              type: FETCHED_CURRENT_USER,
              data
            })
            const {
              metadata: { creationTime, lastSignInTime },
              emailVerified
            } = firebaseUser
            console.log('emailVerified:', emailVerified)
            try {
              if (!emailVerified) {
                const emailVerificationSentAt = userData.emailVerificationSentAt
                console.log('emailVerificationSentAt:', emailVerificationSentAt)

                if (
                  !emailVerificationSentAt ||
                  moment(emailVerificationSentAt)
                    .add(1, 'day')
                    .isBefore(moment())
                ) {
                  await sendEmailVerification()(dispatch, getState)
                }
              }
            } catch (error) {
              Sentry.captureException(error)
              console.error('email verification.', error)
            }
            console.log(
              'auth.currentUser:',
              auth.currentUser
            )
            const createdAt: string = moment(creationTime)
              .utc()
              .format()
            const lastSignedInAt: string = moment(lastSignInTime)
              .utc()
              .format()
            const values: IUserOptionalProps = { createdAt, lastSignedInAt, emailVerified }
            await updateUserData(values, { merge: true })(dispatch, getState)
          } catch (error) {
            console.error('error while initializing firebase user.', error)
            Sentry.captureException(error)
          }
        }
      })
    }
  }
}
export type ISendEmailVerification = () => (dispatch: Dispatch, getState: () => IRedisState) => Promise<void>
export const sendEmailVerification: ISendEmailVerification = () => {
  return async (dispatch: Dispatch, getState: () => IRedisState) => {
    const firebaseUser = getState().currentUser.firebaseUser
    if (!firebaseUser) {
      throw new Error('firebaseUser is null')
    }
    await sendEmailVerificationFirebase(firebaseUser)
    const emailVerificationSentAt: string = moment()
      .utc()
      .format()
    const values: IUserOptionalProps = {
      emailVerificationSentAt
    }
    await updateUserData(
      values,
      { merge: true }
    )(dispatch, getState)
  }
}

export type IUpdateUserData = (values: IUserOptionalProps, options?: { merge: boolean }) => (dispatch: Dispatch, getState: () => IRedisState) => Promise<void>
export const updateUserData: IUpdateUserData = (values: IUserOptionalProps, options = { merge: true }, context?: any) => {
  return async (dispatch: Dispatch, getState: () => IRedisState) => {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) {
      throw new Error('firebaseUser is null')
    }
    if (getState().currentUser.isCurrentUserLoading) {
      return
    }
    dispatch({
      type: USER_DATA_UPDATE_REQUEST,
      context
    })
    const userRef =
      doc(firestore, `users/${firebaseUser.uid}`)
    try {
      await setDoc(userRef, values, options)
      const userData = await fetchUserData()
      dispatch({
        type: USER_DATA_UPDATE_SUCCESS,
        data: userData,
        context
      })
    } catch (error) {
      Sentry.captureException(error)
      console.error(error)
      dispatch({
        type: USER_DATA_UPDATE_FAILURE,
        error,
        context
      })
    }
  }
}

const initialState: ICurrentUser = {
  isCurrentUserLoading: false,
  isCurrentUserLoaded: false,
  firebaseUser: undefined,
  permissions: {
    usersRead: {},
    contactsWrite: {},
    usersWrite: {},
    usersDelete: {},
    contactsRead: {}
  },
  userData: fromJS({}),
  userDataUpdating: false,
  userDataUpdateError: null
}

interface ActionHandlerDef {
  [index: string]: (state: ICurrentUser, abc: any) => ICurrentUser
}

type IFetchedCurrentUserData = {
  permissions: IUserPermissions,
  firebaseUser: User | undefined,
  userData: any
}

const actionHandler
  : ActionHandlerDef
  = {
  [FETCHING_CURRENT_USER]: (state: ICurrentUser = initialState) => {
    return {
      ...state,
      isCurrentUserLoading: true,
      isCurrentUserLoaded: false
    }
  },
  [FETCHED_CURRENT_USER]: (
    state = initialState,
    { data: { permissions, firebaseUser, userData } }: { data: IFetchedCurrentUserData }
  ) => {
    const res: ICurrentUser = {
      ...state,
      firebaseUser,
      permissions,
      userData: fromJS(userData),
      isCurrentUserLoading: false,
      isCurrentUserLoaded: true
    }
    return res
  },

  [USER_DATA_UPDATE_REQUEST]: (
    state = initialState,
    { context }: { context?: any }) => {
    const res: ICurrentUser = {
      ...state,
      userDataUpdating: true,
      userDataUpdateError: null,
      userDataUpdateContext: context
    }
    return res
  },
  [USER_DATA_UPDATE_SUCCESS]: (state = initialState, { data, context }: { data: IUserOptionalProps, context?: any }) => {
    const res: ICurrentUser = {
      ...state,
      userData: fromJS(data),
      userDataUpdating: false,
      userDataUpdateError: null,
      userDataUpdateContext: context
    }
    return res
  },
  [USER_DATA_UPDATE_FAILURE]: (state = initialState, { error, context }: { error?: any, context?: any }) => {
    const res: ICurrentUser = {
      ...state,
      userDataUpdating: false,
      userDataUpdateError: error,
      userDataUpdateContext: context
    }
    return res
  }
}

export default function reducer(state: ICurrentUser = initialState, action: Action<string>) {
  const handler = actionHandler[action.type]
  return handler ? handler(state, action) : state
}
