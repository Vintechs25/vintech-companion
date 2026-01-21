import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { servicesApi, type Service } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
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
import {
  Server,
  Plus,
  AlertCircle,
  Search,
  Settings,
  Globe,
  ArrowRight,
} from "lucide-react";

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
            <Link 
              key={service.id} 
              to={`/hosting/${service.id}`}
              className="group"
            >
              <div className="rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                      <Server className="h-5 w-5 text-foreground/70" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium truncate text-sm">
                        {service.domain}
                      </h3>
                      {service.product && (
                        <p className="text-xs text-muted-foreground truncate">{service.product}</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={service.status} size="sm" />
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> IP
                    </span>
                    <div className="flex items-center gap-1">
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
              </div>
            </Link>
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
                <TableHead className="font-medium">Renewal</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-foreground/5 flex items-center justify-center">
                        <Server className="h-4 w-4 text-foreground/70" />
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
                    {service.nextduedate ? (
                      <CountdownBadge date={service.nextduedate} />
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/hosting/${service.id}`}>
                        <Settings className="h-4 w-4 mr-1" />
                        Manage
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
