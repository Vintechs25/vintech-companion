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
  Server,
  Clock,
  Copy,
  Check,
  Terminal,
  Settings,
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

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openWhmcsSso, isLoading: ssoLoading } = useCyberPanelSSO();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const handleOpenCyberPanel = () => {
    if (service?.id) {
      openWhmcsSso(service.id);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => navigate("/hosting")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isActive ? "bg-success/10" : "bg-muted"
            )}>
              <Server className={cn("h-5 w-5", isActive ? "text-success" : "text-muted-foreground")} />
            </div>
            <div>
              <h1 className="text-lg font-semibold">{service.domain}</h1>
              <div className="flex items-center gap-2">
                <StatusIndicator active={isActive} />
                <span className="text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">{service.product || "Hosting"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA - Use WHMCS SSO */}
        <Button 
          size="lg" 
          className="gap-2 w-full sm:w-auto"
          onClick={handleOpenCyberPanel}
          disabled={ssoLoading}
        >
          <Terminal className="h-4 w-4" />
          Open Control Panel
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Server Details */}
        <div className="lg:col-span-2">
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
        </div>

        {/* Right Column - Actions & Info */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Actions</CardTitle>
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
            </CardContent>
          </Card>

          {/* Billing Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Due</span>
                <span className="font-medium text-sm">{service.nextduedate || "—"}</span>
              </div>
              {service.billingcycle && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cycle</span>
                  <Badge variant="secondary" className="text-xs">{service.billingcycle}</Badge>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 mt-2" asChild>
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
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono">{service.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product</span>
                <span className="truncate ml-4">{service.product || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={isActive ? "default" : "secondary"} className="text-xs">{service.status}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}