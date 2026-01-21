import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Server, 
  Globe, 
  FileText, 
  MessageCircle, 
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface StatItemProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ElementType;
  href: string;
  variant?: "default" | "success" | "warning" | "danger";
  trend?: { value: number; label: string };
}

function StatCard({ title, value, subtitle, icon: Icon, href, variant = "default", trend }: StatItemProps) {
  const variantStyles = {
    default: {
      bg: "bg-muted/50",
      iconBg: "bg-foreground/10",
      iconColor: "text-foreground",
      ring: "group-hover:ring-foreground/20"
    },
    success: {
      bg: "bg-success/10",
      iconBg: "bg-success/20",
      iconColor: "text-success",
      ring: "group-hover:ring-success/30"
    },
    warning: {
      bg: "bg-warning/10",
      iconBg: "bg-warning/20",
      iconColor: "text-warning",
      ring: "group-hover:ring-warning/30"
    },
    danger: {
      bg: "bg-destructive/10",
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
      ring: "group-hover:ring-destructive/30"
    }
  };

  const styles = variantStyles[variant];

  return (
    <Link 
      to={href}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/50 p-5 transition-all duration-300",
        "hover:border-border hover:shadow-lg hover:-translate-y-0.5",
        "ring-0 ring-transparent hover:ring-2",
        styles.ring
      )}
    >
      {/* Background gradient */}
      <div className={cn("absolute inset-0 opacity-30", styles.bg)} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", styles.iconBg)}>
            <Icon className={cn("h-5 w-5", styles.iconColor)} />
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground/70">{subtitle}</p>
          )}
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-success font-medium">+{trend.value}%</span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
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
        subtitle="Hosting services"
        icon={Server}
        href="/hosting"
        variant={services > 0 ? "success" : "default"}
      />
      <StatCard
        title="Domains"
        value={domains}
        subtitle="Registered domains"
        icon={Globe}
        href="/domains"
        variant={domains > 0 ? "success" : "default"}
      />
      <StatCard
        title="Unpaid Invoices"
        value={unpaidInvoices}
        subtitle={unpaidInvoices > 0 ? `KES ${unpaidTotal.toLocaleString()} due` : "All paid"}
        icon={unpaidInvoices > 0 ? AlertTriangle : CheckCircle2}
        href="/invoices"
        variant={unpaidInvoices > 0 ? "warning" : "success"}
      />
      <StatCard
        title="Support Tickets"
        value={openTickets}
        subtitle={openTickets > 0 ? "Awaiting response" : "No open tickets"}
        icon={MessageCircle}
        href="/tickets"
        variant={openTickets > 0 ? "warning" : "default"}
      />
    </div>
  );
}