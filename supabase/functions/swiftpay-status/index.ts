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

function deriveTrackingNumber(checkoutId: string) {
  const suffix = String(checkoutId)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-8)
    .toUpperCase();

  return `NYOTA-TRK-${suffix || crypto.randomUUID().split("-")[0].toUpperCase()}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ message: "Method not allowed" }, 405);
  }

  const swiftpayApiKey = Deno.env.get("SWIFTPAY_API_KEY");
  const swiftpayBackendUrl = Deno.env.get("SWIFTPAY_BACKEND_URL") ?? "https://swiftpay-backend-uvv9.onrender.com";

  if (!swiftpayApiKey) {
    return jsonResponse(
      { message: "SwiftPay not configured. Missing SWIFTPAY_API_KEY." },
      500,
    );
  }

  const body = await req.json().catch(() => ({}));
  const checkoutId = body?.checkoutId ?? body?.checkout_id;

  if (!checkoutId) {
    return jsonResponse({ message: "Missing checkoutId" }, 400);
  }

  const swiftpayRes = await fetch(`${swiftpayBackendUrl}/api/mpesa-verification-proxy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      checkoutId,
      apiKey: swiftpayApiKey,
    }),
  });

  const data = await swiftpayRes.json().catch(() => null);

  if (!swiftpayRes.ok) {
    return jsonResponse(
      {
        status: "error",
        message: data?.message ?? data?.error ?? "Status check failed",
        raw: data,
      },
      swiftpayRes.status,
    );
  }

  const statusText = String(
    data?.status ?? data?.data?.status ?? data?.data?.state ?? data?.result?.status ?? "",
  ).toLowerCase();

  const successText = statusText === "success" || statusText === "paid" || statusText === "completed";
  const successBool = data?.success === true;

  const paid = successBool || successText;

  const failedText = statusText === "failed" || statusText === "cancelled" || statusText === "canceled";
  const failed = data?.success === false && statusText === "failed" ? true : failedText;

  return jsonResponse({
    status: paid ? "paid" : failed ? "failed" : "pending",
    trackingNumber: paid ? deriveTrackingNumber(String(checkoutId)) : null,
    raw: data,
  });
});
