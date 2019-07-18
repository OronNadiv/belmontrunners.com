export interface CurrentUserPermissions {
  usersRead: { [key: string]: boolean },
  usersWrite: { [key: string]: boolean },
  usersDelete: { [key: string]: boolean }
}

