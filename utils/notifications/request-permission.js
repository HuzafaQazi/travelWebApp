// lib/request-permission.js
// import { messaging, getToken } from "./firebase-config";
import { messaging, getToken } from "../firebase";
import config from "@/config";

export const requestPermission = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: config.FIREBASE_VAPID_KEY,
    });
    if (currentToken) {
      console.log("FCM Token:", currentToken);
      // Send the token to your backend server
      //   await fetch("/api/save-fcm-token", {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ token: currentToken }),
      //   });
    } else {
      console.log(
        "No registration token available. Request permission to generate one."
      );
    }
  } catch (error) {
    console.error("An error occurred while retrieving token.", error);
  }
};
