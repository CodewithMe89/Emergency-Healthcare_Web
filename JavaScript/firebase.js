const firebaseConfig = {
  apiKey: "AIzaSyAwl22tT7kJD1U0toxE0WckzOxHAao9Nzg",
  authDomain: "emergency-healthcare-17c29.firebaseapp.com",
  projectId: "emergency-healthcare-17c29",
  storageBucket: "emergency-healthcare-17c29.firebasestorage.app",
  messagingSenderId: "210921508011",
  appId: "1:210921508011:web:8308e17f37863a40727bee"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
