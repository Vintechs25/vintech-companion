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
  ExternalLink,
  Search,
  Settings,
  Globe,
  HardDrive,
  FolderOpen,
  Shield,
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
            <h1 className="text-3xl font-bold">My Hosting</h1>
            <p className="text-muted-foreground">Loading your services...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Hosting</h1>
          <p className="text-muted-foreground">Manage your hosting accounts</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Hosting</h1>
          <p className="text-muted-foreground">
            {services.length} service{services.length !== 1 ? "s" : ""} total
            {filteredServices.length !== services.length && ` · ${filteredServices.length} shown`}
          </p>
        </div>
        <Button asChild className="gradient-primary hover:opacity-90">
          <Link to="/order">
            <Plus className="h-4 w-4 mr-2" />
            New Hosting
          </Link>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by domain, IP, username, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
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
        <Card>
          <CardContent>
            <EmptyState
              icon={Server}
              title="No hosting services"
              description="Get started by ordering your first hosting plan"
              action={{ label: "Order Hosting", href: "/order", variant: "primary" }}
            />
          </CardContent>
        </Card>
      ) : filteredServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No services match your search</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-all hover:border-primary/30 group">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Server className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {service.domain}
                      </h3>
                      {service.product && (
                        <p className="text-sm text-muted-foreground truncate">{service.product}</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={service.status} />
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> IP Address
                    </span>
                    <div className="flex items-center gap-1">
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">{service.ip || "N/A"}</code>
                      {service.ip && <CopyButton text={service.ip} className="h-6 w-6" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5" /> Username
                    </span>
                    <code className="bg-muted px-2 py-0.5 rounded text-xs">{service.username || "N/A"}</code>
                  </div>
                  {service.nextduedate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Renewal</span>
                      <CountdownBadge date={service.nextduedate} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {service.panel_url && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={service.panel_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Panel
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to={`/hosting/${service.id}`}>
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Renewal</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Server className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">
                            {service.domain}
                          </p>
                          {service.product && (
                            <p className="text-sm text-muted-foreground">{service.product}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="text-sm bg-muted px-2 py-1 rounded">{service.ip || "N/A"}</code>
                        {service.ip && <CopyButton text={service.ip} className="h-6 w-6" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">{service.username || "N/A"}</code>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={service.status} />
                    </TableCell>
                    <TableCell>
                      {service.nextduedate ? (
                        <CountdownBadge date={service.nextduedate} />
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {service.panel_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={service.panel_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Panel
                            </a>
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/hosting/${service.id}`}>
                            <Settings className="h-4 w-4 mr-1" />
                            Manage
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
