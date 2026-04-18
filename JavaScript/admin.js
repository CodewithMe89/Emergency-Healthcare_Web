const auth = firebase.auth()
const db = firebase.firestore()

//Admin Auth.check
auth.onAuthStateChanged(async (user) => {
    if(!user){
        alert("Please Login First")
        window.location.href = "Login.html"
        return;
    }

    const snap = await db.collection("users").doc(user.uid).get();

    if(!snap.exists){
        alert("User Data not Found")
        window.location.href = "Login.html"
        return;
    }

    if(role !== "admin"){
        alert("Access denied: Not an admin")
        window.location.href = "index.html"
        return;
    }
    console.log("Admin access Granted")
});

db.collection('emergencies')
.onSnapshot(snapshot => {
    const container = document.getElementById('emergencyList')
    container.innerHTML =""

    snapshot.forEach(doc => {
        const data = doc.data()

        const div = document.createElement('div')
        div.innerHTML = `
        <p>Name: ${data.name}</p>
        <p>Contact: ${data.contact}</p>
        <button onclick="assignAmbulance('${doc.id}',${data.location.lat},${data.location.lng})">
        Assign Ambulance
        </button>
        <hr>
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
        <p>Driver: ${data.driverName}</p>
        <p>Status: ${data.status}</p>
        `;

        container.appendChild(div)
    })
})

function getDistance (lat1,lng1,lat2,lng2) {
    const R = 6371 //km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180

    const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
}

async function assignAmbulance(emergencyId, lat, lng) {

    const snapshot = await db.collection("ambulances").get();
    
    let nearest = null;
    let minDistance = Infinity;

    snapshot.forEach(doc => {
        const amb = doc.data()

        if(amb.status === "Available"){
            const dist = getDistance(
                lat,
                lng,
                amb.location.lat,
                amb.location.lng
            );
            if(dist < minDistance){
                minDistance = dist;
                nearest = {id: doc.id,...amb};

            }
        }
    })

    if(!nearest){
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