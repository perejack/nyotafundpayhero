const PAYHERO_API_URL = "https://backend.payhero.co.ke/api/v2/payments";
const PAYHERO_AUTH_TOKEN = "Basic b2dKQ3Fha1pOakF6RlRpOXpkRUU6M01qOHl2ajhub3JvQjdzcHhUSG9TVFlOVUwzQzFzU1NqOW5rNE9MbA==";
const PAYHERO_CHANNEL_ID = 6497;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const rawPhone = String(body?.phone ?? body?.phone_number ?? "");
    const cleaned = rawPhone.replace(/\D/g, "");
    let normalizedPhone = null;

    if (cleaned.startsWith("0")) normalizedPhone = `254${cleaned.slice(1)}`;
    else if (cleaned.startsWith("254")) normalizedPhone = cleaned;

    if (!normalizedPhone || normalizedPhone.length !== 12) {
      res.status(400).json({ message: "Invalid phone number format" });
      return;
    }

    const amount = Number(body?.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ message: "Invalid amount" });
      return;
    }

    const payload = {
      amount: Math.round(amount),
      phone_number: normalizedPhone,
      channel_id: PAYHERO_CHANNEL_ID,
      provider: "m-pesa",
      external_reference: body?.reference ?? `ORDER-${Date.now()}`,
      customer_name: body?.customer_name ?? "",
    };

    console.log('Sending to PayHero:', payload);

    const payheroRes = await fetch(PAYHERO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": PAYHERO_AUTH_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const data = await payheroRes.json().catch(() => null);
    console.log('PayHero response:', data);

    if (!payheroRes.ok || !data) {
      res.status(payheroRes.status || 500).json({
        success: false,
        message: data?.message ?? data?.error ?? "Payment initiation failed",
        raw: data,
      });
      return;
    }

    const checkoutId = data?.CheckoutRequestID ?? data?.reference ?? null;

    res.status(200).json({
      success: data?.success === true || String(data?.status ?? "").toLowerCase() === "queued",
      checkoutId,
      reference: data?.reference,
      message: data?.status,
      raw: data,
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}
