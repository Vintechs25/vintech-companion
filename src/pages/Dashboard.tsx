import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, type DashboardData } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Server,
  Globe,
  FileText,
  MessageSquare,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const statusLower = status.toLowerCase();
  
  if (statusLower === "active" || statusLower === "paid") {
    return (
      <Badge className="bg-primary/20 text-primary border-0">
        <CheckCircle className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  }
  
  if (statusLower === "pending" || statusLower === "unpaid" || statusLower === "open") {
    return (
      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-0">
        <Clock className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  }
  
  if (statusLower === "suspended" || statusLower === "cancelled" || statusLower === "closed") {
    return (
      <Badge variant="destructive" className="bg-destructive/20 border-0">
        <XCircle className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  }
  
  return <Badge variant="outline">{status}</Badge>;
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  href: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <Link
          to={href}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!user?.userid) return;
      
      try {
        setIsLoading(true);
        const dashboardData = await dashboardApi.get(user.userid);
        setData(dashboardData);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, [user?.userid]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading your account overview...</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back!</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const services = data?.services || [];
  const domains = data?.domains || [];
  const invoices = data?.invoices || [];
  const tickets = data?.tickets || [];
  const unpaidInvoices = invoices.filter((i) => i.status.toLowerCase() === "unpaid");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{data?.user?.firstname ? `, ${data.user.firstname} ${data.user.lastname || ''}`.trim() : ""}!
          </p>
        </div>
        <Button asChild className="gradient-primary hover:opacity-90">
          <Link to="/order">
            <Plus className="h-4 w-4 mr-2" />
            New Hosting
          </Link>
        </Button>
      </div>

      {/* Unpaid Invoice Alert */}
      {unpaidInvoices.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              You have {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length > 1 ? "s" : ""}.
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/invoices">View Invoices</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Services"
          value={services.filter((s) => s.status.toLowerCase() === "active").length}
          icon={Server}
          href="/hosting"
        />
        <StatCard
          title="Domains"
          value={domains.length}
          icon={Globe}
          href="/domains"
        />
        <StatCard
          title="Unpaid Invoices"
          value={unpaidInvoices.length}
          icon={FileText}
          href="/invoices"
        />
        <StatCard
          title="Open Tickets"
          value={tickets.filter((t) => t.status.toLowerCase() === "open").length}
          icon={MessageSquare}
          href="/tickets"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Services</CardTitle>
            <CardDescription>Your hosting accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No services yet</p>
                <Button variant="link" asChild>
                  <Link to="/order">Order your first hosting</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {services.slice(0, 4).map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Server className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{service.domain}</p>
                        <p className="text-sm text-muted-foreground">{service.ip}</p>
                      </div>
                    </div>
                    <StatusBadge status={service.status} />
                  </div>
                ))}
                {services.length > 4 && (
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/hosting">
                      View all {services.length} services
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <CardDescription>Your billing history</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No invoices yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 4).map((invoice) => {
                  const isUnpaid = invoice.status.toLowerCase() === "unpaid";

                  return (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Invoice #{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">Due: {invoice.duedate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium">${invoice.total}</p>
                          <StatusBadge status={invoice.status} />
                        </div>

                        {isUnpaid && invoice.pay_url && (
                          <Button
                            size="sm"
                            className="gradient-primary hover:opacity-90"
                            onClick={() => {
                              window.location.href = invoice.pay_url;
                            }}
                          >
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {invoices.length > 4 && (
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/invoices">
                      View all invoices
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
