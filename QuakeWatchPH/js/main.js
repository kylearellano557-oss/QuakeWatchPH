const menuBtn = document.getElementById("menuBtn");
const notificationModal = document.getElementById("notificationModal");
const settingModal = document.querySelector("#settingModal");
const selectedtheme = localStorage.getItem("theme");
const navbar = document.querySelector(".navbar");
const dateTime = document.getElementById("dateTime");
const saveSettings = document.getElementById("saveSettings");
const filterModal = document.getElementById("filterModal");
const showMapModal = document.getElementById("showMapModal");
const showTsunamiModal = document.getElementById("showTsunamiModal");
const saveFilters = document.getElementById("saveFilters");
const aboutModal = document.getElementById("aboutModal");
const showMessage = document.getElementById("showMessage");
const searchbar = document.querySelector(".searchbar");
const mainLogo = document.querySelector(".logo");
const mapsection = document.querySelector(".mapsection");
const dropdownarrow = document.querySelector(".fa-chevron-down");
const indexpage = window.location.pathname.split("/").pop();

function earthquakeDetails(quake) {
    const date = new Date(quake.properties?.time ?? quake.timestamp_iso);
    const modal = document.querySelector(".modal");
    const closeModal = document.querySelector(".close");
    const closeBtn = document.getElementById("closeBtn");
    const location = document.getElementById("location");
    const magnitude = document.getElementById("magnitude");
    const latitude = document.getElementById("latitude");
    const longitude = document.getElementById("longitude");
    const depth = document.getElementById("depth");
    const earthquakedate = document.getElementById("earthquakedate");
    const earthquaketime = document.getElementById("earthquaketime");
    const tsunami = document.getElementById("tsunami");
    const alertlevel = document.getElementById("alertlevel");
    const status = document.getElementById("status");
    const source = document.getElementById("source");
    const url = document.getElementById("url");
    
    const magnitudeLevel = quake.properties?.mag ?? quake.magnitude;
    let magnitudeColor = "";
    let earthquakeSource;
    
    if (magnitudeLevel < 3.0) {
        magnitudeColor = "green";
    } else if (magnitudeLevel >= 3.0 && magnitudeLevel <= 4.9) {
        magnitudeColor = "yellow";
    } else if (magnitudeLevel >= 5.0 && magnitudeLevel <= 6.9) {
        magnitudeColor = "orange";
    } else if (magnitudeLevel >= 7.0 && magnitudeLevel <= 7.9) {
        magnitudeColor = "red";
    } else if (magnitudeLevel >= 8.0 && magnitudeLevel <= 8.9) {
        magnitudeColor = "darkred";
    } else if (magnitudeLevel >= 9.0) {
        magnitudeColor = "darkviolet";
    }
    
    if (quake.properties?.sources) {
        earthquakeSource = "USGS";
    } else {
        earthquakeSource = "PHIVOLCS";
    }
    
    location.innerHTML = `Location: <b>${quake.properties?.place ?? quake.location}</b>`;
    magnitude.innerHTML = `Magnitude: <b style="font-size: 20px; color: ${magnitudeColor}"> ${magnitudeLevel}</b>`;
    longitude.innerHTML = `Longitude: ${quake.geometry?.coordinates[0] ?? quake.longitude}`;
    latitude.innerHTML = `Latitude: ${quake.geometry?.coordinates[1] ?? quake.latitude}`;
    depth.innerHTML = `Depth: ${quake.geometry?.coordinates[2] ?? quake.depth_km} km`;
    earthquakedate.innerHTML = `Date: ${date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`;
    earthquaketime.innerHTML = `Time: ${date.toLocaleTimeString()}`
    tsunami.innerHTML = `Tsunami: ${quake.properties?.tsunami ? "Yes" : "No"}`;
    alertlevel.innerHTML = `Alert Level: ${quake.properties?.alert ?? "No Alerts"}</b>`;
    status.innerHTML = `Status: <b>${quake.properties?.status ?? "Status unavailable"}</b>`;
    source.innerHTML = `Source: <b>${earthquakeSource ?? "Source Unavailable"} </b>`;
    url.innerHTML = `Earthquake URL: <b><a href="${quake.properties?.url.replace(/\\/g, "/") ?? quake.bulletin_url.replace(/\\/g, "/")}" target="_blank">${quake.properties?.url ?? quake.bulletin_url}</a></b>`;
    
    modal.style.display = "flex";
    
    closeModal.addEventListener("click", function() {
        modal.style.display = "none";
    });
}

menuBtn.addEventListener("click", function() {
    const navbar = document.querySelector(".navbar");
    navbar.classList.toggle("active");
    menuBtn.classList.toggle("fa-times");
    
    if (window.innerWidth >= 768) {
        if (navbar.classList.contains("active")) {
            if (searchbar) searchbar.style.display = "none";
        } else {
            if (searchbar) searchbar.style.display = "block";
        }
        
        if (indexpage != "index.html") return;
        
        mapsection.style.display = "flex";
    } else {
        if (navbar.classList.contains("active")) {
            if (searchbar) searchbar.style.display = "none";
            if (indexpage != "index.html") return;
            
            dropdownarrow.style.display = "none";
            mapsection.style.display = "none";
        } else {
            if (searchbar) searchbar.style.display = "block";
            if (indexpage != "index.html") return;
            
            dropdownarrow.style.display = "block";
            mapsection.style.display = "";
            dropdownarrow.classList.remove("arrowrotate");
            mapsection.classList.remove("opendropdown");
        }
    }
});

mainLogo.addEventListener("click", function() {
    if (indexpage === "index.html") {
        window.location.href = "#";
    } else {
        window.location.href = "index.html";
    }
});

function openSettings() {
    settingModal.style.display = "flex";
    document.body.classList.add("modal-open");
    navbar.classList.remove("active");
    menuBtn.classList.toggle("fa-times");
    
    if (searchbar) searchbar.style.display = "block";
    
    if (indexpage === "index.html") {
        dropdownarrow.style.display = "flex";
        mapsection.style.display = "";
    }
    
    document.querySelector("#showMarkers").checked = localStorage.getItem("showMarkers") !== "false";
    document.querySelector("#showPlates").checked = localStorage.getItem("showPlates") === "true";
    document.querySelector("#showFaults").checked = localStorage.getItem("showFaults") === "true";
    document.querySelector("#theme").value = localStorage.getItem("theme") || "light";
    document.querySelector("#quakeFilter").value = localStorage.getItem("quakeFilter") || "7";
    
    document.querySelector("#quakeFilter").addEventListener("change", function() {
        const messageSetting = document.getElementById("messageSetting");
        if (this.value === "30") {
            messageSetting.style.display = "block";
            messageSetting.textContent = "Note: Selecting this option will take longer to load.";
        } else {
            messageSetting.style.display = "none";
            messageSetting.textContent = "";
        }
    })
    
    saveSettings.onclick = function() {
        const showMarkers = document.getElementById("showMarkers").checked;
        const showPlates = document.getElementById("showPlates").checked;
        const showFaults = document.getElementById("showFaults").checked;
        const theme = document.getElementById('theme').value;
        const quakeFilter = document.getElementById("quakeFilter").value;

        localStorage.setItem("showMarkers", showMarkers);
        localStorage.setItem("showPlates", showPlates);
        localStorage.setItem("showFaults", showFaults);
        localStorage.setItem("theme", theme);
        localStorage.setItem("quakeFilter", quakeFilter);
        
        settingModal.remove();
        
        Swal.fire("Success", "Setting saved successfully!", "success").then(() => { location.reload(); });
    };
}

function darkTheme() {
    document.querySelectorAll(".headers, .navbar, #dashboard, .modal-body").forEach(element => { element.style.background = "#111"; });
    document.querySelectorAll(".modal-content, #dashboard").forEach(element => { element.style.color = "#fff"; });
    document.querySelectorAll("#quakeChart, .table-container #recentEarthquakes").forEach(element => { element.style.background = "#222"; element.style.color = "#fff"; });
    document.querySelectorAll("#searchquake, #searchResults").forEach(search => { search.style.background = "#111"; search.style.color = "#fff"; });
    document.querySelectorAll(".leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-bar-part, .leaflet-control-layers").forEach(controls => { controls.style.background = "#111"; controls.style.color = "#fff"; });
    document.querySelectorAll(".leaflet-control-locate-location-arrow").forEach(icon => { icon.style.background = "#fff"; });
    document.querySelectorAll(".nav-links li a").forEach(link => { link.style.color = "#fff"; });
    document.querySelectorAll(".card").forEach(card => { card.style.color = "#fff"; card.style.background = "#222"; });
}

if (selectedtheme === "dark") {
    darkTheme();
}

function dropDown() {
    mapsection.classList.toggle("opendropdown");
    dropdownarrow.classList.toggle("arrowrotate");
    
    mapsection.style.backgroundColor = "#fff";
}

function showFilters() {
    document.querySelector("#minorLevel").checked = localStorage.getItem("minorLevel") !== "false";;
    document.querySelector("#lightLevel").checked = localStorage.getItem("lightLevel") !== "false";
    document.querySelector("#moderateLevel").checked = localStorage.getItem("moderateLevel") !== "false";
    document.querySelector("#strongLevel").checked = localStorage.getItem("strongLevel") !== "false";
    document.querySelector("#veryStrongLevel").checked = localStorage.getItem("veryStrongLevel") !== "false";
    document.querySelector("#destructiveLevel").checked = localStorage.getItem("destructiveLevel") !== "false";
    
    filterModal.style.display = "flex";
    document.body.classList.add("modal-open");
    
    if (navbar.classList.contains("active")) {
        menuBtn.classList.toggle("fa-times");
    }
    
    const checkBoxes = document.querySelectorAll(".checkboxes");

    function updateCheckboxes() {
        const checkedBoxes = document.querySelectorAll(".checkboxes:checked");
        const markerStatus = localStorage.getItem("showMarkers");
        const filterMessage = document.getElementById("filterMessage");
        
        if (markerStatus === "false") {
            checkBoxes.forEach(box => box.disabled = true);
            saveFilters.disabled = true;
            saveFilters.style.background = "#333";
            saveFilters.style.opacity = "0.5";
            filterMessage.textContent = "Enable earthquake markers on settings";
            
            return;
        }
        
        checkBoxes.forEach(box => box.disabled = false);
        
        if (checkedBoxes.length === 1) {
            checkedBoxes[0].disabled = true;
            filterMessage.style.display = "block";
            filterMessage.textContent = "At least one filter must remain selected.";
        } else {
            filterMessage.style.display = "none";
        }
    }
    
    checkBoxes.forEach(checkBox => {
        checkBox.addEventListener("change", updateCheckboxes);
    });
    
    updateCheckboxes();
    
    navbar.classList.remove("active");
    
    saveFilters.onclick = function() {
        const minorLevel = document.getElementById("minorLevel").checked;
        const lightLevel = document.getElementById("lightLevel").checked;
        const moderateLevel = document.getElementById("moderateLevel").checked;
        const strongLevel = document.getElementById("strongLevel").checked;
        const veryStrongLevel = document.getElementById("veryStrongLevel").checked;
        const destructiveLevel = document.getElementById("destructiveLevel").checked;
        
        localStorage.setItem("minorLevel", minorLevel);
        localStorage.setItem("lightLevel", lightLevel);
        localStorage.setItem("moderateLevel", moderateLevel);
        localStorage.setItem("strongLevel", strongLevel);
        localStorage.setItem("veryStrongLevel", veryStrongLevel);
        localStorage.setItem("destructiveLevel", destructiveLevel);
        
        filterModal.remove();
        
        Swal.fire("Success", "Filter saved successfully.", "success").then(() => { location.reload(); });
    }
}

function openAbout() {
    aboutModal.style.display = "flex";
    navbar.classList.remove("active");
    menuBtn.classList.toggle("fa-times");
    document.body.classList.add("modal-open");
    const currentPage = window.location.pathname.split("/").pop();
    
    if (currentPage !== "index.html" && searchbar) {
        searchbar.style.display = "block";
    }
}

function closeFilter() {
    filterModal.style.display = "none";
    document.body.classList.remove("modal-open");
}

function closeMap() {
    showMapModal.style.display = "none";
    document.body.classList.remove("modal-open");
    
    if (targetMarker) {
        showMap.removeLayer(targetMarker);
    }
}

function closeTsunamiModal() {
    showTsunamiModal.style.display = "none";
    document.body.classList.remove("modal-open");
    document.getElementById("recentTsunami").innerHTML = "";
}

function closeSetting() {
    settingModal.style.display = "none";
    document.body.classList.remove("modal-open");
}

function closeAbout() {
    aboutModal.style.display = "none";
    document.body.classList.remove("modal-open");
}