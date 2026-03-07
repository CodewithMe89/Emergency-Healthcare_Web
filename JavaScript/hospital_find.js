async function fetchHospitals(lat, lng) {
      const radius = 5000;
      const query = `
  [out:json];
  (
    node["amenity"="hospital"](around:${radius},${lat},${lng});
    way["amenity"="hospital"](around:${radius},${lat},${lng});
    relation["amenity"="hospital"](around:${radius},${lat},${lng});
  );
  out center tags;
  `;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      });

      const data = await res.json();
      return data.elements;
    }

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
          <div style="color:#5a6ea8; font-size:.9rem;">${h.address}</div>
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

      async function findNearby() {
        if (!navigator.geolocation) {
          alert("Geolocation not supported");
          return;
        }

        navigator.geolocation.getCurrentPosition(async pos => {
          const { latitude, longitude } = pos.coords;
          list.innerHTML = "<li style='padding:20px'>Loading real hospitals...</li>";

          try {
            const hospitals = await fetchHospitals(latitude, longitude);
            list.innerHTML = "";

            if (hospitals.length === 0) {
              list.innerHTML = "<li style='padding:20px'>No hospitals found nearby</li>";
              return;
            }

            hospitals.forEach(h => {
              const lat = h.lat || h.center?.lat;
              const lng = h.lon || h.center?.lon;

              list.appendChild(makeItem({
                name: h.tags?.name || "Unnamed Hospital",
                address: h.tags?.["addr:street"] || "Address not available",
                lat,
                lng
              }));
            });
          } catch (err) {
            console.error(err);
            alert("Failed to fetch hospitals");
          }
        });
      }

      btn.addEventListener('click', findNearby);
    })();