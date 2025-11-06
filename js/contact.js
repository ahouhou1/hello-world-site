const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
const btn = document.getElementById("sendBtn");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.textContent = "";
  btn.disabled = true;

  const fd = new FormData(form);
  const payload = {
    name: fd.get("name").trim(),
    email: fd.get("email").trim(),
    subject: fd.get("subject").trim(),
    message: fd.get("message").trim(),
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Send failed");

    statusEl.style.color = "var(--ok)";
    statusEl.textContent = "✅ Message sent successfully!";
    form.reset();
  } catch (err) {
    console.error(err);
    statusEl.style.color = "var(--danger)";
    statusEl.textContent = "❌ Could not send the message. Please try again later.";
  } finally {
    btn.disabled = false;
  }
});
