export default async function handler(req: any, res: any) {
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

  const swiftpayApiKey = process.env.SWIFTPAY_API_KEY;
  const swiftpayTillId = process.env.SWIFTPAY_TILL_ID;
  const swiftpayBackendUrl = process.env.SWIFTPAY_BACKEND_URL ?? "https://swiftpay-backend-uvv9.onrender.com";

  if (!swiftpayApiKey || !swiftpayTillId) {
    res.status(500).json({ message: "SwiftPay env not configured" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const rawPhone = String(body?.phone ?? body?.phone_number ?? "");
  const cleaned = rawPhone.replace(/\D/g, "");
  let normalizedPhone: string | null = null;

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
    phone_number: normalizedPhone,
    amount,
    till_id: swiftpayTillId,
    reference: body?.reference,
    description: body?.description ?? "Payment",
  };

  const swiftpayRes = await fetch(`${swiftpayBackendUrl}/api/mpesa/stk-push-api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${swiftpayApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await swiftpayRes.json().catch(() => null);

  if (!swiftpayRes.ok || !data) {
    res.status(swiftpayRes.status || 500).json({
      success: false,
      message: data?.message ?? data?.error ?? "Payment initiation failed",
      raw: data,
    });
    return;
  }

  const checkoutId = data?.data?.checkout_id ?? data?.checkoutRequestId ?? data?.checkout_id ?? null;

  res.status(200).json({
    success: Boolean(data?.success) || String(data?.status ?? "").toLowerCase() === "success",
    checkoutId,
    message: data?.message,
    raw: data,
  });
}
