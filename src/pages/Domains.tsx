import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { domainsApi, type Domain } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ViewToggle } from "@/components/shared/ViewToggle";
import { EmptyState } from "@/components/shared/EmptyState";
import { CountdownBadge } from "@/components/shared/CountdownBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import {
  Globe,
  AlertCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  Search,
  Shield,
  Settings,
  Calendar,
} from "lucide-react";

export default function Domains() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("domainsView") as "grid" | "list") || "grid";
  });

  useEffect(() => {
    localStorage.setItem("domainsView", view);
  }, [view]);

  useEffect(() => {
    async function fetchDomains() {
      if (!user?.userid) return;
      try {
        const data = await domainsApi.getAll(user.userid);
        setDomains(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load domains");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDomains();
  }, [user?.userid]);

  const filteredDomains = domains.filter((domain) =>
    domain.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Domains</h1>
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
        <h1 className="text-3xl font-bold">Domains</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Domains</h1>
          <p className="text-muted-foreground">
            {domains.length} domain{domains.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/domains/transfer">
              <RefreshCw className="h-4 w-4 mr-2" />
              Transfer
            </Link>
          </Button>
          <Button className="gradient-primary" asChild>
            <Link to="/domains/search">
              <Plus className="h-4 w-4 mr-2" />
              Register Domain
            </Link>
          </Button>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Domains */}
      {domains.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Globe}
              title="No domains registered"
              description="Register a new domain or transfer an existing one"
              action={{ label: "Register Domain", href: "/domains/search", variant: "primary" }}
              secondaryAction={{ label: "Transfer Domain", href: "/domains/transfer" }}
            />
          </CardContent>
        </Card>
      ) : filteredDomains.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No domains match your search</p>
            <Button variant="link" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDomains.map((domain) => (
            <Card key={domain.id} className="hover:shadow-lg transition-all hover:border-primary/30 group">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {domain.domain}
                      </h3>
                      <StatusBadge status={domain.status} size="sm" />
                    </div>
                  </div>
                  <CopyButton text={domain.domain} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Registered
                    </span>
                    <span className="font-medium">{domain.registrationdate || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> Expiry
                    </span>
                    {domain.expirydate ? (
                      <CountdownBadge date={domain.expirydate} />
                    ) : (
                      <span className="font-medium">N/A</span>
                    )}
                  </div>
                  {domain.autorenew !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Auto-Renew</span>
                      <Badge variant={domain.autorenew ? "default" : "secondary"} className="text-xs">
                        {domain.autorenew ? "On" : "Off"}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a
                    href={`https://billing.vintechdev.store/clientarea.php?action=domaindetails&domainid=${domain.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Manage
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Auto-Renew</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDomains.map((domain) => (
                  <TableRow key={domain.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium group-hover:text-primary transition-colors">
                          {domain.domain}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={domain.status} />
                    </TableCell>
                    <TableCell>{domain.registrationdate || "N/A"}</TableCell>
                    <TableCell>
                      {domain.expirydate ? (
                        <CountdownBadge date={domain.expirydate} />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {domain.autorenew !== undefined ? (
                        <Badge variant={domain.autorenew ? "default" : "secondary"}>
                          {domain.autorenew ? "On" : "Off"}
                        </Badge>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={`https://billing.vintechdev.store/clientarea.php?action=domaindetails&domainid=${domain.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Manage
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
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
