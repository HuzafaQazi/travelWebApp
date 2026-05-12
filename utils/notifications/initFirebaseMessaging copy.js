import axios, { getTabSpecificData, setTabSpecificData } from '@/utils/axios/axios';;
import config from "@/config";
import { messaging, getToken, onMessage } from "../firebase";
import { toast } from "react-toastify";

const sendTokenToServer = async (token) => {
  const userId = getTabSpecificData("userID")?.replace(/"/g, "");
  try {
    const response = await axios.put(`${config.EVENTS_UPDATE_FCM_TOKEN}`, {
      user_id: userId,
      token,
    });
    if (!response.ok) {
      throw new Error("Failed to send token to server");
    }
    setTabSpecificData("fcmToken", token);
    console.log("Token sent to server successfully");
  } catch (error) {
    console.error("Error sending token to server:", error);
  }
};

const saveToken = async (token) => {
  const currentToken = getTabSpecificData("fcmToken")?.replace(/"/g, "");
  if (currentToken !== token) {
    setTabSpecificData("fcmToken", token);
    await sendTokenToServer(token);
  }
};

const initFirebaseMessaging = async () => {
  try {
    if ("serviceWorker" in navigator) {
      const scope = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("firebase-messaging-sw registered", scope);
    }

    // Check if the token is already in local storage
    const currentToken = getTabSpecificData("fcmToken");
    console.log("currentToken", currentToken);
    // if (!currentToken) {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging);

      if (token) {
        await saveToken(token);
      }

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log("Message received: ", payload);
        try {
          if (!document.hidden) {
            const notificationTitle =
              payload?.data?.title || payload?.notification?.title;
            const notificationOptions = {
              body: payload?.data?.body || payload?.notification?.body,
              icon:
                payload?.data?.icon ||
                payload?.notification?.icon ||
                "/img/Notifications/qugo_icon.png" ||
                "",
              image: payload?.data?.image || payload?.notification?.image || "",
            };

            if (Notification.permission === "granted") {
              try {
                console.log("inside notification permission");
                const notification = new Notification(
                  notificationTitle,
                  notificationOptions
                );

                // Add a click event listener to the notification
                notification.onclick = () => {
                  window.focus();
                  if (
                    payload.data.notification_for === "messages" &&
                    window.location.pathname !== "/CIT-95"
                  ) {
                    window.location.href = "/CIT-95";
                  }
                };
                console.log("notification instance", notification);
              } catch (error) {
                console.log("Error creating notification:", error);
                console.error("Error creating notification:", error);
              }
            }
          }
        } catch (error) {
          console.log("Error onMessage:", error);
          console.error("Error onMessage:", error);
        }
      });
    } else if (permission === "denied") {
      console.log("Notification permission denied");
      // Handle denied permission (e.g., display a message or disable notification features)
    } else if (permission === "default") {
      console.log("Notification permission default");
      // Handle default permission (e.g., prompt the user again or provide instructions)
    }
    // }
  } catch (error) {
    console.log("Notification error", error);
    console.error("Error getting permission or token:", error);
  }
};

export default initFirebaseMessaging;
