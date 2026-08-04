const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const PAYHERO_BASE_URL = "https://backend.payhero.co.ke";
const PAYHERO_AUTH_TOKEN =
  "Basic ZmxnMTBsSFF2YmRFb2RlVDdqdlo6eFpsUnNhOFhWbnNvZzhCYWpFb3RkV2ZGaFhkZGZ5NDREamtzWUxpcQ==";
const PAYHERO_CHANNEL_ID = 11262;

function parseBody(req) {
  const raw = req.body;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      return {};
    }
  }
  return {};
}

function normalizePhoneNumber(phone) {
  if (!phone) return null;

  const cleaned = String(phone).replace(/\D/g, "");

  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return cleaned;
  }

  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return `0${cleaned.slice(3)}`;
  }

  if ((cleaned.startsWith("7") || cleaned.startsWith("1")) && cleaned.length === 9) {
    return `0${cleaned}`;
  }

  return null;
}

function getAuthHeader() {
  return PAYHERO_AUTH_TOKEN;
}

function extractReference(data) {
  const direct =
    data.reference ??
    data.Reference ??
    data.checkoutId ??
    data.checkoutRequestId ??
    data.CheckoutRequestID;

  if (typeof direct === "string" && direct.trim()) return direct;

  const nested = data.data;
  if (nested && typeof nested === "object") {
    const nestedObj = nested;
    const nestedRef =
      nestedObj.reference ??
      nestedObj.Reference ??
      nestedObj.checkoutId ??
      nestedObj.checkoutRequestId ??
      nestedObj.CheckoutRequestID;
    if (typeof nestedRef === "string" && nestedRef.trim()) return nestedRef;
  }

  return null;
}

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authHeader = getAuthHeader();
  const channelId = PAYHERO_CHANNEL_ID;

  try {
    const body = parseBody(req);
    const rawPhone =
      (typeof body.phone === "string" ? body.phone : undefined) ??
      (typeof body.phoneNumber === "string" ? body.phoneNumber : undefined) ??
      (typeof body.phone_number === "string" ? body.phone_number : undefined);

    const normalizedPhone = normalizePhoneNumber(rawPhone);
    if (!normalizedPhone) {
      return res.status(400).json({ success: false, message: "Invalid phone number format" });
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const referencePrefix =
      typeof body.referencePrefix === "string" ? body.referencePrefix : "NYOTA";
    const externalReference =
      typeof body.reference === "string"
        ? body.reference
        : `${referencePrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      amount,
      phone_number: normalizedPhone,
      channel_id: channelId,
      provider: "m-pesa",
      external_reference: externalReference,
      customer_name: typeof body.customer_name === "string" ? body.customer_name : undefined,
      description: typeof body.description === "string" ? body.description : "Application processing fee",
    };

    const payheroRes = await fetch(`${PAYHERO_BASE_URL}/api/v2/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await payheroRes.json().catch(() => null);

    if (!payheroRes.ok || !data) {
      return res.status(payheroRes.status || 500).json({
        success: false,
        message:
          (typeof data?.message === "string" ? data.message : null) ??
          (typeof data?.error === "string" ? data.error : null) ??
          "Payment initiation failed",
        raw: data,
      });
    }

    const checkoutId = extractReference(data);
    const success =
      data.success === true ||
      String(data.status ?? "").toLowerCase() === "success" ||
      String(data.status ?? "").toLowerCase() === "queued" ||
      Boolean(checkoutId);

    if (!success || !checkoutId) {
      return res.status(400).json({
        success: false,
        message:
          (typeof data.message === "string" ? data.message : null) ??
          "Payment initiation failed",
        raw: data,
      });
    }

    return res.status(200).json({
      success: true,
      checkoutId,
      checkoutRequestId: checkoutId,
      reference: externalReference,
      normalizedPhone: `254${normalizedPhone.slice(1)}`,
      message: typeof data.message === "string" ? data.message : "STK push initiated",
      raw: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment initiation failed";
    return res.status(500).json({ success: false, message });
  }
}
