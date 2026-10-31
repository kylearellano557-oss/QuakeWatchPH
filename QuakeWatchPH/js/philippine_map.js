const currentdate = new Date();
const filterDate = Number(localStorage.getItem("quakeFilter") || 7);
const starttime = new Date(currentdate);
starttime.setUTCDate(currentdate.getUTCDate() - (filterDate - 1));
starttime.setUTCHours(0, 0, 0, 0);
const url = "https://data.garbinwx.org/api/earthquakes.json";
const map = L.map('map', { zoomControl: false, minZoom: 5, maxBounds: [[2, 112], [24, 131]], maxBoundsViscosity: 0.8 });
const plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
const faultlines_url = "https://raw.githubusercontent.com/GEMScienceTools/gem-global-active-faults/master/geojson/gem_active_faults.geojson";
const searchQuake = document.getElementById("searchquake");
const searchResults = document.getElementById("searchResults");
const savedLatPH = localStorage.getItem("savedLatPH");
const savedLngPH = localStorage.getItem("savedLngPH");
const savedZoomPH = localStorage.getItem("savedZoomPH");
const savedMap = localStorage.getItem("mapType");
localStorage.removeItem("savedLat");
localStorage.removeItem("savedLng");
localStorage.removeItem("savedZoom");

const defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

const satelliteMap = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "Tiles © Esri",
});

if (savedMap === "satellite") {
    satelliteMap.addTo(map);
} else {
    defaultMap.addTo(map);
}

const baseMaps = { "Street Map": defaultMap, "Satellite Map": satelliteMap};

L.control.layers({ "Street Map": defaultMap,"Satellite Map": satelliteMap }, {}, { position: "bottomleft" }).addTo(map);
L.control.zoom({position: 'bottomright'}).addTo(map); // Zoom buttons on map
L.control.locate({position: "bottomright",flyTo: true,setView: "once",keepCurrentZoomLevel: false,showCompass: true,strings: {title: "Show my location"}}).addTo(map); // Your Location on map

map.on("baselayerchange", function (event) {
    const mapType = event.name === "Satellite Map" ? "satellite" : "default";
    localStorage.setItem("mapType", mapType);
});


fetch(url).then(response => {
    return response.json();
}).then(data => {
    const earthquakeData = data.earthquakes.filter(quake => {
        const quakeTime = new Date(quake.timestamp_iso);
        return (quakeTime >= starttime && quakeTime <= currentdate && quake.magnitude >= 1.0);
    });
    
    earthquakeData.forEach(quake => {
        let color;
        let lat = Number(quake.latitude);
        let lng = Number(quake.longitude);
        const place = quake.location;
        const magnitude = Number(quake.magnitude);
        const date = new Date(quake.timestamp_iso);
        
        if (magnitude < 3.0) {
            color = "green";
        } else if (magnitude >= 3.0 && magnitude <= 4.9) {
            color = "yellow";
        } else if (magnitude >= 5.0 && magnitude <= 6.9) {
            color = "orange";
        } else if (magnitude >= 7.0 && magnitude <= 7.9) {
            color = "red";
        } else if (magnitude >= 8.0 && magnitude <= 8.9) {
            color = "darkred";
        } else if (magnitude >= 9.0) {
            color = "darkviolet";
        }

        const marker = L.circleMarker([lat, lng], {
            radius: magnitude * 2,
            fillColor: color,
            color: "#fff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        if (magnitude < 3.0 && localStorage.getItem("minorLevel") !== "false") {
            if (localStorage.getItem("showMarkers") !== "false") {
                marker.addTo(map);
            }
        } else if (magnitude >= 3.0 && magnitude <= 4.9 && localStorage.getItem("lightLevel") !== "false") {
            if (localStorage.getItem("showMarkers") !== "false") {
                marker.addTo(map);
            }
        } else if (magnitude >= 5.0 && magnitude <= 6.9 && localStorage.getItem("moderateLevel") !== "false") {
            if (localStorage.getItem("showMarkers") !== "false") {
                marker.addTo(map);
            }
        } else if (magnitude >= 7.0 && magnitude <= 7.9 && localStorage.getItem("strongLevel") !== "false") {
            if (localStorage.getItem("showMarkers") !== "false") {
                marker.addTo(map);
            }
        } else if (magnitude >= 8.0 && magnitude <= 8.9 && localStorage.getItem("veryStrongLevel") !== "false") {
            if (localStorage.getItem("showMarkers") !== "false") {
                marker.addTo(map);
            }
        } else if (magnitude >= 9.0 && localStorage.getItem("destructiveLevel") !== "false") {
            if (localStorage.getItem("showMarkers") !== "false") {
                marker.addTo(map);
            }
        }

        marker.bindPopup(`
            <h3>Earthquake Information</h3>
            <b>${place ?? "Unknown Place"}</b><br>
            Magnitude: <b>${quake.magnitude}</b><br>
            Date: <b>${date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</b><br>
            Time: <b>${date.toLocaleTimeString()}</b><br>
            <button class="details-btn">More details</button>
            `);

        marker.on("popupopen", function() {
            const detailsBtn = document.querySelector(".details-btn");

            detailsBtn.addEventListener("click", function (e) {
                e.preventDefault();
                earthquakeDetails(quake);
            });
        });
    });

    map.on("moveend",
        function() {
            const center = map.getCenter();

            localStorage.setItem("savedLatPH", center.lat);
            localStorage.setItem("savedLngPH", center.lng);
            localStorage.setItem("savedZoomPH", map.getZoom());
        })

    if (savedLatPH && savedLngPH && savedZoomPH) {
        map.setView([parseFloat(savedLatPH), parseFloat(savedLngPH)], parseFloat(savedZoomPH));
    } else {
        map.setView([12.8797, 121.7740], 6); // Philippines Map
    }

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
            plateLayer.addTo(map);
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
            faultLayer.addTo(map);
        }

    });

}).catch(error => {
    console.error("Fetch Error:",
        error);
});

searchQuake.addEventListener("input", function() { 
    if (this.value.length === 0 || localStorage.getItem("showMarkers") === "false" || this.value === "") {
        searchResults.innerHTML = "";
        searchResults.style.display = "none";
        return;
    }
    
    searchResults.innerHTML = `<div class="item-results">Searching...</div>`;
    
    fetch(url).then(response => {
        return response.json();
    }).then(data => {
        const earthquakeData = data.earthquakes.filter(quake => {
            const quakeTime = new Date(quake.timestamp_iso);
            return (quakeTime >= starttime && quakeTime <= currentdate && quake.magnitude >= 1.0);
        });
        const magnitude = earthquakeData.magnitude;
        const keyword = this.value.toLowerCase();
        const results = earthquakeData?.filter(quake => {
            if (magnitude < 3 || localStorage.getItem("minorLevel") === "false") {
                return false;
            } else if (magnitude >= 3.0 && magnitude <= 4.9 && localStorage.getItem("lightLevel") === "false") {
                return false;
            } else if (magnitude >= 5.0 && magnitude <= 6.9 && localStorage.getItem("moderateLevel") === "false") {
                return false;
            } else if (magnitude >= 7.0 && magnitude <= 7.9 && localStorage.getItem("strongLevel") === "false") {
                return false;
            } else if (magnitude >= 8.0 && magnitude <= 8.9 && localStorage.getItem("veryStrongLevel") === "false") {
                return false;
            } else if (magnitude >= 9.0 && localStorage.getItem("destructiveLevel") === "false") {
                return false;
            }
            
            return quake.location.toLowerCase().includes(keyword);
        });
        
        searchResults.innerHTML = "";
        searchResults.style.display = "none";
        
        if (keyword === "") {
            searchResults.innerHTML = "";
            searchResults.style.display = "none";
            return;
        } else if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-item-results">
                    No Results of "${keyword}"
                </div>
            `;
            
            searchResults.style.display = "block";
            return;
        } else if (localStorage.getItem("showMarkers") === "false") {
            searchResults.innerHTML = "";
            searchResults.style.display = "none";
            return;
        } else {
            results.forEach(quake => {
                searchResults.innerHTML += `
                    <div class="item-results">
                        ${quake.location}
                    </div>
                `;
            });
        }
        
        searchResults.style.display = results.length >= 0 ? "block" : "none";
        const itemResult = document.querySelectorAll(".item-results");
        
        itemResult.forEach((item, index) => {
            item.addEventListener("click", function () {
                const date = new Date(results[index].timestamp_iso);
                const lng = results[index].longitude;
                const lat = results[index].latitude;
                
                map.flyTo([lat, lng], 8);
                
                L.popup()
                .setLatLng([lat, lng])
                .setContent(`
                    <h3>Earthquake Information</h3>
                    <b>${results[index].location}</b><br>
                    Magnitude: <b>${results[index].magnitude}</b><br>
                    Date: <b>${date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</b><br>
                    Time: <b>${date.toLocaleTimeString()}</b><br>
                    <button class="details-btn">More details</button>
                `)
                .openOn(map);
                
                const detailsBtn = document.querySelector(".details-btn");
                    
                detailsBtn.addEventListener("click", function (e) {
                    e.preventDefault();
                    earthquakeDetails(results[index]);
                });
                
                searchResults.style.display = "none";
            });
        });
    }).catch(error => {
        console.error(error);
    });
});