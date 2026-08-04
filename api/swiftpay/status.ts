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
  const swiftpayBackendUrl = process.env.SWIFTPAY_BACKEND_URL ?? "https://swiftpay-backend-uvv9.onrender.com";

  if (!swiftpayApiKey) {
    res.status(500).json({ message: "SwiftPay env not configured" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const checkoutId = body?.checkoutId ?? body?.checkout_id;

  if (!checkoutId) {
    res.status(400).json({ message: "Missing checkoutId" });
    return;
  }

  const swiftpayRes = await fetch(`${swiftpayBackendUrl}/api/mpesa-verification-proxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checkoutId, apiKey: swiftpayApiKey }),
  });

  const data = await swiftpayRes.json().catch(() => null);

  if (!swiftpayRes.ok || !data) {
    res.status(swiftpayRes.status || 500).json({
      status: "error",
      message: data?.message ?? data?.error ?? "Status check failed",
      raw: data,
    });
    return;
  }

  const statusText = String(data?.status ?? data?.data?.status ?? data?.data?.state ?? "").toLowerCase();
  const paid = data?.success === true || statusText === "success" || statusText === "paid" || statusText === "completed";
  const failed = statusText === "failed" || statusText === "cancelled" || statusText === "canceled";

  res.status(200).json({
    status: paid ? "paid" : failed ? "failed" : "pending",
    message: data?.message,
    raw: data,
  });
}
