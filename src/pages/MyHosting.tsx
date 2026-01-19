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
  HardDrive,
  Zap,
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
        <Button asChild className="gradient-primary hover:opacity-90 shadow-lg shadow-primary/25">
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
        <Card className="border-border/50">
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
        <Card className="border-border/50">
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
          {filteredServices.map((service, index) => (
            <Card 
              key={service.id} 
              className="hover:shadow-xl transition-all duration-300 hover:border-primary/30 group hover:-translate-y-1 border-border/50 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                      <Server className="h-6 w-6 text-primary-foreground" />
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
                      <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{service.ip || "N/A"}</code>
                      {service.ip && <CopyButton text={service.ip} className="h-6 w-6" />}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5" /> Username
                    </span>
                    <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono">{service.username || "N/A"}</code>
                  </div>
                  {service.nextduedate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Renewal</span>
                      <CountdownBadge date={service.nextduedate} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                  <Link to={`/hosting/${service.id}`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Service
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/50">
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
                        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
                          <Server className="h-5 w-5 text-primary-foreground" />
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
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{service.ip || "N/A"}</code>
                        {service.ip && <CopyButton text={service.ip} className="h-6 w-6" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm font-mono">{service.username || "N/A"}</code>
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
                      <Button variant="outline" size="sm" asChild>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
