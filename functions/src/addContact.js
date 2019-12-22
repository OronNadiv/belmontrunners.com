const moment = require('moment')
const {
  UID,
  EMAIL,
  SUBSCRIBER_IS_ACTIVE,
  SUBSCRIBERS_ARRAY_KEY
} = require('./fields')
const _ = require('underscore')
const functions = require('firebase-functions')

module.exports = admin => {
  const firestore = admin.firestore()

  return async (data, context) => {
    try {
      console.info('data:', data)
      console.info('context.auth:', context.auth)

      let docRef = firestore.doc('subscribers/items')
      const contactsDoc = await docRef.get()
      let contactsData = contactsDoc.data()

      if (!contactsData || !contactsData[SUBSCRIBERS_ARRAY_KEY]) {
        contactsData = { [SUBSCRIBERS_ARRAY_KEY]: [] }
      }
      const contacts = contactsData[SUBSCRIBERS_ARRAY_KEY]

      const email = data.email
      const foundContact = _.findWhere(contacts, { [EMAIL]: email })
      if (foundContact) {
        console.info('contact already exist')
        return
      }
      const contact = {
        [EMAIL]: email,
        [SUBSCRIBER_IS_ACTIVE]: true,
        addedBy: context.auth ? context.auth[UID] : 'unauthenticated',
        addedAt: moment()
          .utc()
          .format()
      }
      contacts.unshift(contact)

      await docRef.set({ [SUBSCRIBERS_ARRAY_KEY]: contacts })
      console.info('contact has been added and saved successfully.')
    } catch (err) {
      console.error('error:', err)
      throw new functions.https.HttpsError(
        'internal',
        'Something went wrong...'
      )
    }
  }
}
