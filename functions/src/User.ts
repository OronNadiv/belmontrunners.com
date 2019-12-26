export interface Visibility {
  [key: string]: string
}

export interface SentEmailDetails {
  queuedAt: string
}

export interface RegistrationRenewalsDetails extends SentEmailDetails {
  details: object
}

export interface RegistrationRenewals {
  [keys: string]: RegistrationRenewalsDetails
}

export interface SentEmails {
  membershipRenewals: RegistrationRenewals
}

export interface User {
  uid: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  displayName?: string
  email: string
  photoURL?: string
  dateOfBirth?: string
  phone?: string,
  didReceivedShirt?: boolean,
  gender?: string
  membershipExpiresAt?: string
  createdAt?: string
  lastSignedInAt?: string
  emailVerified: boolean
  notInterestedInBecomingAMember?: boolean
  gravatarUrl?: string
  visibility?: Visibility
  sentEmails?: SentEmails
}
