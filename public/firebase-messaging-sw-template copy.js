importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "__FIREBASE_API_KEY__",
  authDomain: "__FIREBASE_AUTH_DOMAIN__",
  projectId: "__FIREBASE_PROJECT_ID__",
  storageBucket: "__FIREBASE_STORAGE_BUCKET__",
  messagingSenderId: "__FIREBASE_MESSAGING_SENDER_ID__",
  appId: "__FIREBASE_APP_ID__",
  measurementId: "__FIREBASE_MEASUREMENT_ID__",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
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
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
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
