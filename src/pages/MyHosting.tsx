import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { servicesApi, type Service } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { EmptyState } from "@/components/shared/EmptyState";
import { CountdownBadge } from "@/components/shared/CountdownBadge";
import { QuickActionsMenu } from "@/components/shared/QuickActionsMenu";
import { ServerHealthBar } from "@/components/shared/ServerHealthBar";
import { useServerStats } from "@/hooks/useServerStats";
import { cn } from "@/lib/utils";
import {
  Server,
  Plus,
  AlertCircle,
  Search,
  Settings,
  Globe,
  ArrowRight,
  Activity,
} from "lucide-react";

// Project card with health indicators
function ProjectCard({ service }: { service: Service }) {
  const { stats, isLive } = useServerStats(service.ip);
  const isActive = service.status.toLowerCase() === "active";

  return (
    <div className="group relative">
      <Link to={`/hosting/${service.id}`}>
        <Card className="h-full overflow-hidden border-border/50 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5">
          <CardContent className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                  isActive ? "bg-success/10" : "bg-muted"
                )}>
                  <Server className={cn("h-5 w-5", isActive ? "text-success" : "text-muted-foreground")} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium truncate text-sm group-hover:text-primary transition-colors">
                    {service.domain}
                  </h3>
                  {service.product && (
                    <p className="text-xs text-muted-foreground truncate">{service.product}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={service.status} size="sm" />
              </div>
            </div>

            {/* Server Health */}
            {isActive && stats && (
              <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Activity className="h-3 w-3" />
                    Server Health
                  </span>
                  {isLive && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-success/10 text-success border-success/30">
                      LIVE
                    </Badge>
                  )}
                </div>
                <ServerHealthBar cpu={stats.cpu} ram={stats.ram} disk={stats.disk} />
              </div>
            )}

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> IP
                </span>
                <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                  <code className="text-xs font-mono text-foreground/80">{service.ip || "—"}</code>
                  {service.ip && <CopyButton text={service.ip} className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
              </div>
              {service.nextduedate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Renewal</span>
                  <CountdownBadge date={service.nextduedate} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Click to manage</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
          </CardContent>
        </Card>
      </Link>
      
      {/* Quick Actions - positioned absolutely */}
      <div className="absolute top-3 right-3 z-10">
        <QuickActionsMenu service={service} />
      </div>
    </div>
  );
}

// Table row with health indicators
function ProjectTableRow({ service }: { service: Service }) {
  const { stats, isLive } = useServerStats(service.ip);
  const isActive = service.status.toLowerCase() === "active";

  return (
    <TableRow className="group">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-8 w-8 rounded-md flex items-center justify-center",
            isActive ? "bg-success/10" : "bg-muted"
          )}>
            <Server className={cn("h-4 w-4", isActive ? "text-success" : "text-muted-foreground")} />
          </div>
          <div>
            <p className="font-medium text-sm">{service.domain}</p>
            {service.product && (
              <p className="text-xs text-muted-foreground">{service.product}</p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <code className="text-xs font-mono">{service.ip || "—"}</code>
          {service.ip && <CopyButton text={service.ip} className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={service.status} size="sm" />
      </TableCell>
      <TableCell>
        {isActive && stats ? (
          <div className="flex items-center gap-2">
            <ServerHealthBar cpu={stats.cpu} ram={stats.ram} disk={stats.disk} compact />
            {isLive && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 bg-success/10 text-success border-success/30">
                LIVE
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        {service.nextduedate ? (
          <CountdownBadge date={service.nextduedate} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/hosting/${service.id}`}>
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Link>
          </Button>
          <QuickActionsMenu service={service} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function MyHosting() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("hostingView") as "grid" | "list") || "grid";
  });

  useEffect(() => {
    localStorage.setItem("hostingView", view);
  }, [view]);

  useEffect(() => {
    async function fetchServices() {
      if (!user?.userid) return;

      try {
        setIsLoading(true);
        const data = await servicesApi.getAll(user.userid);
        setServices(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Services error:", err);
        setError("Failed to load services. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchServices();
  }, [user?.userid]);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.ip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.product?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || service.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const statusOptions = ["all", ...new Set(services.map((s) => s.status.toLowerCase()))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-sm text-muted-foreground">Loading your services...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage your hosting accounts</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            {services.length} project{services.length !== 1 ? "s" : ""}
            {filteredServices.length !== services.length && ` · ${filteredServices.length} shown`}
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/order">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px] h-9">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all" ? "All Status" : status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Services */}
      {services.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12">
          <EmptyState
            icon={Server}
            title="No projects yet"
            description="Get started by creating your first hosting project"
            action={{ label: "Create Project", href: "/order", variant: "primary" }}
          />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No projects match your search</p>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ProjectCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-medium">Project</TableHead>
                <TableHead className="font-medium">IP Address</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Health</TableHead>
                <TableHead className="font-medium">Renewal</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <ProjectTableRow key={service.id} service={service} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}