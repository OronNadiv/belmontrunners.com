import Contact from './Contact'
import * as Admin from 'firebase-admin'
import { https } from 'firebase-functions'
import { EMAIL, SUBSCRIBERS_ARRAY_KEY } from './fields'

const moment = require('moment')
const _ = require('underscore')

export default (admin: Admin.app.App) => {
  const firestore = admin.firestore()

  return async (data: any, context?: https.CallableContext) => {
    try {
      console.info('data:', data)
      console.info('context.auth:', context ? context.auth : '')

      const docRef = firestore.doc('subscribers/items')
      const contactsDoc = await docRef.get()
      let contactsData = contactsDoc.data()

      if (!contactsData || !contactsData[SUBSCRIBERS_ARRAY_KEY]) {
        contactsData = { [SUBSCRIBERS_ARRAY_KEY]: [] }
      }
      const contacts: Contact[] = contactsData[SUBSCRIBERS_ARRAY_KEY]

      const email = data.email
      const foundContact = _.findWhere(contacts, { [EMAIL]: email })
      if (foundContact) {
        console.info('contact already exist')
        return
      }
      const contact: Contact = {
        email,
        isActive: true,
        addedBy: context && context.auth ? context.auth.uid : 'unauthenticated',
        addedAt: moment()
          .utc()
          .format(),
        isMember: false // not a member.  Otherwise we would have found it ( see above: _.findWhere(...)
      }
      contacts.unshift(contact)

      await docRef.set({ [SUBSCRIBERS_ARRAY_KEY]: contacts })
      console.info('contact has been added and saved successfully.')
    } catch (err) {
      console.error('error:', err)
      throw new https.HttpsError(
        'internal',
        'Something went wrong...'
      )
    }
  }
}
