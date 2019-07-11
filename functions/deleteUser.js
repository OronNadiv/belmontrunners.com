const { ARRAY_KEY } = require('./fields')
const { reject } = require('underscore')
const rp = require('request-promise')
const Promise = require('bluebird')
const md5 = require('md5')
const { UID, EMAIL } = require('./fields')
const functions = require('firebase-functions')

module.exports = (admin) => {
  const firestore = admin.firestore()
  const auth = admin.auth()

  const contactsDoc = firestore.doc('subscribers/items')

  const deleteFromAuth = async (uid) => {
    console.info(`deleteFromAuth called.  uid: ${uid}`)
    await auth.deleteUser(uid)
    console.info('auth.deleteUser complete successfully.')
  }

  const deleteFromUsers = async (uid) => {
    console.info(`deleteFromUsers called.  uid: ${uid}`)

    await firestore.doc(`users/${uid}`).delete()
    console.info('deleteFromUsers complete successfully.')
  }

  const deleteFromContacts = async (uid) => {
    console.info(`deleteFromContacts called.  uid: ${uid}`)

    const contactsData = await contactsDoc.get()
    const contacts = contactsData.data()
    if (contacts && contacts[ARRAY_KEY]) {
      const filteredContacts = reject(contacts[ARRAY_KEY], (item) => item[UID] === uid)
      await contactsDoc.set({ [ARRAY_KEY]: filteredContacts })
    }
    console.info('deleteFromContacts complete successfully.')
  }

  const deleteFromMailChimp = async (email) => {
    try {
      console.info(`deleteFromMailChimp called.  email: ${email}`)
      await rp({
        method: 'DELETE',
        uri: `https://username:2b7213c2cc3789df0376d0629facc0b5-us3@us3.api.mailchimp.com/3.0/lists/7cffd16da0/members/${md5(email.toLowerCase())}`
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

  return async (data, context) => {
    if (!context || !context.auth || !context.auth[UID]) {
      throw new functions.https.HttpsError('unauthenticated', 'unauthenticated.')
    }
    const currentUID = context.auth[UID]
    const targetUID = data.uid
    let targetEmail
    if (targetUID !== currentUID) {
      const { docUsersDelete, docUser } = await Promise.props({
        docUsersDelete: firestore.doc('permissions/usersDelete').get(),
        docUser: firestore.doc(`users/${targetUID}`).get()
      })
      const usersDelete = docUsersDelete.data()
      const allowDelete = usersDelete && usersDelete[currentUID]
      if (!allowDelete) {
        throw new functions.https.HttpsError('permission-denied', 'permission-denied.')
      }
      targetEmail = docUser.data() && docUser.data()[EMAIL]
      if (!targetEmail) {
        throw new functions.https.HttpsError('not-found', 'not-found.')
      }
    } else {
      targetEmail = context.auth.token[EMAIL]
    }

    await deleteFromUsers(targetUID)
    await deleteFromContacts(targetUID)
    await deleteFromAuth(targetUID)
    return await deleteFromMailChimp(targetEmail)
  }
}
