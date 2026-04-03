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

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  async function findNearby() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      list.innerHTML = "<li style='padding:20px'>Loading real hospitals...</li>";

try {
      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchNearby",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": "AIzaSyBsZHAc0hsb8asR_jSMrzEyH5pC-DxexCE",
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location"
          },
          body: JSON.stringify({
            includedTypes: ["hospital"],
            maxResultCount: 20,
            locationRestriction: {
              circle: {
                center: {
                  latitude: latitude,
                  longitude: longitude
                },
                radius: 5000
              }
            }
          })
        }
      );

      if(!response.ok){
        throw new Error(`HTTP error: ${response.status}`)
      }
      const data = await response.json();
      console.log(data)

      list.innerHTML = "";

      if (!data.places || data.places.length === 0) {
        list.innerHTML = "<li>No hospitals found</li>";
        return;
      }

      // 🔥 DISTANCE + SORT
      const hospitals = data.places.map(p => {
        const lat = p.location.latitude;
        const lng = p.location.longitude;

        const distance = calculateDistance(
          latitude,
          longitude,
          lat,
          lng
        );

        return {
          name: p.displayName.text,
          address: p.formattedAddress,
          lat,
          lng,
          distance
        };
      });

      hospitals.sort((a, b) => a.distance - b.distance);

      hospitals.forEach(h => {
        list.appendChild(makeItem(h));
      });

    } catch (err) {
      console.error(err);
      list.innerHTML = "<li>Error loading hospitals</li>";
    }

  });
}

// Add event listener to the button
btn.addEventListener('click', findNearby);
}) ();
