const currentdate = new Date();
const starttime = new Date(currentdate);
starttime.setUTCDate(currentdate.getUTCDate() - 6);
starttime.setUTCHours(0, 0, 0, 0);
const endtime = new Date(currentdate);
const startdate = starttime.toISOString();
const enddate = endtime.toISOString();
const usgsUrl = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startdate}&endtime=${enddate}&orderby=time`; // World earthquake records
const phUrl = "https://data.garbinwx.org/api/earthquakes.json";
const urls = [usgsUrl, phUrl]
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

let targetMarker = null;

const defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

const satelliteMap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles © Esri",
});

const savedMap = localStorage.getItem("mapType");

if (savedMap === "satellite") {
    satelliteMap.addTo(showMap);
} else {
    defaultMap.addTo(showMap);
}

const baseMaps = { "Street Map": defaultMap, "Satellite Map": satelliteMap };

L.control.layers({ "Street Map": defaultMap, "Satellite Map": satelliteMap }, {}, { position: "bottomleft" }).addTo(showMap);
L.control.zoom({position: 'bottomright'}).addTo(showMap); // Zoom buttons on map

Promise.all([
    fetch(usgsUrl).then(response => response.json()),
    fetch(phUrl).then(response => response.json())
]).then(([usgsData, phData]) => {
    const totalQuakes = document.getElementById("totalQuakes");
    const phQuakes = document.getElementById("phQuakes");
    const strongest = document.getElementById("strongest");
    const tsunamiAlerts = document.getElementById("tsunamiAlerts");
    const recentEarthquakes = document.getElementById("recentEarthquakes");
    const recentTsunami = document.getElementById("recentTsunami");
    
    // USGS earthquake data
    const usgsQuakeData = (usgsData.features || []).map(quake => ({
        source: "USGS",
        magnitude: Number(quake.properties?.mag),
        location: quake.properties?.place,
        time: new Date(quake.properties?.time),
        latitude: Number(quake.geometry?.coordinates?.[1]),
        longitude: Number(quake.geometry?.coordinates?.[0]),
        url: quake.properties?.url,
        tsunami: quake.properties?.tsunami
    }));

    // Philippine earthquake data
    const phQuakeData = (phData.earthquakes || []).map(quake => ({
        source: "PHIVOLCS",
        magnitude: Number(quake.magnitude),
        location: quake.location,
        time: new Date(quake.timestamp_iso),
        latitude: Number(quake.latitude),
        longitude: Number(quake.longitude),
        url: quake.bulletin_url.replace(/\\/g, "/")
    }));

    // Combine both datasets
    const earthquakeData = [...usgsQuakeData, ...phQuakeData]
    .filter(quake => {
        return (quake.time >= starttime && quake.time <= currentdate && quake.magnitude >= 1.0 && Number(quake.latitude) && Number(quake.longitude));
    }).sort((a, b) => b.time - a.time);
    
    // Philippine earthquakes in the last 7 days
    const phEarthquakeData = [...phQuakeData]
    .filter(quake => {
        return (quake.time >= starttime && quake.time <= currentdate && quake.magnitude >= 1.0 && Number(quake.latitude) && Number(quake.longitude));
    });
    
    //Total earthquakes
    totalQuakes.textContent = earthquakeData.length || 0;
    phQuakes.textContent = phEarthquakeData.length || 0;
    
    // Strongest earthquake
    let strongestQuake = 0;
    let strongestPlace = "";
    
    // Tsunami counts and data
    const tsunamiData = earthquakeData.filter(quake => Number(quake.tsunami) === 1);
    const tsunamiCount = tsunamiData.length;
    
    earthquakeData.filter(quake => {
        return quake.magnitude >= 1.0
    }).forEach(quake => {
        if (quake.magnitude > strongestQuake) {
            strongestQuake = quake.magnitude
            strongestPlace = quake.location
        }
    });
    
    strongest.textContent = `M ${strongestQuake} - ${strongestPlace}`;
    tsunamiAlerts.textContent = tsunamiCount > 0 ? `${tsunamiCount} Tsunami Alerts.`: "No Tsunami Alerts.";
    
    loadingQuakeData.remove();
    
    recentEarthquakes.innerHTML = "";
    
    earthquakeData.slice(0, 50).forEach(quake => {
        let lat = quake.latitude;
        let lng = quake.longitude;
        const magnitude = quake.magnitude;
        
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
        } else if (magnitude >= 9.0) {
            color = "darkviolet";
        } else {
            color = "gray";
        }

        recentEarthquakes.innerHTML += `
            <tr>
                <td><strong style="color: ${color}">M ${magnitude}</strong></td>
                <td>${quake.location}</td>
                <td>${new Date(quake.time).toLocaleString()}</td>
                <td><button class="tableRow"><i class="fas fa-eye"></i> Show on Map</button></td>
            </tr>
        `;
        
        const tableRow = document.querySelectorAll(".tableRow");
        
        tableRow.forEach((tr, index) => {
            tr.addEventListener("click", function() {
                const selectedQuake = earthquakeData?.[index];
                showMapModal.style.display = "flex";
                document.body.classList.add("modal-open")
                
                if (navbar.classList.contains("active")) {
                    menuBtn.classList.toggle("fa-times");
                }
                
                navbar.classList.remove("active");
                
                let targetRad;
                let targetColor = "";
                const targetMag = selectedQuake.magnitude;
                const targetLat = selectedQuake.latitude;
                const targetLng = selectedQuake.longitude;
                
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
                
                console.log(selectedQuake.url);
                
                setTimeout(() => {
                    showMap.invalidateSize();
                    showMap.setView([targetLat, targetLng], 12);
                    
                    targetMarker = L.circleMarker([targetLat, targetLng], {
                        radius: targetRad, fillColor: targetColor, color: "#fff", weight: 1, opacity: 1, fillOpacity: 0.8
                    })
                    .addTo(showMap)
                    .bindPopup(`
                        <h3>Earthquake Information</h3>
                        <b>${selectedQuake.location}</b><br>
                        Magnitude: <b>${selectedQuake.magnitude}</b><br>
                        Date: <b>${new Date(selectedQuake.time).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</b><br>
                        Time: <b>${new Date(selectedQuake.time).toLocaleTimeString()}</b><br>
                        <button class="details-btn" onclick="window.open('${selectedQuake.url}', '_blank');">More details</button>
                    `)
                    .openPopup();
                }, 10);
            });
        });
    });
        
    openTsunamiModal.addEventListener("click", function() {
        let tsunamiFound = false;
        showTsunamiModal.style.display = "flex";
        document.body.classList.add("modal-open");
        recentTsunami.innerHTML = "";
        
        tsunamiData.forEach(quake => {
            const magnitude = quake.magnitude;
            const date = new Date(quake.time);
            
            let color = "";
            
            if (magnitude < 3.0) {
                color = "green";
            } else if (magnitude <= 4.9) {
                color = "yellow";
            } else if (magnitude <= 6.9) {
                color = "orange";
            } else if (magnitude <= 7.9) {
                color = "red";
            } else if (magnitude <= 8.9) {
                color = "purple";
            } else if (magnitude >= 9.0) {
                color = "darkviolet";
            } else {
                color = "gray";
            }
            
            if (quake.tsunami === 1) {
                tsunamiFound = true;
                
                recentTsunami.innerHTML += `
                    <tr>
                        <td><strong style="color: ${color};">M ${magnitude}</strong></td>
                        <td>${quake.location }</td>
                        <td>${date.toLocaleString()}</td>
                    </tr>
                `;
            }
        });
        
        if (!tsunamiFound) {
            recentTsunami.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align:center;">No Tsunami Detected.</td>
                </tr>
            `;
        }
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
    
    // Initialize the last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        const key = d.toISOString().split("T")[0];
        last7Days[key] = 0;
    }
    
    // Count earthquakes per day
    earthquakeData.forEach(quake => {
        const key = new Date(quake.time).toISOString().split("T")[0];

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
    const quakeChart = document.getElementById("quakeChart");
    
    if (Chart.getChart(quakeChart)) {
        Chart.getChart(quakeChart).destroy();
    }
    
    new Chart(quakeChart, {
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