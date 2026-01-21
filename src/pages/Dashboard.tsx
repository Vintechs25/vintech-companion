import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi } from "@/lib/api";
import type { Service, Domain, Invoice, Ticket } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

// Dashboard components
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { ProjectsSection } from "@/components/dashboard/ProjectsSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

interface DashboardData {
  user: { firstname: string; lastname: string; email: string };
  services: Service[];
  domains: Domain[];
  invoices: Invoice[];
  tickets: Ticket[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    if (!user?.userid) return;

    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await dashboardApi.get(user.userid);
      setData(dashboardData);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.userid]);

  if (isLoading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6 max-w-sm">{error}</p>
        <Button onClick={fetchDashboard} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const services = data?.services || [];
  const domains = data?.domains || [];
  const invoices = data?.invoices || [];
  const tickets = data?.tickets || [];
  
  const unpaidInvoices = invoices.filter((i) => i.status.toLowerCase() === "unpaid");
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0);
  const openTickets = tickets.filter(
    (t) => ["open", "customer-reply", "in progress"].includes(t.status.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header with gradient background */}
      <WelcomeHeader 
        firstname={data?.user?.firstname}
        servicesCount={services.length}
        domainsCount={domains.length}
      />

      {/* Unpaid Invoice Alert */}
      <AlertBanner unpaidCount={unpaidInvoices.length} unpaidTotal={unpaidTotal} />

      {/* Stats Grid */}
      <StatsGrid 
        services={services.length}
        domains={domains.length}
        unpaidInvoices={unpaidInvoices.length}
        unpaidTotal={unpaidTotal}
        openTickets={openTickets.length}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Projects Section */}
      <ProjectsSection services={services} />

      {/* Activity Feed - Invoices, Tickets, Domain Alerts */}
      <ActivityFeed 
        invoices={invoices}
        tickets={tickets}
        domains={domains}
      />
    </div>
  );
}