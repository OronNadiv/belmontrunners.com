import * as Admin from 'firebase-admin'
import Contact from './Contact'
import { ARRAY_KEY } from './fields'

const { reject } = require('underscore')
const rp = require('request-promise')
const md5 = require('md5')

interface DeleteUserParam {
  uid: string
  email: string
}

export default (admin: Admin.app.App, apiKey: string) => {
  const firestore = admin.firestore()
  const auth = admin.auth()
  const contactsDoc = firestore.doc('subscribers/items')

  return async ({ uid, email }: DeleteUserParam) => {
    const deleteFromAuth = async () => {
      console.info(`deleteFromAuth called.  uid: ${uid}`)
      await auth.deleteUser(uid)
      console.info('auth.deleteUser complete successfully.')
    }

    const deleteFromUsers = async () => {
      console.info(`deleteFromUsers called.  uid: ${uid}`)
      await firestore.doc(`users/${uid}`).delete()
      console.info('deleteFromUsers complete successfully.')
    }

    const deleteFromContacts = async () => {
      console.info(`deleteFromContacts called.  uid: ${uid}`)
      const contactsData = await contactsDoc.get()
      const contacts = contactsData.data()
      if (contacts && contacts[ARRAY_KEY]) {
        const filteredContacts = reject(
          contacts[ARRAY_KEY],
          (item: Contact) => item.uid === uid
        )
        await contactsDoc.set({ [ARRAY_KEY]: filteredContacts })
      }
      console.info('deleteFromContacts complete successfully.')
    }

    const deleteFromMailChimp = async () => {
      try {
        console.info(`deleteFromMailChimp called.  email: ${email}`)
        await rp({
          method: 'DELETE',
          uri: `https://username:${apiKey}@us3.api.mailchimp.com/3.0/lists/7cffd16da0/members/${md5(
            email.toLowerCase()
          )}`
        })
        console.info('deleteFromMailChimp complete successfully.')
      } catch (err) {
        if (err.statusCode === 404) {
          console.warn('MailChimp returned 404.  message:', err.message)
        } else {
          console.error('err from MailChimp:', err)
        }
      }
    }

    await deleteFromUsers()
    await deleteFromContacts()
    await deleteFromAuth()
    await deleteFromMailChimp()
  }
}