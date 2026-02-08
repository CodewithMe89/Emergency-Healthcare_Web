document
    .getElementById("completeProfileForm")
    ?.addEventListener("submit", async (e)=>{

        e.preventDefault();

        const contact = document.getElementById("contact").value.trim();
        const emergencyContact = document.getElementById("emergencyContact").value.trim();

        const user = auth.currentUser;

        await db.collection("users")
        .doc(user.uid)
        .update({
            contact,
            emergencyContact: true
        });

        document
        .getElementById("profileModal")
        .classList.add("hidden")
    })