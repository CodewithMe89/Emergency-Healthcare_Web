const firebaseApp = !firebase.apps || firebase.apps.length === 0
  ? firebase.initializeApp({
    apiKey: "AIzaSyAwl22tT7kJD1U0toxE0WckzOxHAao9Nzg",
    authDomain: "emergency-healthcare-17c29.firebaseapp.com",
    projectId: "emergency-healthcare-17c29",
    storageBucket: "emergency-healthcare-17c29.firebasestorage.app",
    messagingSenderId: "210921508011",
    appId: "1:210921508011:web:8308e17f37863a40727bee"
  })
  : firebase.app();
const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "Login.html";
    return;
  }

  const userRef = db.collection("users").doc(user.uid);
  const snap = await userRef.get();

  // If already completed → block access

  if (snap.exists && snap.data().profileComplete === true) {
    window.location.href = "index.html";
  }
});

document
  .getElementById("completeProfileForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const contact = document.getElementById("contact").value.trim();
    const emergencyContact = document.getElementById("emergencyContact").value.trim();

    if (!contact || !emergencyContact) {
      alert("All fields are required");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    await db.collection("users").doc(user.uid).set({
      contact,
      emergencyContact,
      profileComplete: true
    }, {merge: true});

    window.location.href = "index.html";
  });
