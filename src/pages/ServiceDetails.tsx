import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { servicesApi, type Service } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { CountdownBadge } from "@/components/shared/CountdownBadge";
import {
  Server,
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
  HardDrive,
  FolderOpen,
  Download,
  Settings,
  Activity,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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

  const InfoItem = ({ icon: Icon, label, value, copyable = false }: { icon: React.ElementType; label: string; value: string; copyable?: boolean }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="text-sm font-medium bg-background px-2 py-1 rounded">{value}</code>
        {copyable && value !== "N/A" && <CopyButton text={value} className="h-7 w-7" />}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/hosting">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold">{service.domain}</h1>
              <StatusBadge status={service.status} />
            </div>
            <p className="text-muted-foreground">Service #{service.id}</p>
          </div>
          {service.panel_url && (
            <Button asChild className="gradient-primary hover:opacity-90 hidden sm:flex">
              <a href={service.panel_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open CyberPanel
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="actions" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Actions</span>
          </TabsTrigger>
          <TabsTrigger value="databases" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Databases</span>
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Emails</span>
          </TabsTrigger>
          <TabsTrigger value="ssl" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">SSL</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Service Information</CardTitle>
                <CardDescription>Your hosting account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoItem icon={Globe} label="Domain" value={service.domain} copyable />
                <InfoItem icon={Server} label="IP Address" value={service.ip || "N/A"} copyable />
                <InfoItem icon={User} label="Username" value={service.username || "N/A"} copyable />
                <InfoItem icon={ExternalLink} label="Panel URL" value={service.panel_url || "N/A"} copyable />
                {service.product && (
                  <InfoItem icon={HardDrive} label="Product" value={service.product} />
                )}
                {service.billingcycle && (
                  <InfoItem icon={CreditCard} label="Billing Cycle" value={service.billingcycle} />
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Renewal Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Next Renewal</CardTitle>
                </CardHeader>
                <CardContent>
                  {service.nextduedate ? (
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{service.nextduedate}</span>
                      <CountdownBadge date={service.nextduedate} />
                    </div>
                  ) : (
                    <p className="text-muted-foreground">N/A</p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {service.panel_url && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={service.panel_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        CyberPanel
                      </a>
                    </Button>
                  )}
                  {service.panel_url && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`${service.panel_url}/filemanager`} target="_blank" rel="noopener noreferrer">
                        <FolderOpen className="h-4 w-4 mr-2" />
                        File Manager
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={`https://billing.vintechdev.store/clientarea.php?action=productdetails&id=${service.id}`} target="_blank" rel="noopener noreferrer">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Billing Details
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your hosting account password</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={!isActive}>
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
                        {actionLoading === "changepassword" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Change Password
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Power Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Power className="h-4 w-4" />
                  Power Management
                </CardTitle>
                <CardDescription>Control your server state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {isSuspended ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAction("unsuspend")}
                    disabled={actionLoading === "unsuspend"}
                  >
                    {actionLoading === "unsuspend" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                    Unsuspend
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full text-yellow-600 hover:text-yellow-600"
                    onClick={() => handleAction("suspend")}
                    disabled={!isActive || actionLoading === "suspend"}
                  >
                    {actionLoading === "suspend" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Power className="h-4 w-4 mr-2" />}
                    Suspend
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAction("reboot")}
                  disabled={!isActive || actionLoading === "reboot"}
                >
                  {actionLoading === "reboot" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Reboot Server
                </Button>
              </CardContent>
            </Card>

            {/* WordPress Install */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  WordPress
                </CardTitle>
                <CardDescription>One-click WordPress installation</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleAction("installwp")}
                  disabled={!isActive || actionLoading === "installwp"}
                >
                  {actionLoading === "installwp" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                  Install WordPress
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Databases Tab */}
        <TabsContent value="databases" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>Create and manage MySQL databases through CyberPanel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Database management is available through CyberPanel
                </p>
                {service.panel_url && (
                  <Button asChild className="gradient-primary">
                    <a href={`${service.panel_url}/dataBases/listDatabases`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Databases in CyberPanel
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Management
              </CardTitle>
              <CardDescription>Create and manage email accounts through CyberPanel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Email management is available through CyberPanel
                </p>
                {service.panel_url && (
                  <Button asChild className="gradient-primary">
                    <a href={`${service.panel_url}/email/listEmails`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage Emails in CyberPanel
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SSL Tab */}
        <TabsContent value="ssl" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                SSL Certificates
              </CardTitle>
              <CardDescription>Manage SSL/TLS certificates through CyberPanel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  Issue free Let's Encrypt SSL certificates through CyberPanel
                </p>
                {service.panel_url && (
                  <Button asChild className="gradient-primary">
                    <a href={`${service.panel_url}/manageSSL/issueSSL`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage SSL in CyberPanel
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
