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
    const checkoutId = body?.checkoutId ?? body?.checkout_request_id ?? body?.reference;

    if (!checkoutId) {
      res.status(400).json({ message: "Missing checkoutId or reference" });
      return;
    }

    res.status(200).json({
      status: "pending",
      message: "Manual confirmation required",
      reference: checkoutId,
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      status: "error",
      message: error.message || "Server error",
    });
  }
}
