/* tslint:disable */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

export const playTrivia = functions.https.onRequest((request, response) => {
    admin.firestore().collection('Trivia Plays')
        .add({
            when: admin.firestore.Timestamp.fromDate(new Date())
        });
    
});
