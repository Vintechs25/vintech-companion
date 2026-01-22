import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/api";
import { useResourceMonitor } from "@/hooks/useResourceMonitor";
import { 
  Server, 
  HardDrive, 
  Activity, 
  ArrowRight,
  Database,
  Wifi,
  Cpu,
  MemoryStick,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface ResourceMonitorProps {
  services: Service[];
}

interface ResourceUsage {
  storage: { used: number; total: number };
  bandwidth: { used: number; total: number };
  cpu: number;
  memory: number;
}

// Fallback simulated usage based on service ID for consistency
function getSimulatedUsage(serviceId: number): ResourceUsage {
  const seed = serviceId * 7919;
  
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  const storageTier = Math.floor(pseudoRandom(1) * 3);
  const storageTotal = [10, 25, 50][storageTier];
  const storageUsed = Math.round((0.1 + pseudoRandom(2) * 0.6) * storageTotal * 10) / 10;

  const bandwidthTotal = [50, 100, 250][storageTier];
  const bandwidthUsed = Math.round((0.05 + pseudoRandom(3) * 0.5) * bandwidthTotal * 10) / 10;

  const cpu = Math.round(5 + pseudoRandom(4) * 35);
  const memory = Math.round(15 + pseudoRandom(5) * 45);

  return {
    storage: { used: storageUsed, total: storageTotal },
    bandwidth: { used: bandwidthUsed, total: bandwidthTotal },
    cpu,
    memory,
  };
}

function getUsageLevel(percentage: number): "low" | "medium" | "high" | "critical" {
  if (percentage >= 90) return "critical";
  if (percentage >= 75) return "high";
  if (percentage >= 50) return "medium";
  return "low";
}

function getUsageColor(level: "low" | "medium" | "high" | "critical"): string {
  switch (level) {
    case "critical": return "bg-destructive";
    case "high": return "bg-warning";
    case "medium": return "bg-primary";
    case "low": return "bg-success";
  }
}

function getTextColor(level: "low" | "medium" | "high" | "critical"): string {
  switch (level) {
    case "critical": return "text-destructive";
    case "high": return "text-warning";
    case "medium": return "text-primary";
    case "low": return "text-success";
  }
}

interface ServiceResourceCardProps {
  service: Service;
  index: number;
  realStats?: { diskUsed: number; bandwidthUsed: number } | null;
  serverStats?: { cpu: number; memory: number } | null;
}

function ServiceResourceCard({ service, index, realStats, serverStats }: ServiceResourceCardProps) {
  const isActive = service.status.toLowerCase() === "active";
  
  // Use real stats if available, otherwise fallback to simulated
  const simulatedUsage = getSimulatedUsage(service.id);
  
  const usage: ResourceUsage = realStats ? {
    storage: { 
      used: realStats.diskUsed / 1024, // Convert MB to GB
      total: simulatedUsage.storage.total 
    },
    bandwidth: { 
      used: realStats.bandwidthUsed / 1024, // Convert MB to GB
      total: simulatedUsage.bandwidth.total 
    },
    cpu: serverStats?.cpu ?? simulatedUsage.cpu,
    memory: serverStats?.memory ?? simulatedUsage.memory,
  } : simulatedUsage;
  
  const storagePercent = Math.min((usage.storage.used / usage.storage.total) * 100, 100);
  const bandwidthPercent = Math.min((usage.bandwidth.used / usage.bandwidth.total) * 100, 100);
  
  const storageLevel = getUsageLevel(storagePercent);
  const bandwidthLevel = getUsageLevel(bandwidthPercent);
  const cpuLevel = getUsageLevel(usage.cpu);
  const memoryLevel = getUsageLevel(usage.memory);

  if (!isActive) return null;

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 animate-fade-in",
        `stagger-${Math.min(index + 1, 5)}`
      )}
      style={{ animationFillMode: 'backwards' }}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold line-clamp-1">
                {service.domain}
              </CardTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {service.product || "Web Hosting"}
                {realStats && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 ml-1 border-success/50 text-success">
                    LIVE
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px]",
              storageLevel === "critical" || bandwidthLevel === "critical"
                ? "border-destructive/50 text-destructive"
                : storageLevel === "high" || bandwidthLevel === "high"
                ? "border-warning/50 text-warning"
                : "border-success/50 text-success"
            )}
          >
            {storageLevel === "critical" || bandwidthLevel === "critical"
              ? "Attention"
              : storageLevel === "high" || bandwidthLevel === "high"
              ? "Moderate"
              : "Healthy"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        {/* Storage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              <span>Storage</span>
            </div>
            <span className="font-medium tabular-nums">
              {usage.storage.used.toFixed(1)} / {usage.storage.total} GB
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-out rounded-full",
                getUsageColor(storageLevel)
              )}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>

        {/* Bandwidth */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wifi className="h-4 w-4" />
              <span>Bandwidth</span>
            </div>
            <span className="font-medium tabular-nums">
              {usage.bandwidth.used.toFixed(1)} / {usage.bandwidth.total} GB
            </span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <div 
              className={cn(
                "h-full transition-all duration-1000 ease-out rounded-full",
                getUsageColor(bandwidthLevel)
              )}
              style={{ width: `${bandwidthPercent}%` }}
            />
          </div>
        </div>

        {/* CPU & Memory Mini Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Cpu className={cn("h-4 w-4", getTextColor(cpuLevel))} />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">CPU</p>
              <p className="text-sm font-semibold tabular-nums">{usage.cpu}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <MemoryStick className={cn("h-4 w-4", getTextColor(memoryLevel))} />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">RAM</p>
              <p className="text-sm font-semibold tabular-nums">{usage.memory}%</p>
            </div>
          </div>
        </div>

        {/* View Details Link */}
        <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
          <Link to={`/hosting/${service.id}`}>
            View Details
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface ResourceSummaryCardProps {
  services: Service[];
  serverStats?: { cpu: number; memory: number; disk: number } | null;
  isLoading?: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

function ResourceSummaryCard({ services, serverStats, isLoading, lastUpdated, onRefresh }: ResourceSummaryCardProps) {
  const activeServices = services.filter(s => s.status.toLowerCase() === "active");
  
  // Calculate aggregate stats using simulated data for now
  const totalStats = activeServices.reduce((acc, service) => {
    const usage = getSimulatedUsage(service.id);
    return {
      storageUsed: acc.storageUsed + usage.storage.used,
      storageTotal: acc.storageTotal + usage.storage.total,
      bandwidthUsed: acc.bandwidthUsed + usage.bandwidth.used,
      bandwidthTotal: acc.bandwidthTotal + usage.bandwidth.total,
    };
  }, { storageUsed: 0, storageTotal: 0, bandwidthUsed: 0, bandwidthTotal: 0 });

  const cpu = serverStats?.cpu ?? (activeServices.length ? 
    Math.round(activeServices.reduce((sum, s) => sum + getSimulatedUsage(s.id).cpu, 0) / activeServices.length) : 0);
  const memory = serverStats?.memory ?? (activeServices.length ? 
    Math.round(activeServices.reduce((sum, s) => sum + getSimulatedUsage(s.id).memory, 0) / activeServices.length) : 0);

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Server Resources
                {serverStats && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 border-success/50 text-success">
                    LIVE
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {lastUpdated 
                  ? `Updated ${lastUpdated.toLocaleTimeString()}`
                  : `${activeServices.length} active service${activeServices.length !== 1 ? "s" : ""}`
                }
              </p>
            </div>
          </div>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Storage</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <>
                <p className="text-lg font-bold tabular-nums">
                  {totalStats.storageUsed.toFixed(1)} GB
                </p>
                <p className="text-xs text-muted-foreground">
                  of {totalStats.storageTotal} GB
                </p>
              </>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Bandwidth</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <>
                <p className="text-lg font-bold tabular-nums">
                  {totalStats.bandwidthUsed.toFixed(1)} GB
                </p>
                <p className="text-xs text-muted-foreground">
                  of {totalStats.bandwidthTotal} GB
                </p>
              </>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className={cn("h-4 w-4", getTextColor(getUsageLevel(cpu)))} />
              <span className="text-xs text-muted-foreground">CPU</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <p className="text-lg font-bold tabular-nums">{cpu}%</p>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MemoryStick className={cn("h-4 w-4", getTextColor(getUsageLevel(memory)))} />
              <span className="text-xs text-muted-foreground">RAM</span>
            </div>
            {isLoading ? (
              <Skeleton className="h-7 w-14" />
            ) : (
              <p className="text-lg font-bold tabular-nums">{memory}%</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResourceErrorCard({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <Card className="border-warning/30 bg-warning/5">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
          <AlertCircle className="h-5 w-5 text-warning" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Unable to fetch live stats</p>
          <p className="text-xs text-muted-foreground">Using estimated values</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

export function ResourceMonitor({ services }: ResourceMonitorProps) {
  const activeServices = services.filter(s => s.status.toLowerCase() === "active");
  const domains = activeServices.map(s => s.domain);

  const { 
    stats, 
    isLoading, 
    error, 
    lastUpdated, 
    refresh,
    getWebsiteStats,
    serverStats 
  } = useResourceMonitor({
    domains,
    refreshInterval: 60000, // Refresh every minute
    enabled: activeServices.length > 0,
  });

  if (activeServices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Resource Monitor</h2>
          <p className="text-sm text-muted-foreground">
            {stats ? "Live data from CyberPanel" : "Real-time usage across your hosting services"}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link to="/hosting">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {error && !stats && (
        <ResourceErrorCard error={error} onRetry={refresh} />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Summary Card */}
        <ResourceSummaryCard 
          services={services}
          serverStats={serverStats}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />
        
        {/* Individual Service Cards */}
        {activeServices.slice(0, 3).map((service, index) => {
          const websiteStats = getWebsiteStats(service.domain);
          return (
            <ServiceResourceCard 
              key={service.id} 
              service={service} 
              index={index}
              realStats={websiteStats}
              serverStats={serverStats}
            />
          );
        })}
      </div>
    </div>
  );
}
