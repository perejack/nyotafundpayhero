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

  const body = await req.json().catch(() => ({}));
  const checkoutId = body?.checkoutId ?? body?.checkout_request_id ?? body?.reference;

  if (!checkoutId) {
    return jsonResponse({ message: "Missing checkoutId or reference" }, 400);
  }

  return jsonResponse({
    status: "pending",
    message: "PayHero uses callback URL for status updates. Poll with reference if needed.",
    reference: checkoutId,
    trackingNumber: deriveTrackingNumber(String(checkoutId)),
    raw: { note: "Status check via callback or external_reference lookup" },
  });
});
