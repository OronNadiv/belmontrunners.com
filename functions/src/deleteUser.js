const functions = require('firebase-functions')
const apiKey = functions.config().mailchimp.apikey

const { ARRAY_KEY } = require('./fields')
const { reject } = require('underscore')
const rp = require('request-promise')
const md5 = require('md5')
const { UID, EMAIL } = require('./fields')

module.exports = admin => {
  const firestore = admin.firestore()
  const auth = admin.auth()

  const contactsDoc = firestore.doc('subscribers/items')

  const deleteFromAuth = async uid => {
    console.info(`deleteFromAuth called.  uid: ${uid}`)
    await auth.deleteUser(uid)
    console.info('auth.deleteUser complete successfully.')
  }

  const deleteFromUsers = async uid => {
    console.info(`deleteFromUsers called.  uid: ${uid}`)

    await firestore.doc(`users/${uid}`).delete()
    console.info('deleteFromUsers complete successfully.')
  }

  const deleteFromContacts = async uid => {
    console.info(`deleteFromContacts called.  uid: ${uid}`)

    const contactsData = await contactsDoc.get()
    const contacts = contactsData.data()
    if (contacts && contacts[ARRAY_KEY]) {
      const filteredContacts = reject(
        contacts[ARRAY_KEY],
        item => item[UID] === uid
      )
      await contactsDoc.set({ [ARRAY_KEY]: filteredContacts })
    }
    console.info('deleteFromContacts complete successfully.')
  }

  const deleteFromMailChimp = async email => {
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

  return async params => {
    await deleteFromUsers(params[UID])
    await deleteFromContacts(params[UID])
    await deleteFromAuth(params[UID])
    await deleteFromMailChimp(params[EMAIL])
  }
}
