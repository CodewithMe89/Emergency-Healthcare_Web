const auth = firebase.auth();
const db = firebase.firestore();

document.body.style.display = "none";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "Login.html";
    return;
  }

  const snap = await db.collection('users').doc(user.uid).get();

  // If already completed → block access

  if (snap.exists && snap.data().profileComplete === true) {
    window.location.href = "index.html";
  } else {
    document.body.style.display = "block";
  }
});

document
  .getElementById("completeProfileForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const contact = document.getElementById("contact").value.trim();
    const emergencyContact = document.getElementById("emergencyContact").value.trim();
    const medical = document.getElementById('medical').value.trim();
    const allergies = document.getElementById('allergies').value.trim()

    if (!contact || !emergencyContact) {
      alert("Phone and Emergency Contact are required");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(contact) || !phoneRegex.test(emergencyContact)) {
      alert("Enter valid 10-digit numbers");
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      alert("Session expired. Please log in again.")
      window.location.href = "Login.html"
      return;
    }
    try {
      await db.collection("users").doc(user.uid).set({
        contact,
        emergencyContact,
        medicalHistory: medical,
        allergies: allergies,
        profileComplete: true
      }, { merge: true });
      alert("Profile updated successfully!")
      window.location.href = "index.html";
    } catch (err) {
      alert("update failed: " + err.message)
    }

  });
