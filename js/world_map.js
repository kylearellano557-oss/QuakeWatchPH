const currentdate = new Date();
const filterDate = Number(localStorage.getItem("quakeFilter") || 7);
currentdate.setDate(currentdate.getDate() - filterDate);

const starttime = currentdate.toISOString().split("T")[0];
const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${starttime}&orderby=time`;
const map = L.map('map', { zoomControl: false, minZoom: 2, maxBounds: [[-85.0511, -200], [85.0511, 200]], maxBoundsViscosity: 0.8 });
const plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
const faultlines_url = "https://raw.githubusercontent.com/GEMScienceTools/gem-global-active-faults/master/geojson/gem_active_faults.geojson";
const searchQuake = document.getElementById("searchquake");
const searchResults = document.getElementById("searchResults");
const savedLat = localStorage.getItem("savedLat");
const savedLng = localStorage.getItem("savedLng");
const savedZoom = localStorage.getItem("savedZoom");
localStorage.removeItem("savedLatPH");
localStorage.removeItem("savedLngPH");
localStorage.removeItem("savedZoomPH");

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.control.zoom({position: 'bottomright'}).addTo(map); // Zoom buttons on map.
L.control.locate({position: "bottomright",flyTo: true,setView: "once",keepCurrentZoomLevel: false,showCompass: true,strings: {title: "Show my location"}}).addTo(map); // Your Location on map

fetch(url).then(response => {
    return response.json();
}).then(data => {

    data.features.forEach(quake => {
        
        let color;
        let lat = quake.geometry.coordinates[1];
        let lng = quake.geometry.coordinates[0];
        const place = quake.properties.place ?? quake.properties.flynn_region ?? quake.properties.region ?? "Unknown Location";
        const magnitude = quake.properties.mag;
        const date = new Date(quake.properties.time);
        
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
        } else if (magnitude >= 3.0 && magnitude <= 4.9  && localStorage.getItem("lightLevel") !== "false") {
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
            <b>${place}</b><br>
            Magnitude: <b>${quake.properties.mag}</b><br>
            Date: <b>${date.toLocaleDateString()}</b><br>
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
    
    map.on("moveend", function() {
        const center = map.getCenter();
        
        localStorage.setItem("savedLat", center.lat);
        localStorage.setItem("savedLng", center.lng);
        localStorage.setItem("savedZoom", map.getZoom());
    });
    
    if (savedLat && savedLng && savedZoom) {
        map.setView([parseFloat(savedLat), parseFloat(savedLng)], parseFloat (savedZoom));
    } else {
        map.setView([0, 0], 2); // World Map
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
    console.error("Fetch Error:", error);
});

searchQuake.addEventListener("input", function() {
    
    if (this.value.length === 0 || localStorage.getItem("showMarkers") === "false") {
        searchResults.innerHTML = "";
        return;
    } else {
        searchResults.innerHTML = `
            <div class="item-results">
                Searching...
            </div>
        `;
    }
    
    fetch(url).then(response => {
        return response.json();
    }).then(data => {
        const keyword = this.value.toLowerCase();
        const results = data.features.filter(quake => {
            if (quake.properties.mag < 3 || localStorage.getItem("minorLevel") === "false") {
                return false;
            } else if (quake.properties.mag >= 3 && quake.properties.mag <= 4.9 && localStorage.getItem("lightLevel") === "false") {
                return false;
            } else if (quake.properties.mag >= 5 && quake.properties.mag <= 6.9 && localStorage.getItem("moderateLevel") === "false") {
                return false;
            } else if (quake.properties.mag > 7 && localStorage.getItem("strongLevel") === "false") {
                return false;
            }
            
            return quake.properties.place.toLowerCase().includes(keyword);
        });
        
        searchResults.innerHTML = "";
        
        if (keyword === "") {
            searchResults.innerHTML = "";
            searchResults.style.display = "none";
            return;
        }
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="no-item-results">
                    No Results of "${keyword}"
                </div>
            `;
            
            searchResults.style.display = "block";
            return;
        }
        
        if (localStorage.getItem("showMarkers") === "false") {
            searchResults.innerHTML = "";
            searchResults.style.display = "none";
            return;
        }
        
        results.forEach(quake => {
            searchResults.innerHTML += `
                <div class="item-results">
                    ${quake.properties.place}
                </div>
            `;
        });
        
        searchResults.style.display = results.length > 0 ? "block" : "none";
        const itemResult = document.querySelectorAll(".item-results");
        
        itemResult.forEach((item, index) => {
            item.addEventListener("click", function () {
                const date = new Date(results[index].properties.time);
                const lng = results[index].geometry.coordinates[0];
                const lat = results[index].geometry.coordinates[1];
                
                map.flyTo([lat, lng], 8);
                
                L.popup()
                .setLatLng([lat, lng])
                .setContent(`
                    <h3>Earthquake Information</h3>
                    <b>${results[index].properties.place}</b><br>
                    Magnitude: <b>${results[index].properties.mag}</b><br>
                    Date: <b>${date.toLocaleDateString()}</b><br>
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