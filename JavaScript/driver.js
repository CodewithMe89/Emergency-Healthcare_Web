const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
    if(!user){
        window.location.href = 'Login.html';
        return;
    }
    startTracking(user.uid);
})

function startTracking(driverId){
    if(!navigator.geolocation){
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.watchPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

    try {
        await db.collection('ambulances').doc(driverId).set({
        location: {lat,lng}
    },{merge: true});
    }catch(e){
        console.error("Update failed", e)
    }

    const status = document.getElementById('status');
    if(status){
        status.innerText = `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
    },
(err)=> {
    console.error(err);
    alert("Location permission denied or unavailable")
},
{enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 5000
})
}