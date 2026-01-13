import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { servicesApi, type Service } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Server,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Key,
  Power,
  RefreshCw,
  Globe,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8">
      {copied ? (
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
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
        setError("Failed to load service details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchService();
  }, [id]);

  const handleAction = async (action: string, data?: Record<string, unknown>) => {
    if (!id) return;
    
    setActionLoading(action);
    try {
      const response = await servicesApi.action(parseInt(id), action, data);
      if (response.result === "success") {
        toast({
          title: "Success",
          description: `Action "${action}" completed successfully.`,
        });
        // Refresh service data
        const updated = await servicesApi.getOne(parseInt(id));
        setService(updated);
      } else {
        throw new Error(response.error || "Action failed");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Action failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    await handleAction("changepassword", { password: newPassword });
    setNewPassword("");
    setConfirmPassword("");
    setPasswordDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/hosting">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/hosting">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Service Details</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Service not found"}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/hosting")}>Back to Hosting</Button>
      </div>
    );
  }

  const isActive = service.status.toLowerCase() === "active";
  const isSuspended = service.status.toLowerCase() === "suspended";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/hosting">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{service.domain}</h1>
            <StatusBadge status={service.status} />
          </div>
          <p className="text-muted-foreground">Service #{service.id}</p>
        </div>
        {service.panel_url && (
          <Button asChild className="gradient-primary hover:opacity-90">
            <a href={service.panel_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open CyberPanel
            </a>
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Service Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Service Information</CardTitle>
            <CardDescription>Your hosting account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">Domain</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                    {service.domain}
                  </code>
                  <CopyButton text={service.domain} />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">IP Address</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                    {service.ip || "N/A"}
                  </code>
                  {service.ip && <CopyButton text={service.ip} />}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">Username</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm">
                    {service.username || "N/A"}
                  </code>
                  {service.username && <CopyButton text={service.username} />}
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-muted-foreground text-sm">Panel URL</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm truncate">
                    {service.panel_url || "N/A"}
                  </code>
                  {service.panel_url && <CopyButton text={service.panel_url} />}
                </div>
              </div>
              
              {service.product && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Product</Label>
                  <p className="bg-muted px-3 py-2 rounded text-sm">{service.product}</p>
                </div>
              )}
              
              {service.billingcycle && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-sm">Billing Cycle</Label>
                  <p className="bg-muted px-3 py-2 rounded text-sm">{service.billingcycle}</p>
                </div>
              )}
              
              {service.nextduedate && (
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-muted-foreground text-sm">Next Due Date</Label>
                  <p className="bg-muted px-3 py-2 rounded text-sm">{service.nextduedate}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your hosting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Change Password */}
            <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start" disabled={!isActive}>
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter a new password for your hosting account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={actionLoading === "changepassword"}
                    className="gradient-primary"
                  >
                    {actionLoading === "changepassword" ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Change Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Suspend/Unsuspend */}
            {isSuspended ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAction("unsuspend")}
                disabled={actionLoading === "unsuspend"}
              >
                {actionLoading === "unsuspend" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Power className="h-4 w-4 mr-2" />
                )}
                Unsuspend
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start text-yellow-600 hover:text-yellow-600"
                onClick={() => handleAction("suspend")}
                disabled={!isActive || actionLoading === "suspend"}
              >
                {actionLoading === "suspend" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Power className="h-4 w-4 mr-2" />
                )}
                Suspend
              </Button>
            )}

            {/* Reboot */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAction("reboot")}
              disabled={!isActive || actionLoading === "reboot"}
            >
              {actionLoading === "reboot" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Reboot Server
            </Button>

            {/* Install WordPress */}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAction("installwp")}
              disabled={!isActive || actionLoading === "installwp"}
            >
              {actionLoading === "installwp" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              Install WordPress
            </Button>

            {/* Open Panel */}
            {service.panel_url && (
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={service.panel_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open CyberPanel
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
