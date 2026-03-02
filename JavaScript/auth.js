function showform(formId) {
  document.querySelectorAll(".form-box").forEach(form => form.classList.remove("active"));
  const target = document.getElementById(formId);
  if (target) target.classList.add("active");
}

const auth = firebase.auth();
const db = firebase.firestore(); 

const googleProvider = new firebase.auth.GoogleAuthProvider();
//Google Sign-In

const googleLogin = async() =>{
  try {
    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;

    const userRef = db.collection("users").doc(user.uid);
    const snap = await userRef.get();

    if(!snap.exists){
      await userRef.set({
        name: user.displayName || " ",
        email: user.email,
        role: "patient",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        provider: "google",
        profileComplete: false
  });
    }
    window.location.href = "complete_profile.html"
}
catch(error){
    alert(error.message);
  }
}

const googleBtn = document.getElementById("googleSignIn");
if(googleBtn){
  googleBtn.addEventListener("click", googleLogin);
}

// Register (Auth + Firestore)
const register = () => {
  const name = (document.getElementById("name") || {}).value || "";
  const email = (document.getElementById("email") || {}).value || "";
  const password = (document.getElementById("password") || {}).value || "";
  const contact = (document.getElementById("contact") || {}).value || "";
  const emergencyContact = (document.getElementById("emergencyContact") || {}).value || "";
  const role = document.getElementById("role")?.value || "patient";

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      // Save profile WITHOUT password
      return db.collection("users").doc(user.uid).set({
        name,
        email,
        contact,
        emergencyContact,
        role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("Registration successful!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};

// Login
const login = () => {
  const email = (document.getElementById("loginEmail") || {}).value || "";
  const password = (document.getElementById("loginPassword") || {}).value || "";

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Login successful!");
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};

// Form submit handlers (Register and Login pages)
document.addEventListener('DOMContentLoaded', function () {
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
      event.preventDefault();
      register();
    });
  }
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      login();
    });
  }
});


// Auth state → toggle UI on any page
auth.onAuthStateChanged(async (user) => {
  const userPill = document.getElementById('user-pill');
  const pillName = document.getElementById('pillName');
  const pillEmail = document.getElementById('pillEmail');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileBtn = document.getElementById('profileBtn');

  // Prefer class selectors added in nav
  const loginLink = document.querySelector('.nav-login') || document.querySelector('a[href*="Login"]');
  const registerLink = document.querySelector('.nav-register') || document.querySelector('a[href*="Register"]');

  if (!user) {
    if (userPill) userPill.style.display = 'none';
    if (loginLink) loginLink.style.display = '';
    if (registerLink) registerLink.style.display = '';
    return;
  }

  try {
    const snap = await db.collection('users').doc(user.uid).get();
    const data = snap.exists ? snap.data() : {};
    if (pillName) pillName.textContent = data.name || user.displayName || 'User';
    if (pillEmail) pillEmail.textContent = data.email || user.email || '';

    if (userPill) userPill.style.display = 'block';
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';

    if (profileBtn) {
      profileBtn.onclick = () => {
        // Navigate only if page exists; else no-op
        window.location.href = 'dashboard.html';
      };
    }
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await auth.signOut();
        window.location.href = 'index.html';
      };
    }
  } catch (e) {
    alert(e.message);
  }
});

document.addEventListener("click", (e) => {
  if(!e.target.classList.contains("toggle-password")) return;

  const inputId = e.target.dataset.target;
  const input = document.getElementById(inputId);

  if(!input) return;

  if(input.type === "password"){
    input.type = "text";
    e.target.textContent = "Visibility_off";
} else{
  input.type = "password";
  e.target.textContent = "Visibility";
}
})


