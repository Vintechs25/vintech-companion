import { supabase } from "@/integrations/supabase/client";

export interface ServerStats {
  cpu: number;
  memory: number;
  disk: number;
}

export interface WebsiteStats {
  domain: string;
  diskUsed: number;
  bandwidthUsed: number;
  error: string | null;
}

export interface CyberPanelStats {
  server: ServerStats;
  websites: WebsiteStats[];
}

export async function fetchCyberPanelStats(domains: string[]): Promise<CyberPanelStats | null> {
  try {
    const { data, error } = await supabase.functions.invoke("cyberpanel-stats", {
      body: {
        action: "allWebsitesStats",
        domains,
      },
    });

    if (error) {
      console.error("CyberPanel stats error:", error);
      return null;
    }

    if (!data?.success) {
      console.error("CyberPanel stats failed:", data?.error);
      return null;
    }

    return data.data as CyberPanelStats;
  } catch (err) {
    console.error("Failed to fetch CyberPanel stats:", err);
    return null;
  }
}

export async function fetchServerStatus(): Promise<ServerStats | null> {
  try {
    const { data, error } = await supabase.functions.invoke("cyberpanel-stats", {
      body: {
        action: "serverStatus",
      },
    });

    if (error) {
      console.error("Server status error:", error);
      return null;
    }

    if (!data?.success) {
      console.error("Server status failed:", data?.error);
      return null;
    }

    return data.data as ServerStats;
  } catch (err) {
    console.error("Failed to fetch server status:", err);
    return null;
  }
}

export async function fetchWebsiteStats(domain: string): Promise<WebsiteStats | null> {
  try {
    const { data, error } = await supabase.functions.invoke("cyberpanel-stats", {
      body: {
        action: "websiteStats",
        domain,
      },
    });

    if (error) {
      console.error("Website stats error:", error);
      return null;
    }

    if (!data?.success) {
      console.error("Website stats failed:", data?.error);
      return null;
    }

    return data.data as WebsiteStats;
  } catch (err) {
    console.error("Failed to fetch website stats:", err);
    return null;
  }
}
