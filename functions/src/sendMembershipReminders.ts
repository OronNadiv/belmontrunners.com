import * as Admin from 'firebase-admin'
import {User} from './User'
import calc from './membershipUtils'

import {filter, resolve} from 'bluebird'

const moment = require('moment')
const REMINDER_DURATION = moment.duration(11, 'days')

const SendMembershipReminders = (admin: Admin.app.App) => {
  const firestore = admin.firestore();

  async function wasEmailSent(user: User) {
    const docs = await firestore.collection('mail')
        .where("toUids", "array-contains", user.uid)
        .where("template.name", "==", "membershipExpiresSoon")
        .where("delivery.startTime", ">", moment().subtract(REMINDER_DURATION).toDate())
        .where("delivery.startTime", "<", moment().add(REMINDER_DURATION).toDate())
        .get()
    return !docs.empty
  }

  async function sendEmail(user: User) {
    console.log('sendEmail called.  User:', user.uid)

    return await firestore.collection('mail').add({
      toUids: [user.uid],
      bcc: 'membership@belmontrunners.com',
      template: {
        name: "membershipExpiresSoon",
        data: {
          displayName: user.displayName,
          expirationDate: moment(user.membershipExpiresAt).format('dddd, MMMM Do YYYY'),
        },
      },
    })
  }


  // main function
  return async () => {

    const usersCollection: FirebaseFirestore.QuerySnapshot = await firestore.collection('users').get()
    const users: any[] = [];

    usersCollection.forEach((userDoc) => {
      const user = userDoc.data();
      user.uid = userDoc.id;
      users.push(user);
    });

    return filter(users, (user: User) => {
      const isMembershipExpiresSoon = calc(user, REMINDER_DURATION).isMembershipExpiresSoon
      console.log("user.uid: ", user.uid,
          "isMembershipExpiresSoon:", isMembershipExpiresSoon)
      return isMembershipExpiresSoon
    })
        .filter((user: User) =>
            resolve(wasEmailSent(user))
                .tap((wasSent: boolean) => console.log('user.uid: ', user.uid, 'wasEmailSent:', wasSent))
                .then((wasSent: boolean) => !wasSent))
        .each(sendEmail)
  }
}

export default SendMembershipReminders
