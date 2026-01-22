import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { servicesApi, type Service } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Key,
  Power,
  Loader2,
  Database,
  Mail,
  Shield,
  FolderOpen,
  Settings,
  Terminal,
  Server,
  Clock,
  Copy,
  Check,
  Code,
  Globe,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useCyberPanelSSO } from "@/hooks/useCyberPanelSSO";

// Access detail row component
function AccessRow({
  label,
  value,
  copyable = true,
  masked = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  masked?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showValue, setShowValue] = useState(!masked);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
          {masked && !showValue ? "••••••••" : value || "—"}
        </code>
        {masked && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setShowValue(!showValue)}
          >
            {showValue ? "Hide" : "Show"}
          </Button>
        )}
        {copyable && value && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Status indicator
function StatusIndicator({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          active ? "bg-success animate-pulse-subtle" : "bg-muted-foreground"
        )}
      />
      <span className={cn("text-sm font-medium", active ? "text-success" : "text-muted-foreground")}>
        {active ? "Running" : "Stopped"}
      </span>
    </div>
  );
}

// Quick link card for CyberPanel features
function QuickLinkCard({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium flex items-center gap-2">
                {title}
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openCyberPanel, isLoading: ssoLoading } = useCyberPanelSSO();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleOpenCyberPanel = () => {
    if (service?.panel_url) {
      openCyberPanel(service.panel_url, service.username, service.domain);
    }
  };

  useEffect(() => {
    async function fetchService() {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await servicesApi.getOne(parseInt(id));
        setService(data);
      } catch (err) {
        console.error("Service error:", err);
        setError("Failed to load service details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchService();
  }, [id]);

  const handlePasswordChange = async () => {
    if (!id) return;

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setActionLoading("changepassword");
    try {
      const response = await servicesApi.changePassword(parseInt(id), newPassword);
      if (response.result === "success") {
        toast({ title: "Success", description: "Password has been changed" });
        setNewPassword("");
        setConfirmPassword("");
        setPasswordDialogOpen(false);
      } else {
        throw new Error(response.error || "Failed to change password");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async () => {
    if (!id) return;
    setActionLoading("suspend");
    try {
      const response = await servicesApi.suspend(parseInt(id));
      if (response.result === "success") {
        toast({ title: "Success", description: "Service has been suspended" });
        const updated = await servicesApi.getOne(parseInt(id));
        setService(updated);
      } else {
        throw new Error(response.error || "Failed to suspend");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to suspend",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspend = async () => {
    if (!id) return;
    setActionLoading("unsuspend");
    try {
      const response = await servicesApi.unsuspend(parseInt(id));
      if (response.result === "success") {
        toast({ title: "Success", description: "Service has been activated" });
        const updated = await servicesApi.getOne(parseInt(id));
        setService(updated);
      } else {
        throw new Error(response.error || "Failed to unsuspend");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to unsuspend",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Service not found</h2>
        <p className="text-muted-foreground mb-4">{error || "The requested service could not be loaded"}</p>
        <Button onClick={() => navigate("/hosting")}>Back to Projects</Button>
      </div>
    );
  }

  const isActive = service.status.toLowerCase() === "active";
  const isSuspended = service.status.toLowerCase() === "suspended";
  const panelUrl = service.panel_url || "";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 mt-1"
            onClick={() => navigate("/hosting")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Server className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{service.domain}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIndicator active={isActive} />
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">{service.product || "Hosting"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main CTA - Open CyberPanel with SSO */}
        <div className="flex items-center gap-2 ml-14 md:ml-0">
          {panelUrl && (
            <Button 
              size="lg" 
              className="gap-2"
              onClick={handleOpenCyberPanel}
              disabled={ssoLoading}
            >
              {ssoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Terminal className="h-4 w-4" />
              )}
              Open CyberPanel
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Server Details & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Server Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Access Details</CardTitle>
              <CardDescription>Connection information for your server</CardDescription>
            </CardHeader>
            <CardContent className="space-y-0">
              <AccessRow label="Domain" value={service.domain} />
              <AccessRow label="IP Address" value={service.ip || ""} />
              <AccessRow label="Username" value={service.username || ""} />
              {panelUrl && <AccessRow label="Panel URL" value={panelUrl} />}
            </CardContent>
          </Card>

          {/* Quick Links to CyberPanel Features */}
          {panelUrl && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Manage in CyberPanel</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <QuickLinkCard
                  icon={FolderOpen}
                  title="File Manager"
                  description="Browse and edit files"
                  href={`${panelUrl}/filemanager/${service.domain}`}
                />
                <QuickLinkCard
                  icon={Database}
                  title="Databases"
                  description="MySQL/MariaDB management"
                  href={`${panelUrl}/dataBases/listDatabases`}
                />
                <QuickLinkCard
                  icon={Mail}
                  title="Email Accounts"
                  description="Create and manage emails"
                  href={`${panelUrl}/email/listEmails`}
                />
                <QuickLinkCard
                  icon={Shield}
                  title="SSL Certificates"
                  description="Manage HTTPS security"
                  href={`${panelUrl}/manageSSL/${service.domain}`}
                />
                <QuickLinkCard
                  icon={Globe}
                  title="Domains & DNS"
                  description="DNS records management"
                  href={`${panelUrl}/dns/listDNS`}
                />
                <QuickLinkCard
                  icon={Code}
                  title="PHP Settings"
                  description="Configure PHP version"
                  href={`${panelUrl}/websites/listWebsitesv2`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2" disabled={!isActive}>
                    <Key className="h-4 w-4" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Enter a new password for your hosting account</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePasswordChange} disabled={actionLoading === "changepassword"}>
                      {actionLoading === "changepassword" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      Update Password
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {isSuspended ? (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-success hover:text-success"
                  onClick={handleUnsuspend}
                  disabled={actionLoading === "unsuspend"}
                >
                  {actionLoading === "unsuspend" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                  Start Server
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-warning hover:text-warning"
                  onClick={handleSuspend}
                  disabled={!isActive || actionLoading === "suspend"}
                >
                  {actionLoading === "suspend" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                  Stop Server
                </Button>
              )}

              {panelUrl && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={handleOpenCyberPanel}
                  disabled={ssoLoading}
                >
                  {ssoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Terminal className="h-4 w-4" />
                  )}
                  Full Management
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Renewal Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Due Date</span>
                <span className="font-medium">{service.nextduedate || "—"}</span>
              </div>
              {service.billingcycle && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Billing Cycle</span>
                  <Badge variant="secondary">{service.billingcycle}</Badge>
                </div>
              )}
              <Button variant="outline" className="w-full justify-start gap-2 mt-2" asChild>
                <a
                  href={`https://billing.vintechdev.store/clientarea.php?action=productdetails&id=${service.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Settings className="h-4 w-4" />
                  Billing Portal
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Service Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Service Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service ID</span>
                <span className="font-mono">{service.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span>{service.product || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={isActive ? "default" : "secondary"}>{service.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
