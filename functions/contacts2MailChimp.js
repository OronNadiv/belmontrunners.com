const functions = require('firebase-functions')
const apiKey = functions.config().mailchimp.apikey

const { DISPLAY_NAME, EMAIL } = require('./fields')
const { parseFullName } = require('parse-full-name')
const rp = require('request-promise')
const Promise = require('bluebird')
const md5 = require('md5')

console.log('functions.config().mailchimp.apikey:', Boolean(apiKey))

module.exports = admin => {
  const firestore = admin.firestore()

  return async () => {
    const docRef = firestore.doc('subscribers/items')
    const docData = await docRef.get()
    const contacts = docData.data().values
    const active = contacts
    // const inactive = contacts.filter(contact => !contact[SUBSCRIBER_IS_ACTIVE])

    // const syncInactive = async () => {
    //   await Promise.each(inactive, async (contact) => {
    //     try {
    //       await rp({
    //         method: 'PATCH',
    //         uri: `https://username:${apiKey}@us3.api.mailchimp.com/3.0/lists/7cffd16da0/members/${md5(contact[EMAIL].toLowerCase())}`,
    //         body: {
    //           "status": "unsubscribed"
    //         },
    //         json: true
    //       })
    //       console.log('done PATCH.  email: ', contact[EMAIL])
    //     } catch (err) {
    //       console.error('error PUT:', err && err.error ? err.error : err)
    //     }
    //   })
    // }

    const syncActive = async () => {
      try {
        const body = active.map(contact => {
          const mailChimpContact = {
            email_address: contact[EMAIL]
          }
          const displayName = contact[DISPLAY_NAME]
          if (displayName) {
            const name = parseFullName(displayName)
            mailChimpContact.merge_fields = {
              FNAME: name.first || '',
              LNAME: name.last || ''
            }
          }
          return mailChimpContact
        })
        await Promise.each(body, async item => {
          try {
            await rp({
              method: 'POST',
              uri: `https://username:${apiKey}@us3.api.mailchimp.com/3.0/lists/7cffd16da0/members/`,
              body: { ...item, status: 'subscribed' },
              json: true
            })
            console.info('done POST:', item.email_address)
          } catch (err) {
            if (err && err.error && err.error.status === 400) {
              try {
                await rp({
                  method: 'PUT',
                  uri: `https://username:${apiKey}@us3.api.mailchimp.com/3.0/lists/7cffd16da0/members/${md5(
                    item.email_address.toLowerCase()
                  )}`,
                  body: item,
                  json: true
                })
                console.info('done PUT:', item.email_address)
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
      } catch (err) {
        console.error('in syncActive. err:', err)
      }
    }

    await syncActive()
  }
}
