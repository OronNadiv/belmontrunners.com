import firebase from 'firebase'
import {ICurrentUserPermissions} from './ICurrentUserPermissions'
import { IUserData } from "./IUserData";

export interface ICurrentUserData {
  isCurrentUserLoaded : boolean,
  permissions: ICurrentUserPermissions,
  currentUser: firebase.User,
  userData: IUserData
}
