import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userid, destination } = await req.json();

    if (!email && !userid) {
      return new Response(
        JSON.stringify({ error: "Email or user ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get WHMCS API credentials from environment
    const whmcsUrl = Deno.env.get("WHMCS_API_URL");
    const whmcsIdentifier = Deno.env.get("WHMCS_API_IDENTIFIER");
    const whmcsSecret = Deno.env.get("WHMCS_API_SECRET");

    if (!whmcsUrl || !whmcsIdentifier || !whmcsSecret) {
      console.error("WHMCS API credentials not configured");
      return new Response(
        JSON.stringify({ error: "WHMCS API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If we only have email, first get the user ID
    let clientId = userid;
    
    if (!clientId && email) {
      // Get client details by email
      const getClientsParams = new URLSearchParams({
        action: "GetClients",
        identifier: whmcsIdentifier,
        secret: whmcsSecret,
        search: email,
        responsetype: "json",
      });

      const clientsResponse = await fetch(whmcsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: getClientsParams.toString(),
      });

      const clientsData = await clientsResponse.json();
      
      if (clientsData.result === "success" && clientsData.clients?.client?.length > 0) {
        // Find exact email match
        const client = clientsData.clients.client.find(
          (c: { email: string }) => c.email.toLowerCase() === email.toLowerCase()
        );
        if (client) {
          clientId = client.id;
        }
      }

      if (!clientId) {
        return new Response(
          JSON.stringify({ error: "User not found in WHMCS" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create SSO token using WHMCS API
    const ssoParams = new URLSearchParams({
      action: "CreateSsoToken",
      identifier: whmcsIdentifier,
      secret: whmcsSecret,
      client_id: clientId.toString(),
      destination: destination || "clientarea:home",
      responsetype: "json",
    });

    const ssoResponse = await fetch(whmcsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: ssoParams.toString(),
    });

    const ssoData = await ssoResponse.json();

    if (ssoData.result === "success" && ssoData.redirect_url) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          redirect_url: ssoData.redirect_url 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error("WHMCS SSO error:", ssoData);
      return new Response(
        JSON.stringify({ 
          error: ssoData.message || "Failed to create SSO token" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("SSO Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});