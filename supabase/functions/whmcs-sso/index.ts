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
    const body = await req.json();
    const { email, userid, destination } = body;
    console.log("SSO Request received:", JSON.stringify({ email, userid, destination }));

    if (!email && !userid) {
      return new Response(
        JSON.stringify({ error: "Email or user ID required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the PHP bridge which has the correct IP allowlisted
    const bridgeUrl = "https://vintechdev.store/api/whmcs.php";

    // If we only have email, first get the user ID via the bridge
    let clientId = userid;
    
    if (!clientId && email) {
      const getClientsResponse = await fetch(bridgeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "GetClients",
          search: email,
          responsetype: "json",
        }),
      });

      const clientsData = await getClientsResponse.json();
      console.log("GetClients response:", JSON.stringify(clientsData));
      
      if (clientsData.result === "success" && clientsData.clients?.client?.length > 0) {
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

    // Create SSO token via the bridge
    // Note: destination can be empty to default to clientarea, or a specific sso_destination like "clientarea:services"
    const ssoBody: Record<string, string> = {
      action: "CreateSsoToken",
      client_id: clientId.toString(),
      responsetype: "json",
    };
    
    // Only add destination if it's a valid WHMCS SSO destination
    // Valid destinations: empty (defaults to clientarea), or specific pages
    if (destination && destination !== "clientarea:home") {
      ssoBody.destination = destination;
    }
    
    const ssoResponse = await fetch(bridgeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ssoBody),
    });

    const ssoData = await ssoResponse.json();
    console.log("CreateSsoToken response:", JSON.stringify(ssoData));

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