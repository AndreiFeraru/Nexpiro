importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyDA19uWnzdyp2z8hwz2KZ9yZIW6uMHhCoY",
  authDomain: "nexpiro-firebase.firebaseapp.com",
  projectId: "nexpiro-firebase",
  storageBucket: "nexpiro-firebase.appspot.com",
  messagingSenderId: "200709942102",
  appId: "1:200709942102:web:b1e24fed98503643ec84f7",
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // Customize notification here
  const notificationTitle = payload.notification?.title || "Default Title";
  const notificationOptions = {
    body: payload.notification?.body || "Default Body",
    icon: payload.notification?.icon || "/firebase-logo.png",
    // Additional options like badge, data, actions, etc., can be added here
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
