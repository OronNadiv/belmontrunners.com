import * as Sentry from '@sentry/browser'
import { fromJS } from 'immutable'
import {
  CurrentUserData,
  CurrentUserPermissions,
  CurrentUserStore,
  User,
  UserOptionalProps
} from '../entities/User'
import { auth, firestore } from '../firebase'
import { Dispatch, Action } from 'redux'

const Promise = require('bluebird')
const moment = require('moment')

const PREFIX = 'CURRENT_USER'

export const FETCHING_CURRENT_USER = `${PREFIX}_FETCHING_CURRENT_USER`
export const FETCHED_CURRENT_USER = `${PREFIX}_FETCHED_CURRENT_USER`

export const USER_DATA_UPDATE_REQUEST = `${PREFIX}USER_DATA_UPDATE_REQUEST`
export const USER_DATA_UPDATE_SUCCESS = `${PREFIX}USER_DATA_UPDATE_SUCCESS`
export const USER_DATA_UPDATE_FAILURE = `${PREFIX}USER_DATA_UPDATE_FAILURE`

let isRegistered: boolean

const fetchUserData = async () => {
  const currentUser = auth.currentUser
  if (!currentUser) {
    throw new Error('current user is null')
  }
  const userRef = firestore
    .doc(`users/${currentUser.uid}`)
  const userDoc = await userRef.get()
  const userData = userDoc.data() || {} as User
  return userData
}

const fetchPermissions = async () => {
  const {
    docUsersRead,
    docUsersWrite,
    docUsersDelete,
    docContactsRead,
    docContactsWrite
  } = await Promise.props({
    docUsersRead: firestore
      .doc('permissions/usersRead')
      .get(),
    docUsersWrite: firestore
      .doc('permissions/usersWrite')
      .get(),
    docUsersDelete: firestore
      .doc('permissions/usersDelete')
      .get(),
    docContactsRead: firestore
      .doc('permissions/subscribersRead')
      .get(),
    docContactsWrite: firestore
      .doc('permissions/subscribersWrite')
      .get()
  })
  return {
    usersRead: docUsersRead.data(),
    usersWrite: docUsersWrite.data(),
    usersDelete: docUsersDelete.data(),
    contactsRead: docContactsRead.data(),
    contactsWrite: docContactsWrite.data()
  }
}

export type FetchCurrentUser = () => (dispatch: Dispatch, getState: () => CurrentUserStore) => any
export const fetchCurrentUser: FetchCurrentUser = () => {
  return (dispatch: Dispatch, getState: () => CurrentUserStore) => {
    if (getState().currentUser.isCurrentUserLoading) {
      return
    }
    dispatch({
      type: FETCHING_CURRENT_USER
    })
    if (!isRegistered) {
      isRegistered = true
      auth.onAuthStateChanged(async () => {
        if (!auth.currentUser) {
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
            const [permissions, userData] = await Promise.all([
              fetchPermissions(),
              fetchUserData()
            ])
            const currentUser = auth.currentUser
            console.log('permissions', permissions)
            console.log('userData', userData)
            dispatch({
              type: FETCHED_CURRENT_USER,
              data: {
                currentUser,
                permissions,
                userData
              }
            })
            const {
              metadata: { creationTime, lastSignInTime },
              emailVerified
            } = currentUser
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
            await updateUserData(
              {
                createdAt,
                lastSignedInAt,
                emailVerified
              },
              { merge: true }
            )(dispatch, getState)
          } catch (error) {
            Sentry.captureException(error)
            console.error(error)
          }
        }
      })
    }
  }
}

export const sendEmailVerification = () => {
  return async (dispatch: Dispatch, getState: () => CurrentUserStore) => {
    const currentUser = getState().currentUser.currentUser
    if (!currentUser) {
      throw new Error('current user is null')
    }
    await currentUser.sendEmailVerification()
    const emailVerificationSentAt: string = moment()
      .utc()
      .format()
    const values: UserOptionalProps = {
      emailVerificationSentAt
    }
    await updateUserData(
      values,
      { merge: true }
    )(dispatch, getState)
  }
}

export type UpdateUserData = (values: UserOptionalProps, options?: firebase.firestore.SetOptions, context?: any) => any
export const updateUserData = (values: UserOptionalProps, options = { merge: true }, context?: any) => {
  return async (dispatch: Dispatch, getState: () => CurrentUserStore) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('current user is null')
    }
    if (getState().currentUser.isCurrentUserLoading) {
      return
    }
    dispatch({
      type: USER_DATA_UPDATE_REQUEST,
      context
    })
    const userRef = firestore
      .doc(`users/${currentUser.uid}`)
    try {
      await userRef.set(values, options)
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

const initialState: CurrentUserData = {
  isCurrentUserLoading: false,
  isCurrentUserLoaded: false,
  currentUser: undefined,
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
  [index: string]: (state: CurrentUserData, abc: any) => CurrentUserData
}

const actionHandler
  : ActionHandlerDef
  = {
  [FETCHING_CURRENT_USER]: (state: CurrentUserData = initialState) => {
    const newState = {
      ...state,
      isCurrentUserLoading: true,
      isCurrentUserLoaded: false
    }
    return newState
  },
  [FETCHED_CURRENT_USER]: (
    state = initialState,
    { data: { permissions, currentUser, userData } }:
      {
        data: {
          permissions: CurrentUserPermissions,
          currentUser: firebase.User,
          userData: any
        }
      }
  ) => {
    const newState = {
      ...state,
      currentUser,
      permissions,
      userData: fromJS(userData),
      isCurrentUserLoading: false,
      isCurrentUserLoaded: true
    }
    return newState
  },

  [USER_DATA_UPDATE_REQUEST]: (
    state = initialState,
    { context }: { context?: any }) => {
    const newState = {
      ...state,
      userDataUpdating: true,
      userDataUpdateError: null,
      userDataUpdateContext: context
    }
    return newState
  },
  [USER_DATA_UPDATE_SUCCESS]: (state = initialState, { data, context }: { data: UserOptionalProps, context?: any }) => {
    const newState = {
      ...state,
      userData: fromJS(data) as User,
      userDataUpdating: false,
      userDataUpdateError: null,
      userDataUpdateContext: context
    }
    return newState
  },
  [USER_DATA_UPDATE_FAILURE]: (state = initialState, { error, context }: { error?: any, context?: any }) => {
    const newState = {
      ...state,
      userDataUpdating: false,
      userDataUpdateError: error,
      userDataUpdateContext: context
    }
    return newState
  }
}

export default function reducer(state: CurrentUserData = initialState, action: Action<string>) {
  const handler = actionHandler[action.type]
  return handler ? handler(state, action) : state
}
