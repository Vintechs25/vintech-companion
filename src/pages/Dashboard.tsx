import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi } from "@/lib/api";
import type { Service, Domain, Invoice, Ticket } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  Server,
  Globe,
  FileText,
  MessageCircle,
  Plus,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  user: { firstname: string; lastname: string; email: string };
  services: Service[];
  domains: Domain[];
  invoices: Invoice[];
  tickets: Ticket[];
}

// Vercel-style stat card
function StatCard({
  title,
  value,
  icon: Icon,
  href,
  variant = "default",
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  href: string;
  variant?: "default" | "warning" | "success";
}) {
  return (
    <Link to={href}>
      <Card className="hover-lift cursor-pointer border-border/50 hover:border-primary/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  variant === "warning" && "bg-warning/10 text-warning",
                  variant === "success" && "bg-success/10 text-success",
                  variant === "default" && "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Project card - Vercel style
function ProjectCard({ service }: { service: Service }) {
  const isActive = service.status.toLowerCase() === "active";

  return (
    <Link to={`/hosting/${service.id}`}>
      <Card className="hover-lift cursor-pointer border-border/50 hover:border-primary/30 transition-all group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Server className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {service.domain}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {service.product || "Hosting"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isActive ? "bg-success" : "bg-muted-foreground"
                )}
              />
            </div>
          </div>

          {/* Quick info */}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            {service.ip && (
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {service.ip}
              </span>
            )}
            {service.nextduedate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {service.nextduedate}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>

      {/* Projects */}
      <div>
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
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
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboard();
  }, [user?.userid]);

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const services = data?.services || [];
  const domains = data?.domains || [];
  const invoices = data?.invoices || [];
  const tickets = data?.tickets || [];
  const unpaidInvoices = invoices.filter((i) => i.status.toLowerCase() === "unpaid");
  const openTickets = tickets.filter(
    (t) => t.status.toLowerCase() === "open" || t.status.toLowerCase() === "customer-reply"
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back{data?.user?.firstname ? `, ${data.user.firstname}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Manage your projects, domains, and billing.
          </p>
        </div>
        <Button asChild>
          <Link to="/order">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Alerts */}
      {unpaidInvoices.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium">
                  {unpaidInvoices.length} unpaid invoice
                  {unpaidInvoices.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total: KES {unpaidInvoices
                    .reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/invoices">View Invoices</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Projects"
          value={services.length}
          icon={Server}
          href="/hosting"
          variant="default"
        />
        <StatCard
          title="Domains"
          value={domains.length}
          icon={Globe}
          href="/domains"
          variant="default"
        />
        <StatCard
          title="Unpaid"
          value={unpaidInvoices.length}
          icon={FileText}
          href="/invoices"
          variant={unpaidInvoices.length > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Open Tickets"
          value={openTickets.length}
          icon={MessageCircle}
          href="/tickets"
          variant={openTickets.length > 0 ? "warning" : "default"}
        />
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Projects</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/hosting" className="gap-1">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {services.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <Server className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No projects yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Get started by creating your first project
              </p>
              <Button asChild>
                <Link to="/order">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <ProjectCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/invoices">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No invoices yet
              </p>
            ) : (
              <div className="space-y-2">
                {invoices.slice(0, 4).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">#{invoice.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.duedate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">KES {parseFloat(invoice.total).toLocaleString()}</span>
                      <StatusBadge status={invoice.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-medium">Support Tickets</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tickets">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No tickets
              </p>
            ) : (
              <div className="space-y-2">
                {tickets.slice(0, 4).map((ticket) => (
                  <Link
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors block"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {ticket.subject}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          #{ticket.id}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={ticket.status} size="sm" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
