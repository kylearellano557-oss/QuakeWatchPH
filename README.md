# 🌏 QuakeWatch PH

**QuakeWatch PH** is a web-based earthquake monitoring application focused on providing real-time earthquake information in the Philippines and around the world.

The application displays earthquake events on interactive maps, provides earthquake details, and helps users quickly identify recent and significant seismic activity.

## ✨ Features

* 🌋 **Real-Time Earthquake Data**

  * Displays recent earthquake events using seismic data sources.
  * Shows earthquake magnitude, location, time, and other available information.

* 🇵🇭 **Philippines Earthquake Map**

  * Interactive map focused on earthquake activity within the Philippines.
  * Helps users monitor local seismic events.

* 🌎 **World Earthquake Map**

  * Displays earthquake activity from around the world.
  * Allows users to explore global seismic events.

* 📊 **Earthquake Information**

  * Magnitude
  * Location
  * Date and time
  * Depth
  * Earthquake alert level
  * Tsunami information
  * Intensity information when available

* 🔔 **Earthquake Notifications**

  * Provides notifications for significant earthquake events.

* 🌊 **Tsunami Information**

  * Displays tsunami-related information when available from the earthquake data source.

* 🗺️ **Interactive Maps**

  * Built with Leaflet.
  * Supports map navigation, markers, popups, and earthquake visualization.

* 📈 **Earthquake Statistics**

  * Provides an overview of earthquake activity through statistics and charts.

## 🛠️ Technologies Used

* **HTML5**
* **CSS3**
* **JavaScript**
* **Leaflet.js** – Interactive maps
* **Chart.js** – Charts and statistics
* **SweetAlert2** – Alerts and notifications
* **Firebase** – Hosting and application services
* **Firebase Cloud Messaging (FCM)** – Push notifications
* **USGS Earthquake Hazards Program** – Earthquake data

## 📂 Project Structure

```text
QuakeWatchPH/
│
├── index.html
├── philippine_map.html
├── world_map.html
├── settings.html
├── about.html
├── updates.html
│
├── css/
│   └── ...
│
├── js/
│   └── ...
│
├── assets/
│   └── ...
│
├── firebase-messaging-sw.js
├── manifest.json
├── robots.txt
└── sitemap.xml
```

> The project structure may change as QuakeWatch PH continues to be developed.

## 🔥 Firebase

QuakeWatch PH uses Firebase for selected application services, including hosting and Firebase Cloud Messaging.

The Firebase configuration included in the frontend is intended for the web application. Firebase security should be maintained through appropriate Firebase Security Rules and project configuration.

**Do not commit private Firebase service-account credentials, private keys, passwords, or other server-side secrets to the repository.**

## 📡 Earthquake Data

Earthquake information is obtained from external seismic data sources, including the **United States Geological Survey (USGS)**.

QuakeWatch PH is a visualization and monitoring application and does not generate or independently verify earthquake measurements.

For official earthquake information and warnings, users should refer to the appropriate government and scientific agencies.

## 🌐 Live Website

**QuakeWatch PH:**
https://quakewatchph.web.app/

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/quakewatchph.git
```

### 2. Open the project

Open the project folder in your preferred code editor.

For local development, you can use a local web server such as:

* VS Code Live Server
* XAMPP
* PHP built-in development server
* Any other local HTTP server

### 3. Run the application

Open the application through your local web server and navigate to:

```text
http://localhost/
```

The exact URL depends on your local development environment.

## 🧭 Main Pages

| Page                | Description                                |
| ------------------- | ------------------------------------------ |
| **Dashboard**       | Overview of recent earthquake activity     |
| **Philippines Map** | Earthquake activity within the Philippines |
| **World Map**       | Global earthquake activity                 |
| **Settings**        | Application and notification settings      |
| **About**           | Information about QuakeWatch PH            |
| **Updates**         | Project version history and updates        |

## 📌 Project Status

**Active Development**

QuakeWatch PH is an ongoing personal web development project. Features, data sources, map layers, and the user interface may change over time.

## 🗺️ Future Improvements

Possible future improvements include:

* Additional earthquake data sources
* Improved earthquake location descriptions
* More detailed seismic statistics
* Additional map layers
* Fault line and tectonic plate visualization
* Improved tsunami information
* More notification options
* Performance improvements
* Mobile interface improvements

## ⚠️ Disclaimer

QuakeWatch PH is intended for **informational and educational purposes**.

Earthquake information may be delayed, incomplete, or subject to changes as seismic data is updated.

**Do not use QuakeWatch PH as a replacement for official earthquake, tsunami, or emergency warnings.**

For official information and emergency guidance, always follow announcements from authorized government agencies and disaster-response organizations.

## 👨‍💻 Developer

**Kyle Arellano**

Bachelor of Science in Information Technology

QuakeWatch PH was developed as a personal project to explore web development, interactive mapping, real-time data visualization, and earthquake monitoring.

---

⭐ If you find QuakeWatch PH interesting, consider giving the repository a star!
"# QuakeWatchPH" 
