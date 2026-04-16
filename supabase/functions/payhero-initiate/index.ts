import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAYHERO_API_URL = "https://backend.payhero.co.ke/api/v2/payments";
const PAYHERO_AUTH_TOKEN = "Basic b2dKQ3Fha1pOakF6RlRpOXpkRUU6M01qOHl2ajhub3JvQjdzcHhUSG9TVFlOVUwzQzFzU1NqOW5rNE9MbA==";
const PAYHERO_CHANNEL_ID = 6497;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizePhoneNumber(phone: string | undefined | null): string | null {
  if (!phone) return null;

  const cleaned = String(phone).replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    const normalized = `254${cleaned.slice(1)}`;
    return normalized.length === 12 ? normalized : null;
  }

  if (cleaned.startsWith("254")) {
    return cleaned.length === 12 ? cleaned : null;
  }

  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed" }, 405);
  }

  const body = await req.json().catch(() => ({}));

  const normalizedPhone = normalizePhoneNumber(body?.phone ?? body?.phone_number);
  if (!normalizedPhone) {
    return jsonResponse(
      { message: "Invalid phone number format. Use 07XXXXXXXX or 2547XXXXXXXX." },
      400,
    );
  }

  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return jsonResponse({ message: "Invalid amount" }, 400);
  }

  const payload = {
    amount: Math.round(amount),
    phone_number: normalizedPhone,
    channel_id: PAYHERO_CHANNEL_ID,
    provider: "m-pesa",
    external_reference: body?.reference ?? `ORDER-${Date.now()}`,
    customer_name: body?.customer_name ?? "",
    callback_url: body?.callback_url ?? "",
  };

  const payheroRes = await fetch(PAYHERO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": PAYHERO_AUTH_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  const data = await payheroRes.json().catch(() => null);

  if (!payheroRes.ok) {
    return jsonResponse(
      {
        message: data?.message ?? data?.error ?? "Payment initiation failed",
        raw: data,
      },
      payheroRes.status,
    );
  }

  const checkoutId = data?.CheckoutRequestID ?? data?.reference ?? null;

  return jsonResponse({
    success: data?.success === true || String(data?.status ?? "").toLowerCase() === "queued",
    checkoutId,
    reference: data?.reference,
    raw: data,
  });
});
