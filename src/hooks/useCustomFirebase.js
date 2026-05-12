import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios, {
  setTabSpecificData,
  getTabSpecificData,
  getActiveUserType,
} from "@/utils/axios/axios";
import config from "@/config";
import { messaging, getToken, onMessage } from "../../utils/firebase";
import {
  selectCorporateUserId,
  selectCorporateUserInfo,
  selectCorporateCompanyId,
  selectCorporateCompanyName,
  selectCorporateUserFirstName,
  selectCorporateUserLastName,
  selectCorporateUserEmail,
  selectCorporateUserMobile,
  selectCorporateIsAuthenticated,
} from "@/store/selectors/corporateSelectors";
import {
  selectB2CUserId,
  selectB2CUserFirstName,
  selectB2CUserLastName,
  selectB2CUserEmail,
  selectB2CUserMobile,
  selectIsLoggedIn,
} from "@/store/selectors/b2cSelectors";

/**
 * Custom hook for Firebase Messaging with multi-user type support
 * @param {Object} options - Configuration options
 * @param {string} [options.userType] - Optional user type override
 * @returns {Object} Messaging hook utilities
 */
const useFirebaseMessaging = ({ userType: propUserType } = {}) => {
  // ✅ Corporate Redux selectors
  const corporateUserId = useSelector(selectCorporateUserId);
  const corporateUserInfo = useSelector(selectCorporateUserInfo);
  const corporateCompanyId = useSelector(selectCorporateCompanyId);
  const corporateCompanyName = useSelector(selectCorporateCompanyName);
  const corporateFirstName = useSelector(selectCorporateUserFirstName);
  const corporateLastName = useSelector(selectCorporateUserLastName);
  const corporateEmail = useSelector(selectCorporateUserEmail);
  const corporateMobile = useSelector(selectCorporateUserMobile);
  const corporateIsAuthenticated = useSelector(selectCorporateIsAuthenticated);

  // ✅ B2C Redux selectors
  const b2cUserId = useSelector(selectB2CUserId);
  const b2cFirstName = useSelector(selectB2CUserFirstName);
  const b2cLastName = useSelector(selectB2CUserLastName);
  const b2cEmail = useSelector(selectB2CUserEmail);
  const b2cMobile = useSelector(selectB2CUserMobile);
  const b2cIsAuthenticated = useSelector(selectIsLoggedIn);

  // ✅ Current active user type
  const currentUserType = getActiveUserType();

  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  // Get user type safely from Redux or prop
  const getUserType = useCallback(() => {
    if (propUserType) return propUserType;
    return currentUserType;
  }, [propUserType, currentUserType]);

  // Get userId safely from Redux
  const getUserId = useCallback(() => {
    const userType = getUserType();
    if (userType === "corporate") {
      return corporateUserId;
    } else if (userType === "qugo") {
      return b2cUserId;
    }
    return null;
  }, [getUserType, corporateUserId, b2cUserId]);

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

      // ✅ Device ID is tab-specific, so we keep it in session storage
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

      // Validate user details based on type
      if (userType === "corporate") {
        if (
          !corporateCompanyId ||
          !corporateFirstName ||
          !corporateLastName ||
          !corporateEmail ||
          !corporateMobile
        ) {
          console.log(
            "Incomplete corporate user details. Skipping token registration."
          );
          return false;
        }
      } else if (userType === "qugo") {
        if (!b2cFirstName || !b2cLastName || !b2cEmail || !b2cMobile) {
          console.log(
            "Incomplete qugo user details. Skipping token registration."
          );
          return false;
        }
      }

      // Build additional data based on user type
      let additionalData = {};
      if (userType === "corporate") {
        additionalData = {
          companyId: corporateCompanyId,
          companyName: corporateCompanyName,
          firstName: corporateFirstName,
          lastName: corporateLastName,
          email: corporateEmail,
          mobile: corporateMobile,
        };
      } else if (userType === "qugo") {
        additionalData = {
          firstName: b2cFirstName,
          lastName: b2cLastName,
          email: b2cEmail,
          mobile: b2cMobile,
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

        // ✅ Store FCM token in session storage (device-specific)
        setTabSpecificData(`fcmToken_${userType}`, fcmToken);
        console.log(`Token sent to server successfully for ${userType}`);
        return true;
      } catch (err) {
        console.error(`Error sending token to server for ${userType}:`, err);
        setError(err);
        return false;
      }
    },
    [
      getUserId,
      getUserType,
      corporateCompanyId,
      corporateCompanyName,
      corporateFirstName,
      corporateLastName,
      corporateEmail,
      corporateMobile,
      b2cFirstName,
      b2cLastName,
      b2cEmail,
      b2cMobile,
    ]
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
        const { userId: targetUserId, userType: targetUserType } = event.data;
        let isValid = false;

        const currentUserId = getUserId();
        const currentUserType = getUserType();

        console.log(
          "Event userId:",
          targetUserId,
          "Current userId:",
          currentUserId
        );

        // Validate based on user type
        if (
          targetUserId === currentUserId &&
          targetUserType === currentUserType
        ) {
          isValid = true;
        } else if (targetUserType === "corporate") {
          isValid = corporateUserId === targetUserId;
        } else if (targetUserType === "qugo") {
          isValid = b2cUserId === targetUserId;
        }

        console.log("isValid:", isValid);

        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ isValid });
        }
      }
    },
    [getUserId, getUserType, corporateUserId, b2cUserId]
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

            // Check if it's a topic notification
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
                shouldShowNotification = corporateUserId === targetUserId;
              } else if (targetUserType === "qugo") {
                shouldShowNotification = b2cUserId === targetUserId;
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
    corporateUserId,
    b2cUserId,
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
