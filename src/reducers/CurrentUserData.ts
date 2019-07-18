import firebase from 'firebase'
import {CurrentUserPermissions} from './CurrentUserPermissions'

export interface CurrentUserData {
  permissions: CurrentUserPermissions,
  currentUser: firebase.User
}
