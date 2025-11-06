(async function initWeather() {
  const status = document.getElementById("weather-status");
  const card = document.getElementById("weather-card");
  const iconEl = document.getElementById("weather-icon");
  const placeEl = document.getElementById("weather-place");
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");
  const feelsEl = document.getElementById("weather-feels");
  const windEl = document.getElementById("weather-wind");
  const humEl = document.getElementById("weather-humidity");

  if (!status) return; // page without weather

  // Geolocation works on HTTPS or localhost
  if (!("geolocation" in navigator)) {
    status.textContent = "Geolocation not supported in this browser.";
    return;
  }

  status.textContent = "Requesting permission…";

  const getPosition = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000
      })
    );

  try {
    const pos = await getPosition();
    const { latitude: lat, longitude: lon } = pos.coords;

    status.textContent = "Fetching weather…";

    const lang = navigator.language?.slice(0, 2) || "en";
    const r = await fetch(`/api/weather?lat=${lat}&lon=${lon}&units=metric&lang=${lang}`);
    if (!r.ok) {
      const t = await r.text();
      throw new Error(t || `HTTP ${r.status}`);
    }
    const w = await r.json();

    // Render
    const iconUrl = w.icon ? `https://openweathermap.org/img/wn/${w.icon}@2x.png` : "";
    if (iconUrl) iconEl.src = iconUrl;
    iconEl.alt = w.desc || "weather icon";

    placeEl.textContent = [w.name, w.country].filter(Boolean).join(", ");
    tempEl.textContent = `${w.temp ?? "–"}°C`;
    descEl.textContent = w.desc ? w.desc[0].toUpperCase() + w.desc.slice(1) : "";
    feelsEl.textContent = `Feels: ${w.feels ?? "–"}°C`;
    windEl.textContent = `Wind: ${w.wind ?? "–"} m/s`;
    humEl.textContent = `Humidity: ${w.humidity ?? "–"}%`;

    status.classList.add("hidden");
    card.classList.remove("hidden");
  } catch (err) {
    // Permission denied or timeout → explain and offer manual refresh
    status.innerHTML = `Couldn’t get your location or weather. 
      <button id="weather-retry">Try again</button>`;
    const btn = document.getElementById("weather-retry");
    if (btn) btn.onclick = () => location.reload();
    console.error(err);
  }
})();
