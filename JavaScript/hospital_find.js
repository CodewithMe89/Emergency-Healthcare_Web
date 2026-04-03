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
            <strong style="color:#183a75;">${h.distance.toFixed(2)} km away</strong>
          </div>
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

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async function findNearby() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      list.innerHTML = "<li style='padding:20px'>Loading hospitals...</li>";

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=hospital&limit=20&bounded=1&viewbox=${longitude-0.05},${latitude+0.05},${longitude+0.05},${latitude-0.05}`
        );

        const data = await response.json();

        list.innerHTML = "";

        const hospitals = data.map(p => {
          const lat = parseFloat(p.lat);
          const lng = parseFloat(p.lon);

          const distance = calculateDistance(latitude, longitude, lat, lng);

          return {
            name: p.display_name.split(",")[0],
            address: p.display_name,
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

  btn.addEventListener('click', findNearby);
})();