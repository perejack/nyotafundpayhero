import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PAYHERO_API_URL = "https://backend.payhero.co.ke/api/v2/payments";
const PAYHERO_AUTH_TOKEN = "Basic b2dKQ3Fha1pOakF6RlRpOXpkRUU6M01qOHl2ajhub3JvQjdzcHhUSG9TVFlOVUwzQzFzU1NqOW5rNE9MbA==";
const PAYHERO_CHANNEL_ID = 6497;

app.post('/api/payhero/initiate', async (req, res) => {
  try {
    const { phone, amount, reference } = req.body;
    
    if (!phone || !amount) {
      return res.status(400).json({ message: "Missing phone or amount" });
    }
    
    // Normalize phone
    const cleaned = String(phone).replace(/\D/g, "");
    let normalizedPhone = null;
    
    if (cleaned.startsWith("0")) normalizedPhone = `254${cleaned.slice(1)}`;
    else if (cleaned.startsWith("254")) normalizedPhone = cleaned;
    
    if (!normalizedPhone || normalizedPhone.length !== 12) {
      return res.status(400).json({ message: "Invalid phone number format" });
    }
    
    const payload = {
      amount: Math.round(amount),
      phone_number: normalizedPhone,
      channel_id: PAYHERO_CHANNEL_ID,
      provider: "m-pesa",
      external_reference: reference || `ORDER-${Date.now()}`,
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
      return res.status(payheroRes.status || 500).json({
        success: false,
        message: data?.message || "Payment initiation failed",
        raw: data,
      });
    }

    res.status(200).json({
      success: data?.success === true || String(data?.status || "").toLowerCase() === "queued",
      checkoutId: data?.CheckoutRequestID || data?.reference,
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
});

app.post('/api/payhero/status', async (req, res) => {
  // Manual confirmation - just return success
  const { checkoutId } = req.body;
  
  if (!checkoutId) {
    return res.status(400).json({ message: "Missing checkoutId" });
  }
  
  res.status(200).json({
    status: "pending",
    message: "Manual confirmation required",
    reference: checkoutId,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API server running on http://localhost:${PORT}`));
