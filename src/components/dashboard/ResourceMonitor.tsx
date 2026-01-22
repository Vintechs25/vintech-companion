import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/api";
import { 
  Server, 
  HardDrive, 
  Activity, 
  ArrowRight,
  Database,
  Wifi,
  Cpu,
  MemoryStick
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

// Generate simulated usage based on service ID for consistency
function getSimulatedUsage(serviceId: number): ResourceUsage {
  // Use service ID as seed for consistent random-looking values
  const seed = serviceId * 7919; // Prime number for variation
  
  const pseudoRandom = (offset: number) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };

  // Storage: 0.5GB - 8GB used of 10GB-50GB total
  const storageTier = Math.floor(pseudoRandom(1) * 3); // 0, 1, 2
  const storageTotal = [10, 25, 50][storageTier];
  const storageUsed = Math.round((0.1 + pseudoRandom(2) * 0.6) * storageTotal * 10) / 10;

  // Bandwidth: varies by activity level
  const bandwidthTotal = [50, 100, 250][storageTier];
  const bandwidthUsed = Math.round((0.05 + pseudoRandom(3) * 0.5) * bandwidthTotal * 10) / 10;

  // CPU & Memory: percentage based
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

interface ServiceResourceCardProps {
  service: Service;
  index: number;
}

function ServiceResourceCard({ service, index }: ServiceResourceCardProps) {
  const usage = getSimulatedUsage(service.id);
  const isActive = service.status.toLowerCase() === "active";
  
  const storagePercent = (usage.storage.used / usage.storage.total) * 100;
  const bandwidthPercent = (usage.bandwidth.used / usage.bandwidth.total) * 100;
  
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
              <p className="text-xs text-muted-foreground">
                {service.product || "Web Hosting"}
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
              {usage.storage.used} / {usage.storage.total} GB
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
              {usage.bandwidth.used} / {usage.bandwidth.total} GB
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
            <Cpu className={cn("h-4 w-4", getUsageColor(cpuLevel).replace("bg-", "text-"))} />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">CPU</p>
              <p className="text-sm font-semibold tabular-nums">{usage.cpu}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <MemoryStick className={cn("h-4 w-4", getUsageColor(memoryLevel).replace("bg-", "text-"))} />
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

function ResourceSummaryCard({ services }: { services: Service[] }) {
  const activeServices = services.filter(s => s.status.toLowerCase() === "active");
  
  // Calculate aggregate stats
  const totalStats = activeServices.reduce((acc, service) => {
    const usage = getSimulatedUsage(service.id);
    return {
      storageUsed: acc.storageUsed + usage.storage.used,
      storageTotal: acc.storageTotal + usage.storage.total,
      bandwidthUsed: acc.bandwidthUsed + usage.bandwidth.used,
      bandwidthTotal: acc.bandwidthTotal + usage.bandwidth.total,
      avgCpu: acc.avgCpu + usage.cpu,
      avgMemory: acc.avgMemory + usage.memory,
    };
  }, { storageUsed: 0, storageTotal: 0, bandwidthUsed: 0, bandwidthTotal: 0, avgCpu: 0, avgMemory: 0 });

  const avgCpu = activeServices.length ? Math.round(totalStats.avgCpu / activeServices.length) : 0;
  const avgMemory = activeServices.length ? Math.round(totalStats.avgMemory / activeServices.length) : 0;

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Total Resources</CardTitle>
            <p className="text-xs text-muted-foreground">
              Across {activeServices.length} active service{activeServices.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Storage</span>
            </div>
            <p className="text-lg font-bold tabular-nums">
              {totalStats.storageUsed.toFixed(1)} GB
            </p>
            <p className="text-xs text-muted-foreground">
              of {totalStats.storageTotal} GB
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Bandwidth</span>
            </div>
            <p className="text-lg font-bold tabular-nums">
              {totalStats.bandwidthUsed.toFixed(1)} GB
            </p>
            <p className="text-xs text-muted-foreground">
              of {totalStats.bandwidthTotal} GB
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avg CPU</span>
            </div>
            <p className="text-lg font-bold tabular-nums">{avgCpu}%</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Avg RAM</span>
            </div>
            <p className="text-lg font-bold tabular-nums">{avgMemory}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourceMonitor({ services }: ResourceMonitorProps) {
  const activeServices = services.filter(s => s.status.toLowerCase() === "active");

  if (activeServices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Resource Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Real-time usage across your hosting services
          </p>
        </div>
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link to="/hosting">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Summary Card */}
        <ResourceSummaryCard services={services} />
        
        {/* Individual Service Cards */}
        {activeServices.slice(0, 3).map((service, index) => (
          <ServiceResourceCard key={service.id} service={service} index={index} />
        ))}
      </div>
    </div>
  );
}
