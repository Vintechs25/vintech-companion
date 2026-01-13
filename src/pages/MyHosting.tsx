import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { servicesApi, type Service } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Server,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Search,
  Settings,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "active") {
    return (
      <Badge className="bg-primary/20 text-primary border-0">
        <CheckCircle className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  }
  
  if (statusLower === "pending") {
    return (
      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-0">
        <Clock className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  }
  
  if (statusLower === "suspended" || statusLower === "cancelled" || statusLower === "terminated") {
    return (
      <Badge variant="destructive" className="bg-destructive/20 border-0">
        <XCircle className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  }
  
  return <Badge variant="outline">{status}</Badge>;
}

export default function MyHosting() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredServices = services.filter(
    (service) =>
      service.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.ip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Hosting</h1>
            <p className="text-muted-foreground">Loading your services...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
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
          </p>
        </div>
        <Button asChild className="gradient-primary hover:opacity-90">
          <Link to="/order">
            <Plus className="h-4 w-4 mr-2" />
            New Hosting
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by domain, IP, or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Services Table */}
      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Server className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hosting services</h3>
            <p className="text-muted-foreground mb-4">
              Get started by ordering your first hosting plan
            </p>
            <Button asChild className="gradient-primary">
              <Link to="/order">
                <Plus className="h-4 w-4 mr-2" />
                Order Hosting
              </Link>
            </Button>
          </CardContent>
        </Card>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Server className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{service.domain}</p>
                          {service.product && (
                            <p className="text-sm text-muted-foreground">
                              {service.product}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {service.ip || "N/A"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">{service.username || "N/A"}</code>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={service.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {service.panel_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={service.panel_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
            
            {filteredServices.length === 0 && searchQuery && (
              <div className="text-center py-8 text-muted-foreground">
                No services match your search
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
