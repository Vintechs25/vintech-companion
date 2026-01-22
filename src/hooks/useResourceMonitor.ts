import { useState, useEffect, useCallback } from "react";
import { fetchCyberPanelStats, type CyberPanelStats, type ServerStats, type WebsiteStats } from "@/lib/cyberpanel-api";

interface UseResourceMonitorOptions {
  domains: string[];
  refreshInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface ResourceMonitorState {
  stats: CyberPanelStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useResourceMonitor({
  domains,
  refreshInterval = 60000, // Default 1 minute
  enabled = true,
}: UseResourceMonitorOptions) {
  const [state, setState] = useState<ResourceMonitorState>({
    stats: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const fetchStats = useCallback(async () => {
    if (!enabled || domains.length === 0) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const stats = await fetchCyberPanelStats(domains);
      
      if (stats) {
        setState({
          stats,
          isLoading: false,
          error: null,
          lastUpdated: new Date(),
        });
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "Failed to fetch stats",
        }));
      }
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [domains, enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled && domains.length > 0) {
      fetchStats();
    }
  }, [enabled, domains.length]); // Only on mount or when domains change

  // Polling interval
  useEffect(() => {
    if (!enabled || domains.length === 0 || refreshInterval <= 0) return;

    const intervalId = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(intervalId);
  }, [enabled, domains.length, refreshInterval, fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    refresh,
    getWebsiteStats: (domain: string): WebsiteStats | undefined => {
      return state.stats?.websites.find(w => w.domain === domain);
    },
    serverStats: state.stats?.server || null,
  };
}
