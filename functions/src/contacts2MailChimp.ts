import Contact from './Contact'
import * as Admin from 'firebase-admin'

const { parseFullName } = require('parse-full-name')
const rp = require('request-promise')
const BBPromise = require('bluebird')
const md5 = require('md5')

interface MailChimpContactMergeFields {
  FNAME: string
  LNAME: string
}

interface MailChimpContact {
  email_address: string
  merge_fields?: MailChimpContactMergeFields

}

const run = (admin: Admin.app.App, apiKey: string) => {
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
    await BBPromise.each(body, async (mailChimpContact: MailChimpContact) => {
      try {
        await rp({
          method: 'POST',
          uri: `https://username:${apiKey}@us3.api.mailchimp.com/3.0/lists/7cffd16da0/members/`,
          body: { ...mailChimpContact, status: 'subscribed' },
          json: true
        })
        console.info('done POST:', mailChimpContact.email_address)
      } catch (err) {
        if (err && err.error && err.error.status === 400) {
          try {
            await rp({
              method: 'PUT',
              uri: `https://username:${apiKey}@us3.api.mailchimp.com/3.0/lists/7cffd16da0/members/${md5(
                mailChimpContact.email_address.toLowerCase()
              )}`,
              body: mailChimpContact,
              json: true
            })
            console.info('done PUT:', mailChimpContact.email_address)
          } catch (err2) {
            console.error(
              'error PUT:',
              err2 && err2.error ? err2.error : err2
            )
          }
        } else {
          console.error('error POST:', err && err.error ? err.error : err)
        }
      }
    })
  }
}

export default run