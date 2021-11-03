import Contact from './Contact'
import * as Admin from 'firebase-admin'
import { each } from 'bluebird'
import fetch from 'node-fetch'

const { parseFullName } = require('parse-full-name')
const md5 = require('md5')

interface MailChimpContactMergeFields {
  FNAME: string
  LNAME: string
}

interface MailChimpContact {
  email_address: string
  merge_fields?: MailChimpContactMergeFields

}

const Contacts2MailChimp = (admin: Admin.app.App, apiKey: string) => {
  return async () => {
    const firestore = admin.firestore()
    const docRef: FirebaseFirestore.DocumentReference = firestore.doc('subscribers/items')
    const docData: FirebaseFirestore.DocumentSnapshot = await docRef.get()
    const data: FirebaseFirestore.DocumentData | undefined = docData.data()
    if (data === undefined) {
      return
    }

    const contacts: Contact[] = data.values

    const body = contacts.map((contact: Contact) => {
      const mailChimpContact: MailChimpContact = {
        email_address: contact.email,
        merge_fields: undefined
      }
      const displayName = contact.displayName
      if (displayName) {
        const name = parseFullName(displayName)
        const mailChimpContactMergeFields: MailChimpContactMergeFields = {
          FNAME: name.first || '',
          LNAME: name.last || ''
        }
        mailChimpContact.merge_fields = mailChimpContactMergeFields
      }
      return mailChimpContact
    })
    await each(body, async (mailChimpContact: MailChimpContact) => {
      try {
        const url = `https://username:${apiKey}@us3.api.mailchimp.com/3.0/lists/7cffd16da0/members/${md5(
            mailChimpContact.email_address.toLowerCase()
        )}`;
        const res = await fetch(url, {
          method: 'PUT',
          body: JSON.stringify({ ...mailChimpContact, status_if_new: 'subscribed' }),
          headers: {'Content-Type': 'application/json'}
        })
        if (res.ok) {
          console.info('done PUT:', mailChimpContact.email_address)
        } else {
          console.error('Invalid response.', 'res:', res)
        }
      } catch (err: any) {
        console.error(
          'error PUT:',
          err && err.error ? err.error : err
        )
      }
    })
  }
}

export default Contacts2MailChimp
