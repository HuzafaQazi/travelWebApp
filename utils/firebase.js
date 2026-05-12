// Import the functions you need from the SDKs you need
// import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import config from "@/config";
// import firebase from 'firebase';
import "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  projectId: config.FIREBASE_PROJECT_ID,
  storageBucket: config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID,
  measurementId: config.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
let messaging = null;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

// firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const analytics =
  app.name && typeof window !== "undefined" ? getAnalytics(app) : null;
// firebase.analytics().logEvent('event_name', { parameter1: 'value1', parameter2: 'value2' });

// if(initializeApp.apps.length){
//     // Initialize now
// }

export { app, analytics, messaging, getToken, onMessage };
