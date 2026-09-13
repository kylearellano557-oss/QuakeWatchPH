const currentdate = new Date();
currentdate.setDate(currentdate.getDate() - 7);

let targetMarker = null;
const starttime = currentdate.toISOString().split("T")[0];
const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${starttime}&orderby=time`; // World earthquake records
const phUrl = `https://www.seismicportal.eu/fdsnws/event/1/query?format=json&minlatitude=4&maxlatitude=22&minlongitude=116&maxlongitude=127&starttime=${starttime}&orderby=time`; // Philippines earthquake records
const plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
const faultlines_url = "https://raw.githubusercontent.com/GEMScienceTools/gem-global-active-faults/master/geojson/gem_active_faults.geojson";
const showMap = L.map('showMap', { zoomControl: false, minZoom: 2, maxBounds: [[-85.0511, -200], [85.0511, 200]], maxBoundsViscosity: 0.8 }).setView([0, 0], 2); // World Map
const loadingQuakeData = document.getElementById("loadingQuakeData");
const openTsunamiModal = document.getElementById("tsunamiAlerts").parentElement;
localStorage.removeItem("savedLatPH");
localStorage.removeItem("savedLngPH");
localStorage.removeItem("savedZoomPH");
localStorage.removeItem("savedLat");
localStorage.removeItem("savedLng");
localStorage.removeItem("savedZoom");

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(showMap);

L.control.zoom({position: 'bottomright'}).addTo(showMap); // Zoom buttons on map.

fetch(phUrl)
.then(response => response.json())
.then(data => {
    const philippines = document.getElementById("phQuakes");
    philippines.textContent = data.features.length || 0;
    
}).catch(error => {
    console.error("Fetch Error:", error);
});

fetch(url)
.then(response => response.json())
.then(data => {
    const totalQuakes = document.getElementById("totalQuakes");
    const strongest = document.getElementById("strongest");
    const tsunamiAlerts = document.getElementById("tsunamiAlerts");
    const recentEarthquakes = document.getElementById("recentEarthquakes");
    const recentTsunami = document.getElementById("recentTsunami");
    
    //Total earthquakes
    totalQuakes.textContent = data.features.length || 0;

    // Strongest earthquake
    let strongestQuake = 0;
    let strongestPlace = "";
    
    // Tsunami counts and data
    const tsunamiData = data.features.filter(quake => Number(quake.properties?.tsunami) === 1);
    const tsunamiCount = tsunamiData.length;

    data.features.filter(quake => { return quake.properties.mag >= 1.0 }).forEach(quake => {
        if (quake.properties.mag > strongestQuake) {
            strongestQuake = quake.properties.mag;
            strongestPlace = quake.properties.place;
        }
    });
    
    strongest.textContent = `M ${strongestQuake} - ${strongestPlace}`;
    tsunamiAlerts.textContent = tsunamiCount > 0 ? `${tsunamiCount} Tsunami Alerts.` : "No Tsunami Alerts.";
    
    loadingQuakeData.remove();
    
    data.features.slice(0, 50).forEach(quake => {
        let lat = quake.geometry.coordinates[1];
        let lng = quake.geometry.coordinates[0];
        
        const magnitude = quake.properties.mag;
        
        let color = "";
        
        if (magnitude <= 3.0) {
            color = "green";
        } else if (magnitude <= 4.9) {
            color = "yellow";
        } else if (magnitude <= 6.9) {
            color = "orange";
        } else if (magnitude <= 7.9) {
            color = "red";
        } else if (magnitude <= 8.9) {
            color = "darkred";
        } else if (magnitude <= 10) {
            color = "darkviolet";
        } else {
            color = "gray";
        }
        
        recentEarthquakes.innerHTML += `
            <tr>
                <td><strong style="color: ${color}">M ${magnitude}</strong></td>
                <td>${quake.properties.place ?? quake.properties.flynn_region}</td>
                <td>${new Date(quake.properties.time).toLocaleString()}</td>
                <td><button class="tableRow"><i class="fas fa-eye"></i> Show on Map</button></td>
            </tr>
        `;
        
        const tableRow = document.querySelectorAll(".tableRow");
        
        tableRow.forEach((tr, index) => {
            tr.addEventListener("click", function() {
                const quake = data.features[index];
                showMapModal.style.display = "flex";
                document.body.classList.add("modal-open")
                
                if (navbar.classList.contains("active")) {
                    menuBtn.classList.toggle("fa-times");
                }
                
                navbar.classList.remove("active");
                
                let targetRad;
                let targetColor = "";
                const targetMag = quake.properties.mag;
                const targetLat = quake.geometry.coordinates[1];
                const targetLng = quake.geometry.coordinates[0];
                
                if (targetMag <= 3.0) {
                    targetColor = "green";
                } else if (targetMag <= 4.9) {
                    targetColor = "yellow";
                } else if (targetMag <= 6.9) {
                    targetColor = "orange";
                } else if (targetMag <= 7.9) {
                    targetColor = "red";
                } else if (targetMag <= 8.9) {
                    targetColor = "darkred";
                } else if (targetMag <= 10) {
                    targetColor = "darkviolet";
                } else {
                    targetColor = "gray";
                }
                
                if (targetMag < 3.0) {
                    targetRad = 5;
                } else {
                    targetRad = targetMag * 2;
                }
                
                setTimeout(() => {
                    showMap.invalidateSize();
                    showMap.setView([targetLat, targetLng], 12);
                    
                    targetMarker = L.circleMarker([targetLat, targetLng], { radius: targetRad, fillColor: targetColor, color: "#fff", weight: 1, opacity: 1, fillOpacity: 0.8 })
                    .addTo(showMap)
                    .bindPopup(`
                        <h3>Earthquake Information</h3>
                        <b>${quake.properties.place ?? quake.properties.flynn_region ?? quake.properties.region}</b><br>
                        Magnitude: <b>${quake.properties.mag}</b><br>
                        Date: <b>${new Date(quake.properties.time).toLocaleDateString()}</b><br>
                        Time: <b>${new Date(quake.properties.time).toLocaleTimeString()}</b><br>
                        <button class="details-btn" onclick="window.location.href='${quake.properties.url}';">More details</button>
                    `)
                    .openPopup();
                }, 10);
            });
        });
    });
    
    openTsunamiModal.addEventListener("click", function() {
        showTsunamiModal.style.display = "flex";
        document.body.classList.add("modal-open")
        
        tsunamiData.forEach(quake => {
            const magnitude = quake.properties.mag;
            const date = new Date(quake.properties.time);
            
            let color = "";
            
            if (magnitude < 3.0) {
                color = "green";
            } else if (magnitude <= 4.9) {
                color = "yellow";
            } else if (magnitude <= 6.9) {
                color = "orange";
            } else {
                color = "red";
            }
            
            if (quake.properties?.tsunami === 1) {
                recentTsunami.innerHTML += `
                    <tr>
                        <td><strong style="color: ${color};">M ${magnitude}</strong></td>
                        <td>${quake.properties.place ?? quake.properties.flynn_region}</td>
                        <td>${date.toLocaleString()}</td>
                    </tr>
                `;
            } else {
                recentTsunami.innerHTML += `
                    <tr>
                        <td colspan="3" style="text-align:center;">No Tsunami Data</td>
                    </tr>
                `;
            }
        });
    });
    
    fetch(plates_url).then(response => {
        return response.json();
    }).then(data => {
        let plateLayer;
        
        plateLayer = L.geoJSON(data, {
            style: {
                color: "#ff0000",
                weight: 2.5,
                opacity: 0.9,
            }
        });
        
        if (localStorage.getItem("showPlates") === "true") {
            plateLayer.addTo(showMap);
        }
    });
        
    fetch(faultlines_url).then(response => {
        return response.json();
    }).then(data => {
        let faultLayer;
        
        faultLayer = L.geoJSON(data, {
            style: {
                color: "#ff00ff",
                weight: 2,
                opacity: 0.9,
            }
        });
        
        if (localStorage.getItem("showFaults") === "true") {
            faultLayer.addTo(showMap);
        }
    });
    
    const last7Days = {};
    const today = new Date();
    
    // Initialize the last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
    
        const key = d.toISOString().split("T")[0];
        last7Days[key] = 0;
    }
    
    // Count earthquakes per day
    data.features.forEach(quake => {
        const key = new Date(quake.properties.time)
            .toISOString()
            .split("T")[0];
    
        if (last7Days.hasOwnProperty(key)) {
            last7Days[key]++;
        }
    });
    
    const labels = Object.keys(last7Days).map(date =>
        new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    );
    
    const counts = Object.values(last7Days);
    
    new Chart(document.getElementById("quakeChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Earthquakes",
                data: counts,
                borderColor: "#ff9800",
                backgroundColor: "rgba(255, 152, 0, 0.2)",
                pointBackgroundColor: "#ff9800",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                borderWidth: 3,
                fill: true,
                tension: 0.35
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });

}).catch(error => {
    console.error("Fetch Error:", error);
});