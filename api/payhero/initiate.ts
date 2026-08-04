const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Hardcoded for testing — replace with env vars before production
const PAYHERO_BASE_URL = "https://backend.payhero.co.ke";
const PAYHERO_AUTH_TOKEN =
  "Basic ZmxnMTBsSFF2YmRFb2RlVDdqdlo6eFpsUnNhOFhWbnNvZzhCYWpFb3RkV2ZGaFhkZGZ5NDREamtzWUxpcQ==";
const PAYHERO_CHANNEL_ID = 11262;
const PAYHERO_ACCOUNT_ID = 11265;

function parseBody(req: { body?: unknown }) {
  const raw = req.body;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

function normalizePhoneNumber(phone: unknown): string | null {
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

function extractReference(data: Record<string, unknown>): string | null {
  const direct =
    data.reference ??
    data.Reference ??
    data.checkoutId ??
    data.checkoutRequestId ??
    data.CheckoutRequestID;

  if (typeof direct === "string" && direct.trim()) return direct;

  const nested = data.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const nestedObj = nested as Record<string, unknown>;
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

export default async function handler(req: any, res: any) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
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
      res.status(400).json({ success: false, message: "Invalid phone number format" });
      return;
    }

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ success: false, message: "Invalid amount" });
      return;
    }

    const referencePrefix =
      typeof body.referencePrefix === "string" ? body.referencePrefix : "NYOTA";
    const externalReference =
      typeof body.reference === "string"
        ? body.reference
        : `${referencePrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload: Record<string, unknown> = {
      amount,
      phone_number: normalizedPhone,
      channel_id: channelId,
      provider: "m-pesa",
      external_reference: externalReference,
      description: typeof body.description === "string" ? body.description : "Application processing fee",
    };

    if (typeof body.customer_name === "string") {
      payload.customer_name = body.customer_name;
    }

    const payheroRes = await fetch(`${PAYHERO_BASE_URL}/api/v2/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = (await payheroRes.json().catch(() => null)) as Record<string, unknown> | null;

    if (!payheroRes.ok || !data) {
      res.status(payheroRes.status || 500).json({
        success: false,
        message:
          (typeof data?.message === "string" ? data.message : null) ??
          (typeof data?.error === "string" ? data.error : null) ??
          "Payment initiation failed",
        raw: data,
      });
      return;
    }

    const checkoutId = extractReference(data);
    const success =
      data.success === true ||
      String(data.status ?? "").toLowerCase() === "success" ||
      Boolean(checkoutId);

    if (!success || !checkoutId) {
      res.status(400).json({
        success: false,
        message: (typeof data.message === "string" ? data.message : null) ?? "Payment initiation failed",
        raw: data,
      });
      return;
    }

    res.status(200).json({
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
    res.status(500).json({ success: false, message });
  }
}
