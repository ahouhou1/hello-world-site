// api/weather.js
export default async function handler(req, res) {
  try {
    const { lat, lon, units = "metric", lang = "en" } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "Missing lat/lon" });
    }

    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "Server missing OPENWEATHER_API_KEY" });
    }

    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("lat", lat);
    url.searchParams.set("lon", lon);
    url.searchParams.set("appid", key);
    url.searchParams.set("units", units);
    url.searchParams.set("lang", lang);

    const r = await fetch(url.toString());
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "OpenWeather error", details: text });
    }

    const data = await r.json();
    // Minimal clean payload for the client
    const out = {
      name: data.name,
      country: data.sys?.country,
      temp: Math.round(data.main?.temp),
      feels: Math.round(data.main?.feels_like),
      desc: data.weather?.[0]?.description,
      icon: data.weather?.[0]?.icon, // e.g. "10d"
      wind: data.wind?.speed,
      humidity: data.main?.humidity
    };
    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
    return res.status(200).json(out);
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e) });
  }
}
