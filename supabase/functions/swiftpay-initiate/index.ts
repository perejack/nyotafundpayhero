import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

  const swiftpayApiKey = Deno.env.get("SWIFTPAY_API_KEY");
  const swiftpayTillId = Deno.env.get("SWIFTPAY_TILL_ID");
  const swiftpayBackendUrl = Deno.env.get("SWIFTPAY_BACKEND_URL") ?? "https://swiftpay-backend-uvv9.onrender.com";

  if (!swiftpayApiKey || !swiftpayTillId) {
    return jsonResponse(
      { message: "SwiftPay not configured. Missing SWIFTPAY_API_KEY or SWIFTPAY_TILL_ID." },
      500,
    );
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
    phone_number: normalizedPhone,
    amount,
    till_id: swiftpayTillId,
    reference: body?.reference ?? `ORDER-${Date.now()}`,
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

  if (!swiftpayRes.ok) {
    return jsonResponse(
      {
        message: data?.message ?? data?.error ?? "Payment initiation failed",
        raw: data,
      },
      swiftpayRes.status,
    );
  }

  const checkoutId =
    data?.data?.checkout_id ??
    data?.data?.checkoutId ??
    data?.checkoutRequestId ??
    data?.checkout_id ??
    data?.checkoutId ??
    null;

  return jsonResponse({
    success: true,
    checkoutId,
    raw: data,
  });
});
