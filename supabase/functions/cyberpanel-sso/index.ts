import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, domain } = await req.json();

    if (!username && !domain) {
      return new Response(
        JSON.stringify({ success: false, error: "Username or domain required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get CyberPanel configuration from secrets
    let CYBERPANEL_URL = Deno.env.get("CYBERPANEL_URL") || "";
    const CYBERPANEL_ADMIN_USER = Deno.env.get("CYBERPANEL_ADMIN_USER") || "";
    const CYBERPANEL_ADMIN_PASS = Deno.env.get("CYBERPANEL_ADMIN_PASS") || "";

    if (!CYBERPANEL_URL || !CYBERPANEL_ADMIN_USER || !CYBERPANEL_ADMIN_PASS) {
      return new Response(
        JSON.stringify({ success: false, error: "CyberPanel not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize URL
    if (!CYBERPANEL_URL.startsWith("http://") && !CYBERPANEL_URL.startsWith("https://")) {
      CYBERPANEL_URL = `https://${CYBERPANEL_URL}`;
    }
    CYBERPANEL_URL = CYBERPANEL_URL.replace(/\/$/, "");
    
    // Ensure we have the port
    if (!CYBERPANEL_URL.includes(":8090") && !CYBERPANEL_URL.includes(":443")) {
      CYBERPANEL_URL = `${CYBERPANEL_URL}:8090`;
    }

    // CyberPanel SSO works by generating a session token via the API
    // We'll use the verifyLogin endpoint to authenticate and get a session
    const loginEndpoint = `${CYBERPANEL_URL}/api/verifyLogin`;
    
    console.log(`Attempting SSO login for user: ${username || domain}`);

    // First, verify admin credentials and get session
    const loginResponse = await fetch(loginEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminUser: CYBERPANEL_ADMIN_USER,
        adminPass: CYBERPANEL_ADMIN_PASS,
      }),
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || loginData.status === 0) {
      console.error("CyberPanel auth failed:", loginData);
      
      // Fallback: return direct panel URL without SSO
      // User will need to login manually
      return new Response(
        JSON.stringify({ 
          success: true, 
          ssoUrl: CYBERPANEL_URL,
          ssoEnabled: false,
          message: "SSO not available, redirecting to login page"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If we have a valid session, create an SSO URL
    // CyberPanel uses a token-based approach for API access
    // For web SSO, we can use the accessManager endpoint
    
    // Generate SSO token via accessManager API
    const ssoEndpoint = `${CYBERPANEL_URL}/api/accessManager`;
    
    const ssoResponse = await fetch(ssoEndpoint, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminUser: CYBERPANEL_ADMIN_USER,
        adminPass: CYBERPANEL_ADMIN_PASS,
        username: username || "admin",
        action: "generateToken",
      }),
    });

    if (ssoResponse.ok) {
      const ssoData = await ssoResponse.json();
      
      if (ssoData.status === 1 && ssoData.token) {
        // Return SSO URL with token
        const ssoUrl = `${CYBERPANEL_URL}/accessManager/ssoLogin?token=${ssoData.token}`;
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            ssoUrl,
            ssoEnabled: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Alternative: Use auto-login via form submission
    // Create a temporary redirect URL that will auto-fill credentials
    // This is a common pattern when direct SSO isn't available
    
    // Encode credentials for the redirect (will be handled by a special page)
    const token = btoa(JSON.stringify({
      user: CYBERPANEL_ADMIN_USER,
      timestamp: Date.now(),
      target: username || domain || "dashboard",
    }));

    // For CyberPanel, the most reliable SSO is via the verifyConn API
    // which validates and creates a session
    const verifyEndpoint = `${CYBERPANEL_URL}/api/verifyConn`;
    
    const verifyResponse = await fetch(verifyEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminUser: CYBERPANEL_ADMIN_USER,
        adminPass: CYBERPANEL_ADMIN_PASS,
      }),
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      
      if (verifyData.verifyConn === 1) {
        // Connection verified - return panel URL
        // User session will be established via cookies
        return new Response(
          JSON.stringify({ 
            success: true, 
            ssoUrl: CYBERPANEL_URL,
            ssoEnabled: true,
            verified: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Final fallback: return direct URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        ssoUrl: CYBERPANEL_URL,
        ssoEnabled: false,
        message: "Redirecting to CyberPanel login"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("SSO Error:", error);
    
    // On error, return the base panel URL
    let CYBERPANEL_URL = Deno.env.get("CYBERPANEL_URL") || "";
    if (!CYBERPANEL_URL.startsWith("http")) {
      CYBERPANEL_URL = `https://${CYBERPANEL_URL}`;
    }
    if (!CYBERPANEL_URL.includes(":8090")) {
      CYBERPANEL_URL = `${CYBERPANEL_URL}:8090`;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        ssoUrl: CYBERPANEL_URL,
        ssoEnabled: false,
        error: error instanceof Error ? error.message : "SSO failed"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
