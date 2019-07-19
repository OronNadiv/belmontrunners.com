import {
  ADDRESS1,
  ADDRESS2,
  CITY,
  CREATED_AT,
  DATE_OF_BIRTH,
  DID_RECEIVED_SHIRT,
  DISPLAY_NAME,
  EMAIL,
  EMAIL_VERIFIED,
  GENDER,
  MEMBERSHIP_EXPIRES_AT,
  NOT_INTERESTED_IN_BECOMING_A_MEMBER,
  PHONE,
  PHOTO_URL,
  STATE,
  UID,
  ZIP
} from "../fields";

export interface IUserData {
  [UID]: string
  [ADDRESS1]?: string
  [ADDRESS2]?: string
  [CITY]?: string
  [STATE]?: string
  [ZIP]?: string
  [DISPLAY_NAME]?: string
  [EMAIL]: string
  [PHOTO_URL]?: string
  [DATE_OF_BIRTH]?: string
  [PHONE]?: string,
  [DID_RECEIVED_SHIRT]?: boolean,
  [GENDER]?: string
  [MEMBERSHIP_EXPIRES_AT]?: string
  [CREATED_AT]?: string
  [EMAIL_VERIFIED]: boolean
  [NOT_INTERESTED_IN_BECOMING_A_MEMBER]?: boolean
}
