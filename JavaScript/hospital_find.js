(function () {
  const btn = document.getElementById('findHospitals');
  const list = document.getElementById('hList');

  function makeItem(h) {
    const li = document.createElement('li');
    li.style.padding = '14px 20px';
    li.style.borderTop = '1px solid #ecf1fb';
    li.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap;">
        <div>
          <div style="font-weight:700;color:#183a75;">${h.name}</div>
          <div style="color:#5a6ea8; font-size:.9rem;">
          ${h.address}<br>
          <strong style="color:#183a75;">${h.distance.toFixed(2)} km away</div>
        </div>
        <div>
          <a class="btn btn-primary" target="_blank"
             href="https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}">
             Directions
          </a>
        </div>
      </div>`;
    return li;
  }

  function calculateDistance(lat1, lon1, lat2, lon2){
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) + 
     Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

    return R * 2 * Math.atan2(Math.sqrt(a),Math.sqrt(1-a))
  }

function findNearby() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    const { latitude, longitude } = pos.coords;

    list.innerHTML = "<li style='padding:20px'>Loading real hospitals...</li>";

    const location = new google.maps.LatLng(latitude, longitude);

    const map = new google.maps.Map(document.createElement("div"));

    const service = new google.maps.places.PlacesService(map);

    const request = {
      location: location,
      radius: 5000,
      type: ["hospital"],
    };

    service.nearbySearch(request, (results, status) => {
      list.innerHTML = "";

      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        list.innerHTML = "<li style='padding:20px'>Failed to fetch hospitals</li>";
        return;
      }

      if (results.length === 0) {
        list.innerHTML = "<li style='padding:20px'>No hospitals found</li>";
        return;
      }

const hospitalsWithDistance = results.map(place =>{
  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();

  const distance = calculateDistance(latitude,longitude,lat,lng);
  return{
    name: place.name,
    address: place.vicinity,
    lat,
    lng,
    distance
  }
});

hospitalsWithDistance.sort((a,b)=> a.distance - b.distance);

hospitalsWithDistance.forEach(h => {
  list.appendChild(makeItem(h))
});
    });
  }, () => {
    alert("Location permission denied");
  });
}

// Add event listener to the button
btn.addEventListener('click', findNearby);
})();
