import Contact from './Contact'
import * as Admin from 'firebase-admin'
import { User } from './User'
import calc from './membershipUtils'
import { ARRAY_KEY, UID } from './fields'
import { props } from 'bluebird'

const normalizeEmail = require('normalize-email')
const _ = require('underscore')

const Users2Contacts = (admin: Admin.app.App) => {
  const firestore: FirebaseFirestore.Firestore = admin.firestore()
  return async () => {
    const docRef = firestore.doc('subscribers/items')

    const res = await props({
      usersCollection: firestore.collection('users').get(),
      contactsDoc: docRef.get()
    })
    const usersCollection: FirebaseFirestore.QuerySnapshot = res.usersCollection
    const contactsDoc: FirebaseFirestore.DocumentSnapshot = res.contactsDoc
    let data: FirebaseFirestore.DocumentData | undefined = contactsDoc.data()

    if (!data || !data[ARRAY_KEY]) {
      data = { [ARRAY_KEY]: [] }
    }
    const contacts: Contact[] = data[ARRAY_KEY]

    // load all users
    const users: User[] = []
    usersCollection.forEach((userDoc: FirebaseFirestore.DocumentData) => {
      const user: User = userDoc.data()
      user.uid = userDoc.id
      users.push(user)
    })

    /*
    Update contacts information from users by UID.
    Handles case where a user changed a displayName or email
     */
    users.forEach(user => {
      const foundContact: Contact | undefined = _.findWhere(contacts, { [UID]: user.uid })
      if (foundContact) {
        foundContact.email = user.email
        foundContact.displayName = user.displayName || ''
        foundContact.isMember = calc(user).isAMember
        foundContact.membershipExpiresAt = user.membershipExpiresAt || ''
      }
    })

    /*
    Update contacts information from users by EMAIL.
    This handles cases where a user was created with an email of an existing subscriber.
    Now we "promote" this subscriber to be a user.
     */
    contacts.forEach((contact: Contact) => {
      const foundUser: User | undefined = users.find(user => {
        return normalizeEmail(contact.email) === normalizeEmail(user.email)
      })
      if (foundUser) {
        contact.uid = foundUser.uid
        contact.displayName = foundUser.displayName || ''
        contact.isMember = calc(foundUser).isAMember
        contact.membershipExpiresAt = foundUser.membershipExpiresAt || ''
      }
    })

    /*
    Add new users to the contacts list
     */
    users.forEach(user => {
      const foundContact: Contact | undefined = _.findWhere(contacts, { [UID]: user.uid })
      if (foundContact) {
        return
      }
      const contact: Contact = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        isMember: calc(user).isAMember,
        membershipExpiresAt: user.membershipExpiresAt || '',
        isActive: true
      }
      contacts.push(contact)
    })

    await docRef.set({ [ARRAY_KEY]: contacts })
  }
}
export default Users2Contacts
