import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Globe, 
  CreditCard, 
  MessageSquarePlus,
  Settings,
  RefreshCw,
  ArrowUpRight
} from "lucide-react";

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: "primary" | "success" | "warning" | "info";
}

function QuickActionCard({ title, description, icon: Icon, href, color }: QuickActionProps) {
  const colorStyles = {
    primary: "from-primary/20 to-primary/5 border-primary/20 hover:border-primary/40 text-primary",
    success: "from-success/20 to-success/5 border-success/20 hover:border-success/40 text-success",
    warning: "from-warning/20 to-warning/5 border-warning/20 hover:border-warning/40 text-warning",
    info: "from-blue-500/20 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40 text-blue-500",
  };

  return (
    <Link 
      to={href}
      className={cn(
        "group relative flex flex-col items-center justify-center p-5 rounded-xl border transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br",
        colorStyles[color]
      )}
    >
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl bg-background/80 mb-3 transition-transform group-hover:scale-110",
        colorStyles[color].split(" ")[4] // Get text color
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-medium text-foreground text-sm text-center">{title}</h3>
      <p className="text-xs text-muted-foreground text-center mt-1">{description}</p>
      
      <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

export function QuickActions() {
  const actions: QuickActionProps[] = [
    {
      title: "New Hosting",
      description: "Launch a new project",
      icon: Plus,
      href: "/order",
      color: "primary"
    },
    {
      title: "Register Domain",
      description: "Find your perfect domain",
      icon: Globe,
      href: "/domains/search",
      color: "success"
    },
    {
      title: "Pay Invoice",
      description: "View & pay invoices",
      icon: CreditCard,
      href: "/invoices",
      color: "warning"
    },
    {
      title: "Get Support",
      description: "Open a ticket",
      icon: MessageSquarePlus,
      href: "/tickets",
      color: "info"
    },
    {
      title: "Transfer Domain",
      description: "Move domain to us",
      icon: RefreshCw,
      href: "/domains/transfer",
      color: "primary"
    },
    {
      title: "Account Settings",
      description: "Manage your account",
      icon: Settings,
      href: "/settings",
      color: "info"
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">Common tasks at your fingertips</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </div>
    </div>
  );
}