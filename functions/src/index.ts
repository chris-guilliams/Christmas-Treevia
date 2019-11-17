import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const Firestore = require('@google-cloud/firestore');
const PROJECTID = 'cloud-functions-firestore';
const COLLECTION_NAME = 'cloud-functions-firestore';

const db = new Firestore({
    projectId: PROJECTID,
    timestampsInSnapshots: true,
  });
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
