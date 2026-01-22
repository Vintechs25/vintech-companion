import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { servicesApi, type Service } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CopyButton } from "@/components/shared/CopyButton";
import {
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Key,
  Power,
  RefreshCw,
  Globe,
  Loader2,
  Database,
  Mail,
  Shield,
  FolderOpen,
  Download,
  Settings,
  Activity,
  Terminal,
  Server,
  Clock,
  Copy,
  Check,
  Archive,
  Code,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Import CyberPanel management components
import {
  LiveResourceMonitor,
  EmailManager,
  DatabaseManager,
  SSLManager,
  BackupManager,
  PHPManager,
} from "@/components/service";

// Cloudways-style tabs
const managementTabs = [
  { id: "access", label: "Access Details", icon: Key },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "applications", label: "Applications", icon: Globe },
  { id: "settings", label: "Settings", icon: Settings },
];

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
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

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

  const handleModuleCommand = async (command: string, successMessage: string) => {
    if (!id) return;
    setActionLoading(command);
    try {
      const response = await servicesApi.moduleCommand(parseInt(id), command);
      if (response.result === "success") {
        toast({ title: "Success", description: successMessage });
        const updated = await servicesApi.getOne(parseInt(id));
        setService(updated);
      } else {
        throw new Error(response.error || `Failed to execute ${command}`);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : `Failed to execute ${command}`,
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
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - Cloudways Style */}
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

        <div className="flex items-center gap-2 ml-14 md:ml-0">
          {service.panel_url && (
            <Button asChild>
              <a href={service.panel_url} target="_blank" rel="noopener noreferrer">
                <Terminal className="h-4 w-4 mr-2" />
                CyberPanel
                <ExternalLink className="h-3 w-3 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Cloudways-style Tabbed Management */}
      <Tabs defaultValue="access" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto">
          {managementTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="gap-2 data-[state=active]:bg-background"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Access Details Tab */}
        <TabsContent value="access" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Server Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Server Details</CardTitle>
                <CardDescription>Connection information for your server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-0">
                <AccessRow label="Domain" value={service.domain} />
                <AccessRow label="IP Address" value={service.ip || ""} />
                <AccessRow label="Username" value={service.username || ""} />
                <AccessRow label="Panel URL" value={service.panel_url || ""} />
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-4">
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

                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => handleModuleCommand("reboot", "Server is rebooting...")}
                    disabled={!isActive || actionLoading === "reboot"}
                  >
                    {actionLoading === "reboot" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Restart Server
                  </Button>

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

              {/* Renewal Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Renewal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Next Due Date</span>
                    <span className="font-medium">{service.nextduedate || "—"}</span>
                  </div>
                  {service.billingcycle && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Billing Cycle</span>
                      <Badge variant="secondary">{service.billingcycle}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Monitoring Tab - Now with LIVE data */}
        <TabsContent value="monitoring" className="space-y-6">
          {/* Live Resource Monitor */}
          <LiveResourceMonitor domain={service.domain} refreshInterval={30} />
          
          {/* SSL Manager */}
          <SSLManager domain={service.domain} />
          
          {/* Backup Manager */}
          <BackupManager domain={service.domain} />
        </TabsContent>

        {/* Applications Tab - Real CyberPanel Management */}
        <TabsContent value="applications" className="space-y-6">
          {/* Quick Install Section */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* WordPress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  WordPress
                </CardTitle>
                <CardDescription>One-click installation</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleModuleCommand("installwp", "WordPress installation started!")}
                  disabled={!isActive || actionLoading === "installwp"}
                >
                  {actionLoading === "installwp" ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Install WordPress
                </Button>
              </CardContent>
            </Card>

            {/* File Manager */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  File Manager
                </CardTitle>
                <CardDescription>Browse and edit files</CardDescription>
              </CardHeader>
              <CardContent>
                {service.panel_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`${service.panel_url}/filemanager`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open File Manager
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* PHP Version */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  PHP Version
                </CardTitle>
                <CardDescription>Change PHP configuration</CardDescription>
              </CardHeader>
              <CardContent>
                {service.panel_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`${service.panel_url}/websites/listPHPWebsite`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage PHP
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Email Manager */}
          <EmailManager domain={service.domain} />
          
          {/* Database Manager */}
          <DatabaseManager domain={service.domain} />
          
          {/* PHP Manager */}
          <PHPManager domain={service.domain} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Service Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                <AccessRow label="Service ID" value={String(service.id)} copyable={false} />
                <AccessRow label="Product" value={service.product || "—"} copyable={false} />
                <AccessRow label="Status" value={service.status} copyable={false} />
                <AccessRow label="Billing Cycle" value={service.billingcycle || "—"} copyable={false} />
                <AccessRow label="Next Due Date" value={service.nextduedate || "—"} copyable={false} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">External Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a
                    href={`https://billing.vintechdev.store/clientarea.php?action=productdetails&id=${service.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View in Billing Portal
                  </a>
                </Button>
                {service.panel_url && (
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <a href={service.panel_url} target="_blank" rel="noopener noreferrer">
                      <Terminal className="h-4 w-4" />
                      Open CyberPanel
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
