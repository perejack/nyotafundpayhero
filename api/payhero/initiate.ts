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

function parseBody(req: { body?: unknown }): Record<string, unknown> {
  const raw = req.body;

  if (raw && typeof raw === "object" && !Array.isArray(raw) && !Buffer.isBuffer(raw)) {
    return raw as Record<string, unknown>;
  }

  if (Buffer.isBuffer(raw)) {
    try {
      const parsed = JSON.parse(raw.toString("utf8"));
      if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    } catch {
      return {};
    }
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

/** Returns local format 07XXXXXXXX / 011XXXXXXX for PayHero payload */
function normalizePhoneNumber(phone: unknown): string | null {
  if (phone === undefined || phone === null || phone === "") return null;

  const cleaned = String(phone).replace(/\D/g, "");
  if (!cleaned) return null;

  if (cleaned.startsWith("254") && cleaned.length === 12) {
    return `0${cleaned.slice(3)}`;
  }

  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return cleaned;
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
  const candidates = [
    data.reference,
    data.Reference,
    data.checkoutId,
    data.checkoutRequestId,
    data.CheckoutRequestID,
    data.checkout_request_id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  const nested = data.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const nestedObj = nested as Record<string, unknown>;
    for (const key of [
      "reference",
      "Reference",
      "checkoutId",
      "checkoutRequestId",
      "CheckoutRequestID",
    ]) {
      const value = nestedObj[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return null;
}

function isQueuedSuccess(data: Record<string, unknown>, checkoutId: string | null): boolean {
  if (data.success === true) return true;

  const status = String(data.status ?? data.Status ?? "").toUpperCase();
  if (status === "SUCCESS" || status === "QUEUED" || status === "PENDING") return true;

  return Boolean(checkoutId);
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

  try {
    const body = parseBody(req);
    const rawPhone =
      body.phone ??
      body.phoneNumber ??
      body.phone_number ??
      body.msisdn;

    const normalizedPhone = normalizePhoneNumber(rawPhone);
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid phone number. Use 07XXXXXXXX, 011XXXXXXX, or 2547XXXXXXXX.",
        receivedPhone: rawPhone ?? null,
      });
    }

    const amount = Math.round(Number(body.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
        receivedAmount: body.amount ?? null,
      });
    }

    const referencePrefix =
      typeof body.referencePrefix === "string" ? body.referencePrefix : "NYOTA";
    const externalReference =
      typeof body.reference === "string" && body.reference.trim()
        ? body.reference.trim()
        : `${referencePrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload: Record<string, unknown> = {
      amount,
      phone_number: normalizedPhone,
      channel_id: PAYHERO_CHANNEL_ID,
      provider: "m-pesa",
      external_reference: externalReference,
      description:
        typeof body.description === "string"
          ? body.description
          : "Application processing fee",
    };

    if (typeof body.customer_name === "string" && body.customer_name.trim()) {
      payload.customer_name = body.customer_name.trim();
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
      return res.status(payheroRes.status || 500).json({
        success: false,
        message:
          (typeof data?.message === "string" ? data.message : null) ??
          (typeof data?.error === "string" ? data.error : null) ??
          (typeof data?.error_message === "string" ? data.error_message : null) ??
          "Payment initiation failed",
        raw: data,
      });
    }

    const checkoutId = extractReference(data);
    const success = isQueuedSuccess(data, checkoutId);

    if (!success) {
      return res.status(400).json({
        success: false,
        message:
          (typeof data.message === "string" ? data.message : null) ??
          "Payment initiation failed — no reference returned",
        raw: data,
      });
    }

    return res.status(200).json({
      success: true,
      checkoutId: checkoutId ?? externalReference,
      checkoutRequestId: checkoutId ?? externalReference,
      reference: externalReference,
      payheroReference: checkoutId,
      normalizedPhone: `254${normalizedPhone.slice(1)}`,
      message:
        (typeof data.message === "string" ? data.message : null) ??
        "STK push initiated. Check your phone.",
      raw: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment initiation failed";
    return res.status(500).json({ success: false, message });
  }
}
