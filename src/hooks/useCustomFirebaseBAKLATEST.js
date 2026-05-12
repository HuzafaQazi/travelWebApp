import { useState, useEffect, useCallback } from "react";
import axios, {
  getTabSpecificData,
  setTabSpecificData,
} from "@/utils/axios/axios";
import config from "@/config";
import { useSelector } from "react-redux";
import { messaging, getToken, onMessage } from "../../utils/firebase";
import { getQugoLoggedInUserDetails } from "@/utils/axios/axios";

/**
 * Custom hook for Firebase Messaging with multi-user type support
 * @param {Object} options - Configuration options
 * @param {string} [options.userType] - Optional user type override
 * @returns {Object} Messaging hook utilities
 */
const useFirebaseMessaging = ({ userType: propUserType } = {}) => {
  const reduxIsLoggedIn = useSelector((state) => state?.user?.isLoggedIn);
  const reduxUserId = useSelector((state) => state?.user?.userInfo?.userId);
  const reduxUserInfo = useSelector((state) => state?.user?.userInfo);

  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  // Get user type safely from localStorage or prop
  const getUserType = useCallback(() => {
    if (propUserType) return propUserType;

    return typeof window !== "undefined"
      ? getTabSpecificData("loggedInUserType")?.replace(/"/g, "") || null
      : null;
  }, [propUserType]);

  // Get userId safely
  const getUserId = useCallback(() => {
    if (reduxIsLoggedIn && reduxUserId) return reduxUserId;
    return typeof window !== "undefined"
      ? getTabSpecificData("userID")?.replace(/"/g, "")
      : null;
  }, [reduxIsLoggedIn, reduxUserId]);

  /**
   * Send FCM token to server
   * @param {string} fcmToken - Firebase Cloud Messaging token
   */
  const sendTokenToServer = useCallback(
    async (fcmToken) => {
      const userId = getUserId();
      const userType = getUserType();

      if (!userId || !userType) {
        console.error(
          "User ID or User Type is empty, cannot send token to server"
        );
        setError(new Error("User ID and User Type are required"));
        return false;
      }

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

      if (userType === "corporate") {
        const corporateDetails =
          reduxUserInfo?.loggedInDetails?.userDetails || {};
        const { companyId, firstName, lastName, workEmail, mobile } =
          corporateDetails;
        if (!companyId || !firstName || !lastName || !workEmail || !mobile) {
          console.log(
            "Incomplete corporate user details. Skipping token registration."
          );
          return false;
        }
      } else if (userType === "qugo") {
        const qugoDetails = getQugoLoggedInUserDetails();
        if (!qugoDetails || !qugoDetails.loggedInDetails) {
          console.log(
            "Incomplete qugo user details. Skipping token registration."
          );
          return false;
        }
      }

      let additionalData = {};
      if (userType === "corporate") {
        additionalData = {
          companyId: reduxUserInfo?.companyId || null,
          companyName:
            reduxUserInfo?.loggedInDetails?.companyDetails?.companyName || null,
          firstName:
            reduxUserInfo?.loggedInDetails?.userDetails?.firstName || null,
          lastName:
            reduxUserInfo?.loggedInDetails?.userDetails?.lastName || null,
          email: reduxUserInfo?.loggedInDetails?.userDetails?.workEmail || null,
          mobile: reduxUserInfo?.loggedInDetails?.userDetails?.mobile || null,
        };
      } else if (userType === "qugo") {
        const qugoDetails = getQugoLoggedInUserDetails();
        additionalData = {
          firstName: qugoDetails?.loggedInDetails?.firstName || null,
          lastName: qugoDetails?.loggedInDetails?.lastName || null,
          email: qugoDetails?.loggedInDetails?.email || null,
          mobile: qugoDetails?.loggedInDetails?.mobile || null,
        };
      }

      try {
        const response = await axios.put(config.REGISTER_FCM_TOKEN, {
          userId: userId,
          token: fcmToken,
          userType: userType,
          deviceInfo,
          ...additionalData,
        });

        if (!response.ok) {
          throw new Error("Failed to send token to server");
        }

        setTabSpecificData(`fcmToken_${userType}`, fcmToken);
        console.log(`Token sent to server successfully for ${userType}`);
        return true;
      } catch (err) {
        console.error(`Error sending token to server for ${userType}:`, err);
        setError(err);
        return false;
      }
    },
    [getUserId, getUserType, reduxUserInfo]
  );

  /**
   * Save FCM token
   * @param {string} fcmToken - Firebase Cloud Messaging token
   */
  const saveToken = useCallback(
    async (fcmToken) => {
      const tokenSent = await sendTokenToServer(fcmToken);

      if (tokenSent) {
        const userType = getUserType();
        if (userType) {
          setTabSpecificData(`fcmToken_${userType}`, fcmToken);
          setToken(fcmToken);
        }
      }
    },
    [sendTokenToServer, getUserType]
  );

  // Memoize the service worker message handler to ensure stable reference
  const handleServiceWorkerMessage = useCallback(
    (event) => {
      console.log("Service worker message event:", event);
      if (event.data.type === "VALIDATE_NOTIFICATION") {
        const { userId, userType } = event.data;
        let isValid = false;

        // Handle individual user notifications
        const currentUserId = getUserId();
        const currentUserType = getUserType();

        console.log("Event userId:", userId, "Current userId:", currentUserId);

        if (userId === currentUserId && userType === currentUserType) {
          isValid = true;
        } else if (userType === "corporate") {
          const corporateUserId = reduxUserInfo?.userId;
          isValid = corporateUserId === userId;
        } else if (userType === "qugo") {
          const qugoDetails = getQugoLoggedInUserDetails();
          const qugoUserId = qugoDetails?.loggedInDetails?.userId;
          isValid = qugoUserId === userId;
        }

        console.log("isValid:", isValid);

        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ isValid });
        }
      }
    },
    [getUserId, getUserType, reduxUserInfo]
  );

  /**
   * Initialize Firebase Messaging
   */
  const initFirebaseMessaging = useCallback(async () => {
    const userId = getUserId();
    const userType = getUserType();

    if (!userId || !userType) {
      console.error(
        "User ID or User Type is empty, cannot initialize Firebase messaging"
      );
      setError(new Error("User ID and User Type are required"));
      return;
    }

    try {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker not supported");
      }

      if (!("PushManager" in window)) {
        throw new Error("PushManager is not supported");
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("firebase-messaging-sw registered", registration);

      // Remove any existing listener before adding a new one
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
      navigator.serviceWorker.addEventListener(
        "message",
        handleServiceWorkerMessage
      );

      if ("Notification" in window) {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          const fcmToken = await getToken(messaging);

          if (fcmToken) {
            await saveToken(fcmToken);
          }

          onMessage(messaging, (payload) => {
            const targetUserId = payload?.data?.user_id;
            const targetUserType = payload?.data?.user_type;
            const topicName = payload?.data?.topic_name;
            const isTopicFlag = payload?.data?.is_topic;

            // Check if it's a topic notification - first check topic_name, then is_topic
            const isTopicNotification =
              topicName || isTopicFlag === "true" || isTopicFlag === true;

            let shouldShowNotification = false;

            if (isTopicNotification) {
              // Handle topic notifications
              shouldShowNotification = true;
              console.log(
                `Topic notification received - Topic: ${topicName}, Should show: ${shouldShowNotification}`
              );
            } else {
              // Handle individual user notifications
              const currentUserId = getUserId();
              const currentUserType = getUserType();

              if (
                targetUserId === currentUserId &&
                targetUserType === currentUserType
              ) {
                shouldShowNotification = true;
              } else if (targetUserType === "corporate") {
                const corporateUserId = reduxUserInfo?.userId;
                shouldShowNotification = corporateUserId === targetUserId;
              } else if (targetUserType === "qugo") {
                const qugoDetails = getQugoLoggedInUserDetails();
                const qugoUserId = qugoDetails?.loggedInDetails?.userId;
                shouldShowNotification = qugoUserId === targetUserId;
              }
            }

            console.log("shouldShowNotification:", shouldShowNotification);

            if (!shouldShowNotification) {
              if (isTopicNotification) {
                console.log(
                  `Topic notification not for subscribed topics. Topic: ${topicName}`
                );
              } else {
                console.log(
                  `Notification not for any associated user ID. Notification target: ${targetUserType}/${targetUserId}`
                );
              }
              return;
            }

            console.log("Message received: ", payload);

            if (isTopicNotification) {
              console.log(`Showing topic notification for topic: ${topicName}`);
            } else {
              console.log(
                `Showing notification for ${targetUserType} user with ID ${targetUserId}`
              );
            }

            try {
              if (!document.hidden) {
                const notificationTitle =
                  payload?.data?.title || payload?.notification?.title;
                const notificationOptions = {
                  body: payload?.data?.body || payload?.notification?.body,
                  icon:
                    payload?.data?.icon ||
                    payload?.notification?.icon ||
                    `/img/Notifications/qugo_icon.png` ||
                    "",
                  image:
                    payload?.data?.image || payload?.notification?.image || "",
                  data: {
                    notificationFor: payload?.data?.notification_for,
                    isTopicNotification,
                    topicName: isTopicNotification ? topicName : undefined,
                  },
                };

                try {
                  registration.showNotification(
                    notificationTitle || "",
                    notificationOptions
                  );

                  registration.addEventListener(
                    "notificationclick",
                    async (event) => {
                      event.notification.close();
                      if (
                        payload.data?.notification_for === "messages" &&
                        window.location.pathname !== "/CIT-95"
                      ) {
                        window.focus();
                        window.location.href = "/CIT-95";
                      }
                    }
                  );
                } catch (notificationError) {
                  console.error(
                    "Error creating notification:",
                    notificationError
                  );
                }
              }
            } catch (messageError) {
              console.error("Error processing message:", messageError);
            }
          });
        } else if (permission === "denied") {
          console.log(`Notification permission denied for ${userType}`);
          setError(new Error("Notification permission denied"));
        } else if (permission === "default") {
          console.log(`Notification permission default for ${userType}`);
        }
      } else {
        throw new Error("Notifications are not supported");
      }
    } catch (initError) {
      console.error(
        `Error initializing Firebase messaging for ${userType}:`,
        initError
      );
      setError(initError);
    }
  }, [
    saveToken,
    getUserId,
    getUserType,
    reduxUserInfo,
    handleServiceWorkerMessage,
  ]);

  // Initialize on component mount and when userType changes
  useEffect(() => {
    setError(null);
    setToken(null);

    const userId = getUserId();
    const userType = getUserType();
    if (userId && userType) {
      initFirebaseMessaging();
    }

    const handleUserTypeChange = () => {
      console.log("User type changed, reinitializing Firebase messaging");
      initFirebaseMessaging();
    };

    window.addEventListener("userTypeChanged", handleUserTypeChange);

    // Cleanup listeners on unmount or dependency change
    return () => {
      window.removeEventListener("userTypeChanged", handleUserTypeChange);
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
      console.log("Cleaned up event listener");
    };
  }, [
    propUserType,
    initFirebaseMessaging,
    getUserId,
    getUserType,
    handleServiceWorkerMessage,
  ]);

  return {
    token,
    error,
    initFirebaseMessaging,
  };
};

export default useFirebaseMessaging;
