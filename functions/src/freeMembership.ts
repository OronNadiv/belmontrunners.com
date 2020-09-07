import * as Admin from "firebase-admin";
import { https } from "firebase-functions";
import { User } from "./User";
import { UserRecord } from "firebase-functions/lib/providers/auth";

const moment = require("moment");

export default (admin: Admin.app.App) => {
  const firestore = admin.firestore();

  return async (user: UserRecord) => {
    const { uid } = user;
    const userDataRef = firestore.doc(`users/${uid}`);

    const userDoc = await userDataRef.get();
    if (!userDoc.data()) {
      throw new https.HttpsError(
        "internal",
        "Something went wrong..."
      );
    }
    const userDataJS: User = userDoc.data() as User;

    userDataJS.notInterestedInBecomingAMember = false;
    userDataJS.membershipExpiresAt = moment("07-01-2021", "MM-DD-YYYY").utc().format();
    await userDataRef.set({
      notInterestedInBecomingAMember: userDataJS.notInterestedInBecomingAMember,
      membershipExpiresAt: userDataJS.membershipExpiresAt
    }, { merge: true });
  };
}
