import { useState, useEffect } from "react";
import axios, { getTabSpecificData, setTabSpecificData } from "@/utils/axios/axios";
import config from "@/config";
import { messaging, getToken, onMessage } from "../../utils/firebase";
import { useRouter } from "next/router";
import Loader from "@/components/loader/loader";
import { useLogin } from "@/store/context/LoginContext";

const sendTokenToServer = async (token) => {
  const userId = getTabSpecificData("userID")?.replace(/"/g, "");
  try {
    // const response = await axios.put(`${config.EVENTS_UPDATE_FCM_TOKEN}`, {
    //   user_id: userId,
    //   token,
    // });
    // if (!response.ok) {
    //   throw new Error("Failed to send token to server");
    // }
    setTabSpecificData("fcmToken", token);
    console.log("Token sent to server successfully");
  } catch (error) {
    console.error("Error sending token to server:", error);
  }
};

const saveToken = async (token) => {
  const currentToken = getTabSpecificData("fcmToken")?.replace(/"/g, "");
  setTabSpecificData("fcmToken", token);
  await sendTokenToServer(token);
};

const useFirebaseMessaging = () => {
  const { eventUserDetails } = useLogin();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initFirebaseMessaging = async () => {
      try {
        if ("serviceWorker" in navigator) {
          console.log("mobile iphone check", navigator.userAgent);
          console.log("mobile iphone for navigator", navigator);
          if (!("PushManager" in window)) {
            console.error("PushManager is not supported on this browser.");
            return null;
          }
          const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
          );
          console.log("firebase-messaging-sw registered", registration);

          const currentToken = getTabSpecificData("fcmToken");
          console.log("currentToken", currentToken);
          if ("Notification" in window) {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              const token = await getToken(messaging);
              if (token) {
                await saveToken(token);
              }

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
                        payload?.data?.image ||
                        payload?.notification?.image ||
                        "",
                      data: {
                        notificationFor: payload?.data?.notification_for,
                      },
                    };

                    try {
                      registration.showNotification(
                        notificationTitle,
                        notificationOptions
                      );

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
            } else if (permission === "default") {
              console.log("Notification permission default");
            }
          }
        }
      } catch (error) {
        console.error("Error getting permission or token:", error);
      }
    };

    try {
      const shouldInitializeMessaging =
        (messaging &&
          eventUserDetails &&
          eventUserDetails.id &&
          Notification.permission !== "granted") ||
        (eventUserDetails && eventUserDetails.id) ||
        (eventUserDetails &&
          eventUserDetails.id &&
          !getTabSpecificData("fcmToken")?.replace(/"/g, ""));
      if (shouldInitializeMessaging) {
        initFirebaseMessaging();
      }
    } catch (error) {
      console.error("Error initializing Firebase messaging:", error);
    }
  }, [eventUserDetails, router]);

  return loading ? <Loader /> : null;
};

export default useFirebaseMessaging;
