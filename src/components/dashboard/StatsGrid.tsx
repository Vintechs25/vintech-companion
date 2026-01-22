import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Server, 
  Globe, 
  FileText, 
  MessageCircle, 
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface StatItemProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  href: string;
  variant?: "default" | "success" | "warning" | "danger";
}

function StatCard({ title, value, subtitle, icon: Icon, href, variant = "default" }: StatItemProps) {
  const variantStyles = {
    default: {
      iconBg: "bg-muted",
      iconColor: "text-muted-foreground",
    },
    success: {
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    warning: {
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
    },
    danger: {
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    }
  };

  const styles = variantStyles[variant];

  return (
    <Link 
      to={href}
      className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-md hover:-translate-y-0.5"
    >
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", styles.iconBg)}>
        <Icon className={cn("h-5 w-5", styles.iconColor)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70 truncate">{subtitle}</p>
        )}
      </div>

      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </Link>
  );
}

interface StatsGridProps {
  services: number;
  domains: number;
  unpaidInvoices: number;
  unpaidTotal: number;
  openTickets: number;
}

export function StatsGrid({ services, domains, unpaidInvoices, unpaidTotal, openTickets }: StatsGridProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Projects"
        value={services}
        icon={Server}
        href="/hosting"
        variant={services > 0 ? "success" : "default"}
      />
      <StatCard
        title="Domains"
        value={domains}
        icon={Globe}
        href="/domains"
        variant={domains > 0 ? "success" : "default"}
      />
      <StatCard
        title="Outstanding"
        value={unpaidInvoices > 0 ? `KES ${unpaidTotal.toLocaleString()}` : "0"}
        subtitle={unpaidInvoices > 0 ? `${unpaidInvoices} invoice${unpaidInvoices > 1 ? "s" : ""} due` : "All paid"}
        icon={unpaidInvoices > 0 ? AlertTriangle : CheckCircle2}
        href="/invoices"
        variant={unpaidInvoices > 0 ? "warning" : "success"}
      />
      <StatCard
        title="Open Tickets"
        value={openTickets}
        subtitle={openTickets > 0 ? "Awaiting response" : "No open tickets"}
        icon={MessageCircle}
        href="/tickets"
        variant={openTickets > 0 ? "warning" : "default"}
      />
    </div>
  );
}