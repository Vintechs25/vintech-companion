import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi, type DashboardData } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { QuickActionCard } from "@/components/shared/QuickActionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Server,
  Globe,
  FileText,
  MessageSquare,
  Plus,
  ArrowRight,
  AlertCircle,
  ShoppingCart,
  CreditCard,
  Headphones,
  Settings,
  Zap,
  TrendingUp,
} from "lucide-react";

function StatCard({
  title,
  value,
  total,
  icon: Icon,
  href,
  trend,
  color = "primary",
}: {
  title: string;
  value: number;
  total?: number;
  icon: React.ElementType;
  href: string;
  trend?: string;
  color?: "primary" | "yellow" | "destructive" | "blue";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    yellow: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
    destructive: "bg-destructive/10 text-destructive",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:border-primary/30 group hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{value}</span>
              {total !== undefined && (
                <span className="text-sm text-muted-foreground">/ {total}</span>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </div>
            )}
          </div>
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${colorClasses[color]} transition-transform group-hover:scale-110`}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
        <Link
          to={href}
          className="mt-4 text-sm text-primary hover:underline inline-flex items-center gap-1 group-hover:gap-2 transition-all font-medium"
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
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
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
  const activeServices = services.filter((s) => s.status.toLowerCase() === "active");
  const openTickets = tickets.filter((t) => t.status.toLowerCase() === "open" || t.status.toLowerCase() === "customer-reply");

  const quickActions = [
    { title: "Order Hosting", icon: ShoppingCart, href: "/order", variant: "primary" as const },
    { title: "Register Domain", icon: Globe, href: "/domains/search" },
    { title: "Pay Invoice", icon: CreditCard, href: "/invoices" },
    { title: "Open Ticket", icon: Headphones, href: "/tickets" },
    { title: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back{data?.user?.firstname ? `, ${data.user.firstname}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your hosting account today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/tickets">
              <Headphones className="h-4 w-4 mr-2" />
              Support
            </Link>
          </Button>
          <Button asChild className="gradient-primary hover:opacity-90 shadow-lg shadow-primary/25">
            <Link to="/order">
              <Plus className="h-4 w-4 mr-2" />
              New Hosting
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {unpaidInvoices.length > 0 && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-medium">
              You have {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length > 1 ? "s" : ""} totaling $
              {unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0).toFixed(2)}
            </span>
            <Button variant="outline" size="sm" asChild className="shrink-0">
              <Link to="/invoices">Pay Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Services"
          value={activeServices.length}
          total={services.length}
          icon={Server}
          href="/hosting"
          color="primary"
        />
        <StatCard
          title="Domains"
          value={domains.length}
          icon={Globe}
          href="/domains"
          color="blue"
        />
        <StatCard
          title="Unpaid Invoices"
          value={unpaidInvoices.length}
          icon={FileText}
          href="/invoices"
          color={unpaidInvoices.length > 0 ? "yellow" : "primary"}
        />
        <StatCard
          title="Open Tickets"
          value={openTickets.length}
          icon={MessageSquare}
          href="/tickets"
          color={openTickets.length > 0 ? "yellow" : "primary"}
        />
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks at your fingertips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.title}
                title={action.title}
                icon={action.icon}
                href={action.href}
                variant={action.variant}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Services */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Services</CardTitle>
              <CardDescription>Your hosting accounts</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/hosting">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <EmptyState
                icon={Server}
                title="No services yet"
                description="Get started by ordering your first hosting plan"
                action={{ label: "Order Hosting", href: "/order", variant: "primary" }}
              />
            ) : (
              <div className="space-y-3">
                {services.slice(0, 4).map((service) => (
                  <Link
                    key={service.id}
                    to={`/hosting/${service.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all group hover:shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <Server className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate group-hover:text-primary transition-colors">
                          {service.domain}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{service.product}</p>
                      </div>
                    </div>
                    <StatusBadge status={service.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Invoices</CardTitle>
              <CardDescription>Your billing history</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/invoices">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No invoices yet"
                description="Your billing history will appear here"
              />
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 4).map((invoice) => {
                  const isUnpaid = invoice.status.toLowerCase() === "unpaid";

                  return (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Invoice #{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">Due: {invoice.duedate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold">${invoice.total}</p>
                          <StatusBadge status={invoice.status} size="sm" />
                        </div>

                        {isUnpaid && invoice.pay_url && (
                          <Button
                            size="sm"
                            className="gradient-primary hover:opacity-90 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = invoice.pay_url;
                            }}
                          >
                            Pay
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Tickets */}
      {tickets.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Support Tickets</CardTitle>
              <CardDescription>Your recent support requests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tickets">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.slice(0, 3).map((ticket) => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all group hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {ticket.subject}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        #{ticket.id} · {ticket.lastreply || ticket.date || "N/A"}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={ticket.status} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
