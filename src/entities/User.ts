import firebase from 'firebase/app'

export interface Visibility {
  [key: string]: string
}

export interface UserOptionalProps {
  address1?: string | null
  address2?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  displayName?: string | null
  photoURL?: string | null
  dateOfBirth?: string | null
  phone?: string | null
  didReceivedShirt?: boolean | null
  gender?: string | null
  membershipExpiresAt?: string | null
  createdAt?: string | null
  lastSignedInAt?: string | null
  emailVerified?: boolean | null
  emailVerificationSentAt?: string | null
  notInterestedInBecomingAMember?: boolean | null
  gravatarUrl?: string | null
  visibility?: Visibility | null

}

export interface User extends UserOptionalProps {
  uid: string
  email: string
}


export interface CurrentUserPermissions {
  contactsRead: { [key: string]: boolean },
  contactsWrite: { [key: string]: boolean },
  usersRead: { [key: string]: boolean },
  usersWrite: { [key: string]: boolean },
  usersDelete: { [key: string]: boolean }
}


export interface CurrentUserData {
  isCurrentUserLoading: boolean
  isCurrentUserLoaded: boolean
  permissions: CurrentUserPermissions
  currentUser?: firebase.User
  userData: any
  userDataUpdateContext?: any
  userDataUpdating: boolean
  userDataUpdateError?: any
}

export interface CurrentUserStore {
  currentUser: CurrentUserData
}
