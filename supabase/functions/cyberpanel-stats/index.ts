import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ServerStats {
  cpu: number;
  ram: number;
  disk: number;
  uptime?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { serverIp } = await req.json();

    if (!serverIp) {
      return new Response(
        JSON.stringify({ success: false, error: "Server IP required" }),
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
    if (!CYBERPANEL_URL.includes(":8090") && !CYBERPANEL_URL.includes(":443")) {
      CYBERPANEL_URL = `${CYBERPANEL_URL}:8090`;
    }

    // CyberPanel API endpoint for server status
    const statusEndpoint = `${CYBERPANEL_URL}/api/getServerStatus`;

    console.log(`Fetching server stats from: ${statusEndpoint}`);

    const response = await fetch(statusEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminUser: CYBERPANEL_ADMIN_USER,
        adminPass: CYBERPANEL_ADMIN_PASS,
      }),
    });

    if (!response.ok) {
      console.error("CyberPanel API error:", response.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Failed to fetch server stats",
          fallback: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    if (data.getServerStatus === 1 || data.status === 1) {
      // Parse CyberPanel response
      const stats: ServerStats = {
        cpu: parseFloat(data.cpuUsage) || 0,
        ram: parseFloat(data.ramUsage) || 0,
        disk: parseFloat(data.diskUsage) || 0,
        uptime: data.uptime || undefined,
      };

      return new Response(
        JSON.stringify({ 
          success: true, 
          stats,
          live: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // API returned but with error status
    console.error("CyberPanel returned error:", data);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: data.error_message || "Unknown error",
        fallback: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Stats Error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch stats",
        fallback: true 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});