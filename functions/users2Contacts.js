const { ARRAY_KEY, DISPLAY_NAME, EMAIL, IS_ACTIVE, IS_MEMBER, MEMBERSHIP_EXPIRES_AT, UID } = require('./fields')

const moment = require('moment')
const Promise = require('bluebird')
const normalizeEmail = require("normalize-email")
const _ = require('underscore')

module.exports = (admin) => {
  const firestore = admin.firestore()
  return async () => {
    const { usersCollection, contactsDoc } = await Promise
      .props({
        usersCollection: firestore.collection('users').get(),
        contactsDoc: firestore.doc('subscribers/items').get()
      })
    let data = contactsDoc.data()

    if (!data || !data[ARRAY_KEY]) {
      data = { [ARRAY_KEY]: [] }
    }
    const contacts = data[ARRAY_KEY]

// load all users
    const users = []
    usersCollection.forEach(userDoc => {
      const user = userDoc.data()
      user[UID] = userDoc.id
      users.push(user)
    })

    /*
    Update contacts information from users by UID.
    Handles case where a user changed a displayName or email
     */
    users.forEach((user) => {
      const foundContact = contacts.find((contact) => {
        return contact[UID] === user[UID]
      })
      if (foundContact) {
        foundContact[DISPLAY_NAME] = user[DISPLAY_NAME] || ''
        foundContact[EMAIL] = user[EMAIL]
        foundContact[MEMBERSHIP_EXPIRES_AT] = user[MEMBERSHIP_EXPIRES_AT] || ''
      }
    })

    /*
    Update contacts information from users by EMAIL.
    This handles cases where a user was created with an email of an existing subscriber.
    Now we "promote" this subscriber to be a user.
     */
    contacts.forEach((contact) => {
      const foundUser = users.find((user) => {
        return normalizeEmail(contact[EMAIL]) === normalizeEmail(user[EMAIL])
      })
      if (foundUser) {
        contact[UID] = foundUser[UID]
        contact[DISPLAY_NAME] = foundUser[DISPLAY_NAME] || ''
        contact[MEMBERSHIP_EXPIRES_AT] = foundUser[MEMBERSHIP_EXPIRES_AT] || ''
      }
    })

    /*
    Add new users to the contacts list
     */
    users.forEach((user) => {
      const foundContact = _.findWhere(contacts, { [UID]: user[UID] })
      if (foundContact) {
        return
      }
      const contact = {
        [UID]: user[UID],
        [DISPLAY_NAME]: user[DISPLAY_NAME] || '',
        [EMAIL]: user[EMAIL],
        [MEMBERSHIP_EXPIRES_AT]: user[MEMBERSHIP_EXPIRES_AT] || '',
        [IS_ACTIVE]: true
      }
      contacts.push(contact)
    })
    // set isMember
    contacts.forEach((contact) => {
      const membershipExpiresAt = contact[MEMBERSHIP_EXPIRES_AT]
      const isMember = membershipExpiresAt && moment(membershipExpiresAt).isAfter(moment())
      contact[IS_MEMBER] = Boolean(isMember)
    })

    await firestore.doc('subscribers/items').set({ [ARRAY_KEY]: contacts })
  }
}
