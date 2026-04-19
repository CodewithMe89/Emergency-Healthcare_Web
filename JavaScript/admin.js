const auth = firebase.auth()
const db = firebase.firestore()

//Admin Auth.check
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = "Login.html"
        return;
    }

    const snap = await db.collection("users").doc(user.uid).get();

    const role = snap.data().role;

    // if(!snap.exists){
    //     alert("User Data not Found")
    //     window.location.href = "Login.html"
    //     return;
    // }

    if (role !== "admin") {
        alert("Access denied: Not an admin")
        window.location.href = "index.html"
        return;
    }
});

const docs = snapshot.docs.sort((a, b) => {
  return a.data().status === "Pending" ? -1 : 1;
});

db.collection('emergencies')
    .onSnapshot(snapshot => {
        const container = document.getElementById('emergencyList')

        snapshot.forEach(doc => {
            const data = doc.data()

            const div = document.createElement('div')
            div.className = "card"
            div.innerHTML = `
        <div class="card-header">
        <span class="name">${data.name}</span>
        <span class="status ${data.status.toLowerCase()} ">${data.status}</span>
        </div>

        <div class="card-body">
        <p>📞 ${data.contact}</p>
        <p> 📍 Lat: ${data.location.lat || "N/A"}, Lng: ${data.location.lng || "N/A"}</p>
        </div>

        <div class="card-actions">
        <button onclick="assignAmbulance('${doc.id}', ${data.location?.lat || 0}, ${data.location?.lng || 0})">
        Assign
        </button>
        <button onclick="markComplete('${doc.id}')">Complete</button>
        `;

            container.appendChild(div)
        })
    })
//Ambulance list
db.collection("ambulances")
    .onSnapshot(snapshot => {
        const container = document.getElementById('ambulanceList');
        container.innerHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data()

            const div = document.createElement('div')

            div.innerHTML = `
        <div class="card">
        <div class="card-header">
        <span>Driver: ${data.driverName}</span>
        <span class="${data.status === "Available" ? "status available" : "status busy"}">
        ${data.status}
        </span>
        </div>
        </div>
        `;

            container.appendChild(div)
        })
    })

    async function markComplete(emergencyId){
        await db.collection("emergencies").doc(id).update({
            status: "Completed"
        })
    }
    
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371 //km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

async function assignAmbulance(emergencyId, lat, lng) {

    const snapshot = await db.collection("ambulances").get();

    let nearest = null;
    let minDistance = Infinity;

    snapshot.forEach(doc => {
        const amb = doc.data()

        if (amb.status === "Available") {
            const dist = getDistance(
                lat,
                lng,
                amb.location.lat,
                amb.location.lng
            );
            if (dist < minDistance) {
                minDistance = dist;
                nearest = { id: doc.id, ...amb };

            }
        }
    })

    if (!nearest) {
        alert("no Ambulance Available");
        return;
    }

    await db.collection("ambulances").doc(nearest.id).update({
        status: "Busy"
    });

    await db.collection("emergencies").doc(emergencyId).update({
        status: "Assigned",
        ambulanceId: nearest.id
    })
    alert("Ambulance Assinged!")
}