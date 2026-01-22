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
    window.location.href = "patient_dashboard.html";
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

    await db.collection("users").doc(user.uid).update({
      contact,
      emergencyContact,
      profileComplete: true
    });

    window.location.href = "patient_dashboard.html";
  });
