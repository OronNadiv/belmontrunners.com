// emails
export const INVALID_EMAIL = 'Please enter a valid email address'
export const EMAILS_DONT_MATCH = "Email addresses don't match"
export const EMAIL_ALREADY_IN_USE = 'Email already in use'

// passwords
export const PASSWORDS_MISMATCH = "Passwords don't match"
export const INVALID_PASSWORD_LENGTH = (num: number) =>
  `Password should be at least ${num} characters`
export const INVALID_EMAIL_OR_PASSWORD = 'Invalid email or password'
export const WRONG_PASSWORD = 'Wrong password'
export const RESET_PASSWORD_SUCCESS = 'Password has been reset successfully'

// actions
export const EXPIRED_ACTION_CODE = 'The link has been expired.'
export const INVALID_URL = 'The link is invalid.'
export const INVALID_ACTION_CODE_INVALID_URL = INVALID_URL
export const USER_DISABLED_INVALID_URL = INVALID_URL
export const USER_NOT_FOUND_INVALID_URL = INVALID_URL
export const USER_NOT_FOUND_INVALID_EMAIL_OR_PASSWORD = INVALID_EMAIL_OR_PASSWORD
export const WRONG_PASSWORD_INVALID_EMAIL_OR_PASSWORD = INVALID_EMAIL_OR_PASSWORD

export const INVALID_FULL_NAME = 'Please enter a valid full name.'
export const POPUP_CLOSED_BEFORE_COMPLETION = 'Popup closed before completion.'

export const USER_NOT_FOUND_EXPLICIT =
  'There is no user corresponding to this email.'
