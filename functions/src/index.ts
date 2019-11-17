/* tslint:disable */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
//const cors = require('cors')({origin: true});
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//

admin.initializeApp(functions.config().firebase);

export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

export const playTrivia = functions.https.onCall((request, response) => {
    admin.firestore().collection('triviaPlays')
        .add({
            when: admin.firestore.Timestamp.fromDate(new Date())
        });
});
