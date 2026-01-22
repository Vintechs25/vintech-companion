import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ServerStats {
  cpu: number;
  ram: number;
  disk: number;
  uptime?: string;
}

interface UseServerStatsResult {
  stats: ServerStats | null;
  isLive: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Generate consistent simulated stats based on server IP
function getSimulatedStats(serverIp: string): ServerStats {
  const hash = serverIp.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    cpu: 8 + (hash % 25),
    ram: 35 + (hash % 30),
    disk: 15 + (hash % 40),
  };
}

export function useServerStats(serverIp: string | undefined): UseServerStatsResult {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!serverIp) {
      setStats(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("cyberpanel-stats", {
        body: { serverIp },
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.success && data.stats) {
        setStats(data.stats);
        setIsLive(data.live === true);
      } else if (data?.fallback) {
        // Use simulated stats as fallback
        setStats(getSimulatedStats(serverIp));
        setIsLive(false);
      } else {
        throw new Error(data?.error || "Failed to fetch stats");
      }
    } catch (err) {
      console.error("Server stats error:", err);
      // Fallback to simulated stats on error
      setStats(getSimulatedStats(serverIp));
      setIsLive(false);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setIsLoading(false);
    }
  }, [serverIp]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLive,
    isLoading,
    error,
    refresh: fetchStats,
  };
}