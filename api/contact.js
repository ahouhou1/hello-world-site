export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { name, email, subject, message } = body || {};

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Vérifie que tout est configuré
    const API_KEY = process.env.RESEND_API_KEY;
    const TO = process.env.CONTACT_TO || "ahmadhouhou1@outlook.com";
    const FROM = process.env.CONTACT_FROM || "Website Contact <onboarding@resend.dev>";

    if (!API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return res.status(500).json({ error: "Server email config missing" });
    }

    // Prépare le contenu de l’email
    const html = `
      <div style="font-family: Arial, sans-serif; color:#111">
        <h2>New message from your website</h2>
        <p><b>Name:</b> ${escape(name)}</p>
        <p><b>Email:</b> ${escape(email)}</p>
        <p><b>Subject:</b> ${escape(subject)}</p>
        <p><b>Message:</b><br>${escape(message).replace(/\n/g, "<br>")}</p>
      </div>
    `;

    // Envoie via Resend
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        subject: `[Contact] ${subject}`,
        reply_to: email,
        html
      })
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("Resend error:", text);
      return res.status(500).json({ error: "Email sending failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
