if(!firebase.apps.length){
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

  const useMyLocBtn = document.getElementById("useMyLocation");
  const addressInput = document.getElementById("reportAddress");
  const coordHelper = document.getElementById("coordHelper");
  const descInput = document.getElementById("reportDesc");

  // Location button
  useMyLocBtn?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        coordHelper.textContent = `Coordinates: ${latitude.toFixed(
          5
        )}, ${longitude.toFixed(5)}`;
      },
      (err) => alert("Could not get location: " + err.message),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });

  // Submit report
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      address: addressInput.value.trim(),
      description: descInput.value.trim(),
      coords: coordHelper.textContent || null,
      source: "public-report",
      createdAt: Date.now(),
      status: "new",
      imageUrl: null,
    };

    // Upload image if selected
    if (imageInput && imageInput.files.length > 0) {
      try {
        payload.imageUrl = await uploadImageToCloudinary(
          imageInput.files[0]
        );
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
