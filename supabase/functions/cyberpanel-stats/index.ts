import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CyberPanelResponse {
  status?: number;
  fetchStatus?: string;
  error_message?: string;
  // Server stats
  cpuUsage?: number;
  ramUsage?: number;
  diskUsage?: number;
  // Website stats
  diskUsed?: number;
  bandwidthUsed?: number;
  data?: unknown;
}

async function cyberPanelRequest(
  endpoint: string,
  data: Record<string, unknown>
): Promise<CyberPanelResponse> {
  const CYBERPANEL_URL = Deno.env.get("CYBERPANEL_URL");
  const CYBERPANEL_ADMIN_USER = Deno.env.get("CYBERPANEL_ADMIN_USER");
  const CYBERPANEL_ADMIN_PASS = Deno.env.get("CYBERPANEL_ADMIN_PASS");

  if (!CYBERPANEL_URL || !CYBERPANEL_ADMIN_USER || !CYBERPANEL_ADMIN_PASS) {
    throw new Error("CyberPanel credentials not configured");
  }

  const url = `${CYBERPANEL_URL}${endpoint}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      adminUser: CYBERPANEL_ADMIN_USER,
      adminPass: CYBERPANEL_ADMIN_PASS,
      ...data,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CyberPanel API error: ${response.status} - ${text}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, domain } = await req.json();

    let result: Record<string, unknown> = {};

    switch (action) {
      case "serverStatus": {
        // Get overall server status
        const stats = await cyberPanelRequest("/api/serverStatus", {
          serverStatusType: "1", // 1 = Get all stats
        });
        
        result = {
          cpu: stats.cpuUsage || 0,
          memory: stats.ramUsage || 0,
          disk: stats.diskUsage || 0,
        };
        break;
      }

      case "websiteStats": {
        if (!domain) {
          throw new Error("Domain is required for websiteStats");
        }

        // Get website-specific disk usage
        const diskStats = await cyberPanelRequest("/api/getDiskUsage", {
          websiteName: domain,
        });

        // Get bandwidth usage
        const bwStats = await cyberPanelRequest("/api/getBandwidthUsage", {
          websiteName: domain,
        });

        result = {
          domain,
          diskUsed: diskStats.diskUsed || 0,
          bandwidthUsed: bwStats.bandwidthUsed || 0,
        };
        break;
      }

      case "allWebsitesStats": {
        // Get stats for multiple domains
        const { domains } = await req.json();
        
        if (!domains || !Array.isArray(domains)) {
          throw new Error("Domains array is required");
        }

        const websiteStats = await Promise.all(
          domains.map(async (d: string) => {
            try {
              const diskStats = await cyberPanelRequest("/api/getDiskUsage", {
                websiteName: d,
              });
              const bwStats = await cyberPanelRequest("/api/getBandwidthUsage", {
                websiteName: d,
              });
              
              return {
                domain: d,
                diskUsed: diskStats.diskUsed || 0,
                bandwidthUsed: bwStats.bandwidthUsed || 0,
                error: null,
              };
            } catch (err) {
              return {
                domain: d,
                diskUsed: 0,
                bandwidthUsed: 0,
                error: err instanceof Error ? err.message : "Unknown error",
              };
            }
          })
        );

        // Also get server-wide stats
        const serverStats = await cyberPanelRequest("/api/serverStatus", {
          serverStatusType: "1",
        });

        result = {
          server: {
            cpu: serverStats.cpuUsage || 0,
            memory: serverStats.ramUsage || 0,
            disk: serverStats.diskUsage || 0,
          },
          websites: websiteStats,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CyberPanel stats error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
