import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHMCS_API_URL = Deno.env.get("WHMCS_API_URL") || "https://vintechdev.store/includes/api.php";
const WHMCS_API_IDENTIFIER = Deno.env.get("WHMCS_API_IDENTIFIER");
const WHMCS_API_SECRET = Deno.env.get("WHMCS_API_SECRET");

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, ...params } = body;

    if (!action) {
      return new Response(
        JSON.stringify({ result: "error", message: "Action is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build form data for WHMCS API
    const formData = new URLSearchParams();
    formData.append("identifier", WHMCS_API_IDENTIFIER || "");
    formData.append("secret", WHMCS_API_SECRET || "");
    formData.append("action", action);
    formData.append("responsetype", "json");

    // Add additional parameters
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    }

    console.log(`WHMCS API Request: action=${action}`);

    const response = await fetch(WHMCS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();
    console.log(`WHMCS API Response for ${action}:`, JSON.stringify(data).substring(0, 500));

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: unknown) {
    console.error("WHMCS Proxy Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ result: "error", message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
