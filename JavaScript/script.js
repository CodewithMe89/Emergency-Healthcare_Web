if (!firebase.apps.length) {
  alert("firebase not initialized properly");
}
// ================= IMAGE PREVIEW =================

const imageInput = document.getElementById("reportImage");
const imagePreview = document.getElementById("imagePreview");

imageInput?.addEventListener("change", () => {
  imagePreview.innerHTML = "";
  const file = imageInput.files[0];
  if (!file) return;

  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  imagePreview.appendChild(img);
});

// ================= SOS MODAL =================

(function () {
  const sosBtn = document.getElementById("sosBtn");
  const sosModal = document.getElementById("sosModal");
  const sosCountdown = document.getElementById("sosCountdown");
  const cancelSosBtn = document.getElementById("cancelSosBtn");
  const sendNowBtn = document.getElementById("sendNowBtn");

  if (!sosBtn || !sosModal) return;

  let timerId = null;
  let remaining = 15;

  function openModal() {
    remaining = 15;
    sosCountdown.textContent = String(remaining);
    sosModal.style.display = "flex";

    timerId = setInterval(() => {
      remaining -= 1;
      sosCountdown.textContent = String(remaining);

      if (remaining <= 0) {
        clearInterval(timerId);
        triggerSOS();
      }
    }, 1000);
  }

  function closeModal() {
    sosModal.style.display = "none";
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function triggerSOS() {
    closeModal();
    window.location.href = "tel:112";
  }

  sosBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  cancelSosBtn?.addEventListener("click", closeModal);
  sendNowBtn?.addEventListener("click", triggerSOS);

  sosModal.addEventListener("click", (e) => {
    if (e.target === sosModal) closeModal();
  });
})();

// ================= Detect Logic =================

async function detectAccident(file) {

  let formData = new FormData();
  formData.append("file", file);

  let res = await fetch("https://emergency-healthcare-web.onrender.com/detect-accident", {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    throw new Error("Detector server failed")
  }

  let data = await res.json();

  return data.result;
}

// ================= CLOUDINARY UPLOAD =================

async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "accident_reports");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dunewrawd/image/upload",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  return data.secure_url;
}

// ================= REPORT EMERGENCY FORM =================
(function () {
  const form = document.getElementById("report-form");
  if (!form) return;

  const useMyLocBtn = document.getElementById("useLocation");
  const addressInput = document.getElementById("address");
  const coordHelper = document.getElementById("coordHelper");
  const descInput = document.getElementById("reportDesc");
  let userCoords = null;

  // Location button
useMyLocBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }


  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    userCoords = {lat,lng};

    const apiKey = "AIzaSyBiaLk4E3q-mIDkUBHcec8790LhCzcDLaY";

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );

      const data = await response.json();

      if (data.status === "OK") {
        document.getElementById("address").value =
          data.results[0].formatted_address;
      } else {
        alert("Address not found");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  });
});

  // Submit report
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      address: addressInput.value.trim(),
      description: descInput.value.trim(),
      coords: userCoords,
      source: "public-report",
      createdAt: Date.now(),
      status: "new",
      imageUrl: null,
    };

    // Upload image if selected
    if (imageInput && imageInput.files.length > 0) {

      const file = imageInput.files[0];

      // RUN DEEPFAKE DETECTOR
      try {
        const accidentResult = await detectAccident(file);
        console.log("AI result:", accidentResult);

        if (accidentResult !== "ACCIDENT") {
          alert("No accident detected. Report blocked.")
          return;
        }
      } catch (err) {
        console.error("AI Error:", err);
        alert("AI Server failed. Try again");
        return;
      }

      // Upload to Cloudinary if image is real
      try {
        payload.imageUrl = await uploadImageToCloudinary(file);
      } catch (err) {
        alert("Image upload failed: " + err.message);
        return;
      }

    }

    // Save to Firestore
    try {
      const db = firebase.firestore();
      await db.collection("incidents").add(payload);

      alert("Report sent successfully!");
      form.reset();
      imagePreview.innerHTML = "";
    } catch (err) {
      alert("Failed to send report: " + err.message);
    }
  });
})();
