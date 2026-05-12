// components/NotificationSetup.js
import { useEffect } from "react";
import { messaging } from "../../../utils/firebase";
import { setTabSpecificData } from "@/utils/axios/axios";
const NotificationSetup = ({ topic }) => {
  useEffect(() => {
    const requestPermissionAndSubscribe = async () => {
      try {
        // await messaging.requestPermission();
        const token = await messaging.getToken({
          vapidKey: process.env.FIREBASE_VAPID_KEY,
        });
        setTabSpecificData("fcmToken", token);
      } catch (error) {
        console.error(
          "Error getting FCM token or subscribing to topic:",
          error
        );
      }
    };

    requestPermissionAndSubscribe();

    messaging.onMessage((payload) => {
      console.log("Message received. ", payload);
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
      };

      if (Notification.permission === "granted") {
        new Notification(notificationTitle, notificationOptions);
      }
    });
  }, [topic]);

  return null;
};

export default NotificationSetup;
