import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import updateLiveMailingList from './utils/updateLiveMailingList';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

export default functions.https.onCall(
  async (
    { registrationId, email, firstName, lastName, preferredLanguage, level },
    context
  ) => {
    if (
      !context.auth ||
      ![
        'OjLKRTTzNyQgMifAExQKUA4MtfF2',
        'v8NK8mHCZnbPQKaPnEs5lKNc3rv2',
        'BKFOe33Ym7Pc7aQuET57MiljpF03',
        'YF9ObmH1SUR1MKJGTrO8DfBQUG13',
      ].includes(context.auth.uid)
    ) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Insufficient Permissions.'
      );
    }

    await Promise.all([
      updateLiveMailingList({
        email,
        firstName,
        lastName,
        preferredLanguage,
        ip: context.rawRequest.ip,
        level,
        fullFinancialAid: true,
      }),
      admin
        .firestore()
        .collection('classes-registration')
        .doc('2021october')
        .collection('registrations')
        .doc(registrationId)
        .update({
          status: 'ACCEPTED',
          acceptedBy: context.auth.uid,
          acceptedTimestamp: admin.firestore.FieldValue.serverTimestamp(),
        }),
    ]);
  }
);