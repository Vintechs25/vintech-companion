import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { domainsApi, type Domain } from "@/lib/api";
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
  Settings,
  Calendar,
  ArrowRight,
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
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
            <p className="text-sm text-muted-foreground">Loading domains...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
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
          <h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
          <p className="text-sm text-muted-foreground">Manage your domain names</p>
        </div>
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
          <h1 className="text-2xl font-semibold tracking-tight">Domains</h1>
          <p className="text-sm text-muted-foreground">
            {domains.length} domain{domains.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/domains/transfer">
              <RefreshCw className="h-4 w-4 mr-2" />
              Transfer
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/domains/search">
              <Plus className="h-4 w-4 mr-2" />
              Register
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
            className="pl-10 h-9"
          />
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Domains */}
      {domains.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12">
          <EmptyState
            icon={Globe}
            title="No domains registered"
            description="Register a new domain or transfer an existing one"
            action={{ label: "Register Domain", href: "/domains/search", variant: "primary" }}
            secondaryAction={{ label: "Transfer Domain", href: "/domains/transfer" }}
          />
        </div>
      ) : filteredDomains.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No domains match your search</p>
          <Button variant="link" size="sm" onClick={() => setSearchQuery("")}>
            Clear search
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDomains.map((domain) => (
            <div 
              key={domain.id} 
              className="rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-foreground/70" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium truncate text-sm">{domain.domain}</h3>
                    <StatusBadge status={domain.status} size="sm" />
                  </div>
                </div>
                <CopyButton text={domain.domain} className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Registered
                  </span>
                  <span className="font-medium text-xs">{domain.registrationdate || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expiry</span>
                  {domain.expirydate ? (
                    <CountdownBadge date={domain.expirydate} />
                  ) : (
                    <span className="text-xs">—</span>
                  )}
                </div>
                {domain.autorenew !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Auto-Renew</span>
                    <Badge variant={domain.autorenew ? "default" : "secondary"} className="text-xs h-5">
                      {domain.autorenew ? "On" : "Off"}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Actions */}
              <Button variant="outline" size="sm" className="w-full h-8" asChild>
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
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-medium">Domain</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="font-medium">Registration</TableHead>
                <TableHead className="font-medium">Expiry</TableHead>
                <TableHead className="font-medium">Auto-Renew</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDomains.map((domain) => (
                <TableRow key={domain.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-foreground/5 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-foreground/70" />
                      </div>
                      <span className="font-medium text-sm">{domain.domain}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={domain.status} size="sm" />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{domain.registrationdate || "—"}</TableCell>
                  <TableCell>
                    {domain.expirydate ? (
                      <CountdownBadge date={domain.expirydate} />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {domain.autorenew !== undefined ? (
                      <Badge variant={domain.autorenew ? "default" : "secondary"} className="text-xs">
                        {domain.autorenew ? "On" : "Off"}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8" asChild>
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
        </div>
      )}
    </div>
  );
}
