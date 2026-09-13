const menuBtn = document.getElementById("menuBtn");
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

function earthquakeDetails(quake) {
    const date = new Date(quake.properties.time);
    const modal = document.querySelector(".modal");
    const closeModal = document.querySelector(".close");
    const closeBtn = document.getElementById("closeBtn");
    const location = document.getElementById("location");
    const magnitude = document.getElementById("magnitude");
    const latitude = document.getElementById("latitude");
    const longitude = document.getElementById("longitude");
    const depth = document.getElementById("depth");
    const datetime = document.getElementById("datetime");
    const tsunami = document.getElementById("tsunami");
    const alertlevel = document.getElementById("alertlevel");
    const status = document.getElementById("status");
    const usgsurl = document.getElementById("usgsurl");
    
    const magnitudeLevel = quake.properties.mag;
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
    
    if (quake.properties.sources) {
        earthquakeSource = "United States Geological Survey";
    } else {
        earthquakeSource = "SEISMIC PORTAL";
    }
    
    location.innerHTML = `Location: <b>${quake.properties.place ?? quake.properties.flynn_region ?? quake.properties.region}</b>`;
    magnitude.innerHTML = `Magnitude: <b style="font-size: 20px; color: ${magnitudeColor}"> ${magnitudeLevel}</b>`;
    longitude.innerHTML = `Longitude: ${quake.geometry.coordinates[0]}`;
    latitude.innerHTML = `Latitude: ${quake.geometry.coordinates[1]}`;
    depth.innerHTML = `Depth: ${quake.geometry.coordinates[2]} km`;
    datetime.innerHTML = `Date and Time: ${date.toLocaleString()}`;
    tsunami.innerHTML = `Tsunami: ${quake.properties.tsunami ? "Yes" : "No"}`;
    alertlevel.innerHTML = `Alert Level: ${quake.properties.alert ?? "No Alerts"}</b>`;
    status.innerHTML = `Status: <b>${quake.properties.status ?? "Status unavailable"}</b>`;
    usgsurl.innerHTML = `Source: <b>${earthquakeSource ?? "Source Unavailable"}</b>`;
    
    modal.style.display = "flex";
    
    closeModal.addEventListener("click", function() {
        modal.style.display = "none";
    });
}

menuBtn.addEventListener("click", function() {
    const navbar = document.querySelector(".navbar");
    navbar.classList.toggle("active");
    menuBtn.classList.toggle("fa-times");
    
    if (navbar.classList.contains("active")) {
        if (searchbar) searchbar.style.display = "none";
    
    } else {
        if (searchbar) searchbar.style.display = "block";
    }
});

function openSettings() {
    settingModal.style.display = "flex";
    document.body.classList.add("modal-open");
    navbar.classList.remove("active");
    menuBtn.classList.toggle("fa-times");
    
    if (searchbar) searchbar.style.display = "block";
    
    document.querySelector("#showMarkers").checked = localStorage.getItem("showMarkers") !== "false";
    document.querySelector("#showPlates").checked = localStorage.getItem("showPlates") === "true";
    document.querySelector("#showFaults").checked = localStorage.getItem("showFaults") === "true";
    document.querySelector("#theme").value = localStorage.getItem("theme") || "light";
    document.querySelector("#quakeFilter").value = localStorage.getItem("quakeFilter") || "7";
    
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
        
        Swal.fire("Success", "Setting saved successfully!", "success").then(() => { location.reload(); });
    };
}

function darkTheme() {
    document.querySelector(".headers").style.background = "#111";
    document.querySelector(".modal-body").style.background = "#111";
    document.querySelector(".modal-content").style.color = "#fff";
    document.querySelector(".navbar").style.background = "#111";
    document.querySelectorAll(".nav-links li a").forEach(link => { link.style.color = "#fff"; });
}

function lightTheme() {
    document.querySelector(".headers").style.background = "#fff";
    document.querySelector(".modal-content").style.background = "#fff";
    document.querySelector(".modal-content").style.color = "#111";
    document.querySelector(".navbar").style.background = "#fff";
    document.querySelectorAll(".nav-links li a").forEach(link => { link.style.color = "#111"; });
}

if (selectedtheme === "dark") {
    darkTheme();
} else {
    lightTheme();
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