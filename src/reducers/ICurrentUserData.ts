import firebase from 'firebase/app'
import { ICurrentUserPermissions } from './ICurrentUserPermissions'
import { Map } from 'immutable'

export interface ICurrentUserData {
  isCurrentUserLoaded: boolean,
  permissions: ICurrentUserPermissions,
  currentUser: firebase.User,
  userData: Map<string, any>
}
