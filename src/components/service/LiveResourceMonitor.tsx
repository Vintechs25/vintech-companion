import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Activity, 
  RefreshCw, 
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { fetchWebsiteStats, fetchServerStatus, type ServerStats, type WebsiteStats } from "@/lib/cyberpanel-api";
import { cn } from "@/lib/utils";

interface LiveResourceMonitorProps {
  domain: string;
  refreshInterval?: number; // in seconds
}

type UsageLevel = "low" | "medium" | "high" | "critical";

function getUsageLevel(percentage: number): UsageLevel {
  if (percentage >= 90) return "critical";
  if (percentage >= 75) return "high";
  if (percentage >= 50) return "medium";
  return "low";
}

function getUsageColor(level: UsageLevel): string {
  switch (level) {
    case "critical": return "bg-destructive";
    case "high": return "bg-warning";
    case "medium": return "bg-primary";
    case "low": return "bg-success";
  }
}

function getTextColor(level: UsageLevel): string {
  switch (level) {
    case "critical": return "text-destructive";
    case "high": return "text-warning";
    case "medium": return "text-primary";
    case "low": return "text-success";
  }
}

function TrendIndicator({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (Math.abs(diff) < 2) {
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
  if (diff > 0) {
    return <TrendingUp className="h-3 w-3 text-destructive" />;
  }
  return <TrendingDown className="h-3 w-3 text-success" />;
}

function ResourceCard({
  icon: Icon,
  title,
  value,
  unit,
  percentage,
  previousPercentage,
  isLoading,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  unit: string;
  percentage: number;
  previousPercentage?: number;
  isLoading: boolean;
}) {
  const level = getUsageLevel(percentage);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-1" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg flex items-center justify-center",
              level === "critical" ? "bg-destructive/10" : "bg-muted"
            )}>
              <Icon className={cn("h-5 w-5", getTextColor(level))} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <div className="flex items-center gap-2">
                <p className={cn("text-2xl font-bold", getTextColor(level))}>
                  {value}
                </p>
                <span className="text-sm text-muted-foreground">{unit}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              {previousPercentage !== undefined && (
                <TrendIndicator current={percentage} previous={previousPercentage} />
              )}
              <span className={cn("text-lg font-semibold", getTextColor(level))}>
                {percentage.toFixed(0)}%
              </span>
            </div>
            <Badge variant="outline" className="text-xs capitalize">
              {level}
            </Badge>
          </div>
        </div>
        <div className="relative h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
              getUsageColor(level)
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function LiveResourceMonitor({ domain, refreshInterval = 30 }: LiveResourceMonitorProps) {
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [websiteStats, setWebsiteStats] = useState<WebsiteStats | null>(null);
  const [previousStats, setPreviousStats] = useState<ServerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    
    try {
      const [server, website] = await Promise.all([
        fetchServerStatus(),
        fetchWebsiteStats(domain),
      ]);

      if (server) {
        setPreviousStats(serverStats);
        setServerStats(server);
        setIsLive(true);
      }
      if (website) {
        setWebsiteStats(website);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch resource data:", err);
      setIsLive(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => fetchData(), refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [domain, refreshInterval]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">Live Resource Monitor</h3>
            <p className="text-sm text-muted-foreground">
              Real-time server metrics for {domain}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge variant="outline" className="gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              LIVE
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Server Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <ResourceCard
          icon={Cpu}
          title="CPU Usage"
          value={serverStats?.cpu || 0}
          unit="%"
          percentage={serverStats?.cpu || 0}
          previousPercentage={previousStats?.cpu}
          isLoading={isLoading}
        />
        <ResourceCard
          icon={MemoryStick}
          title="Memory Usage"
          value={serverStats?.memory || 0}
          unit="%"
          percentage={serverStats?.memory || 0}
          previousPercentage={previousStats?.memory}
          isLoading={isLoading}
        />
        <ResourceCard
          icon={HardDrive}
          title="Disk Usage"
          value={serverStats?.disk || 0}
          unit="%"
          percentage={serverStats?.disk || 0}
          previousPercentage={previousStats?.disk}
          isLoading={isLoading}
        />
      </div>

      {/* Website Stats */}
      {websiteStats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Website Usage</CardTitle>
            <CardDescription>Disk and bandwidth usage for this website</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <HardDrive className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Disk Used</p>
                  <p className="text-xl font-bold">{formatBytes(websiteStats.diskUsed)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Wifi className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Bandwidth Used</p>
                  <p className="text-xl font-bold">{formatBytes(websiteStats.bandwidthUsed)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleTimeString()} · Refreshes every {refreshInterval}s
        </p>
      )}
    </div>
  );
}
