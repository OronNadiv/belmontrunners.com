export interface ICurrentUserPermissions {
  contactsRead: { [key: string]: boolean },
  contactsWrite: { [key: string]: boolean },
  usersRead: { [key: string]: boolean },
  usersWrite: { [key: string]: boolean },
  usersDelete: { [key: string]: boolean }
}

