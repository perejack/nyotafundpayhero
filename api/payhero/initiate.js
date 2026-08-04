const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const PAYHERO_BASE_URL = "https://backend.payhero.co.ke";
const PAYHERO_AUTH_TOKEN =
  "Basic ZmxnMTBsSFF2YmRFb2RlVDdqdlo6eFpsUnNhOFhWbnNvZzhCYWpFb3RkV2ZGaFhkZGZ5NDREamtzWUxpcQ==";
const PAYHERO_CHANNEL_ID = 11262;

function sendJson(res, statusCode, payload) {
  if (typeof res.status === "function") {
    return res.status(statusCode).json(payload);
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

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

function extractReference(data) {
  const candidates = [
    data?.reference,
    data?.Reference,
    data?.checkoutId,
    data?.checkoutRequestId,
    data?.CheckoutRequestID,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }

  const nested = data?.data;
  if (nested && typeof nested === "object") {
    const nestedRef =
      nested.reference ??
      nested.Reference ??
      nested.checkoutId ??
      nested.checkoutRequestId ??
      nested.CheckoutRequestID;
    if (typeof nestedRef === "string" && nestedRef.trim()) return nestedRef.trim();
  }

  return null;
}

function isPayheroSuccess(data, checkoutId) {
  if (data?.success === true) return true;

  const status = String(data?.status ?? data?.Status ?? "").toUpperCase();
  if (status === "SUCCESS" || status === "QUEUED" || status === "PENDING") return true;

  return Boolean(checkoutId);
}

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));

  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") return res.status(204).end();
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "POST") {
    return sendJson(res, 405, { message: "Method not allowed" });
  }

  try {
    const body = parseBody(req);
    const rawPhone = body.phone ?? body.phoneNumber ?? body.phone_number ?? body.msisdn;

    const normalizedPhone = normalizePhoneNumber(rawPhone);
    if (!normalizedPhone) {
      return sendJson(res, 400, {
        success: false,
        message: "Invalid phone number. Use 07XXXXXXXX, 011XXXXXXX, or 2547XXXXXXXX.",
        receivedPhone: rawPhone ?? null,
      });
    }

    const amount = Math.round(Number(body.amount));
    if (!Number.isFinite(amount) || amount <= 0) {
      return sendJson(res, 400, {
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

    const payload = {
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

    let payheroRes;
    try {
      payheroRes = await fetch(`${PAYHERO_BASE_URL}/api/v2/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: PAYHERO_AUTH_TOKEN,
        },
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      const message = networkErr instanceof Error ? networkErr.message : "Network error";
      return sendJson(res, 502, {
        success: false,
        message: `Could not reach PayHero: ${message}`,
      });
    }

    const responseText = await payheroRes.text().catch(() => "");
    let data = null;
    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { rawText: responseText.slice(0, 500) };
      }
    }

    if (!payheroRes.ok) {
      return sendJson(res, payheroRes.status >= 400 && payheroRes.status < 600 ? payheroRes.status : 502, {
        success: false,
        message:
          (typeof data?.message === "string" ? data.message : null) ??
          (typeof data?.error === "string" ? data.error : null) ??
          `PayHero request failed (${payheroRes.status})`,
        raw: data,
      });
    }

    if (!data) {
      return sendJson(res, 502, {
        success: false,
        message: "PayHero returned an empty response",
      });
    }

    const checkoutId = extractReference(data);
    if (!isPayheroSuccess(data, checkoutId)) {
      return sendJson(res, 400, {
        success: false,
        message:
          (typeof data.message === "string" ? data.message : null) ??
          "Payment initiation failed — unexpected PayHero response",
        raw: data,
      });
    }

    return sendJson(res, 200, {
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
    return sendJson(res, 500, { success: false, message, error: String(err) });
  }
}
