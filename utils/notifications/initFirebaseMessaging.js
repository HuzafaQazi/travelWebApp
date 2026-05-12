import axios, {
  getTabSpecificData,
  setTabSpecificData,
} from "@/utils/axios/axios";
import config from "@/config";
import { messaging, getToken, onMessage } from "../firebase";

const sendTokenToServer = async (token) => {
  const userId = getTabSpecificData("userID")?.replace(/"/g, "");
  const eventId = getTabSpecificData("event_id")?.replace(/"/g, "");

  let deviceId = getTabSpecificData("fcm_device_id");
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    setTabSpecificData("fcm_device_id", deviceId);
  }

  const deviceInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    deviceId: deviceId,
  };

  try {
    const response = await axios.put(`${config.EVENTS_UPDATE_FCM_TOKEN}`, {
      user_id: userId,
      event_id: eventId,
      token,
      deviceInfo,
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
  // if (currentToken !== token) {
  setTabSpecificData("fcmToken", token);
  await sendTokenToServer(token);
  // }
};

const initFirebaseMessaging = async () => {
  try {
    if ("serviceWorker" in navigator) {
      if (!("PushManager" in window)) {
        console.error("PushManager is not supported on this browser.");
        return;
      }
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("firebase-messaging-sw registered", registration);

      // Check if the token is already in local storage
      const currentToken = getTabSpecificData("fcmToken");
      console.log("currentToken", currentToken);

      // if (!currentToken) {
      if ("Notification" in window) {
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
                  image:
                    payload?.data?.image || payload?.notification?.image || "",
                  data: {
                    notificationFor: payload?.data?.notification_for,
                  },
                };

                try {
                  registration.showNotification(
                    notificationTitle,
                    notificationOptions
                  );

                  // Add a click event listener to the notification
                  registration.addEventListener(
                    "notificationclick",
                    async (event) => {
                      event.notification.close();
                      if (
                        payload.data.notification_for === "messages" &&
                        window.location.pathname !== "/CIT-95"
                      ) {
                        setLoading(true);
                        window.focus();
                        await router.push("/CIT-95");
                        setLoading(false);
                      }
                    }
                  );
                } catch (error) {
                  console.error("Error creating notification:", error);
                }
              }
            } catch (error) {
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
      } else {
        console.error("Notifications are not supported on this browser.");
      }
      // }
    }
  } catch (error) {
    console.error("Error getting permission or token:", error);
  }
};

export default initFirebaseMessaging;
