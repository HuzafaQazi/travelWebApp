importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyAoj8OatGfs45Oyg8dfr5S9zgmqHKtH2e8",
  authDomain: "qugoqa.firebaseapp.com",
  projectId: "qugoqa",
  storageBucket: "qugoqa.firebasestorage.app",
  messagingSenderId: "525463479832",
  appId: "1:525463479832:web:e9ab14998e7eaa2797c56d",
  measurementId: "G-20NHWD21WR",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(async function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // Extract target user information from payload
  const targetUserId = payload?.data?.user_id;
  const targetUserType = payload?.data?.user_type;
  const topicName = payload?.data?.topic_name;
  const isTopicFlag = payload?.data?.is_topic;

  const isTopicNotification =
    topicName || isTopicFlag === "true" || isTopicFlag === true;

  // Initialize validation flag
  let shouldShowNotification = false;

  // If it's a topic notification, show it directly without validation
  if (isTopicNotification) {
    console.log(
      `Topic notification received for topic: ${topicName}, showing directly`
    );
    shouldShowNotification = true;
  } else {
    try {
      // Get client windows to access localStorage
      const clientList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      console.log("clientList", clientList);

      if (clientList.length > 0) {
        // Send a message to the client to get user info from localStorage
        const validationPromises = clientList.map((client) => {
          return new Promise((resolve) => {
            // Set up a one-time message event handler for this request
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
              resolve(event.data);
            };

            // Ask the client to get user data from localStorage
            client.postMessage(
              {
                type: "VALIDATE_NOTIFICATION",
                userId: targetUserId,
                userType: targetUserType,
              },
              [messageChannel.port2]
            );

            // Set a timeout in case the client doesn't respond
            setTimeout(() => resolve({}), 500);
          });
        });

        const validationResults = await Promise.all(validationPromises);
        console.log("validationResults", validationResults);
        shouldShowNotification = validationResults.some(
          (result) => result.isValid === true
        );
      } else {
        // If no clients are available, fall back to simple validation
        console.log(
          "No clients available to validate user ID, showing notification by default"
        );
        shouldShowNotification = true;
      }
    } catch (error) {
      console.error("Error during notification validation:", error);
      // In case of error, default to showing the notification
      shouldShowNotification = true;
    }
  }

  // Only show notification if validation passed
  if (shouldShowNotification) {
    const notificationTitle =
      payload?.data?.title || payload?.notification?.title;
    const notificationOptions = {
      body: payload?.data?.body || payload?.notification?.body,
      icon:
        payload?.data?.icon ||
        payload?.notification?.icon ||
        "/img/Notifications/qugo_icon.png",
      image: payload?.data?.image || payload?.notification?.image || "",
      data: {
        notificationFor: payload?.data?.notification_for,
        userId: targetUserId,
        userType: targetUserType,
      },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  } else {
    console.log(
      `Notification not shown as it's not for the current user: ${targetUserType}/${targetUserId}`
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("[firebase-messaging-sw.js] Notification click Received.", event);

  event.notification.close();

  if (event.notification.data.notificationFor === "messages") {
    event.waitUntil(clients.openWindow("/CIT-95"));
  } else {
    event.waitUntil(clients.openWindow("/"));
  }
});
