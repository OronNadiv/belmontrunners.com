import {
  ADDRESS1,
  ADDRESS2,
  CITY, DATE_OF_BIRTH,
  DISPLAY_NAME,
  EMAIL, GENDER, GRAVATAR_URL,
  PHONE,
  PHOTO_URL,
  STATE,
  UID,
  ZIP
} from './fields'

export enum VisibilityEnum {
  ONLY_ME = 'ONLY_ME',
  MEMBERS = 'MEMBERS'
}

export interface Visibility {
  [UID]?: VisibilityEnum,
  [DISPLAY_NAME]?: VisibilityEnum,
  [EMAIL]?: VisibilityEnum,
  [PHOTO_URL]?: VisibilityEnum,
  [PHONE]?: VisibilityEnum,
  [ADDRESS1]?: VisibilityEnum,
  [ADDRESS2]?: VisibilityEnum,
  [CITY]?: VisibilityEnum,
  [STATE]?: VisibilityEnum,
  [ZIP]?: VisibilityEnum,
  [GENDER]?: VisibilityEnum,
  [DATE_OF_BIRTH]?: VisibilityEnum,
  [GRAVATAR_URL]?: VisibilityEnum
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
}
