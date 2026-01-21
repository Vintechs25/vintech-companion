import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

interface WelcomeHeaderProps {
  firstname?: string;
  servicesCount: number;
  domainsCount: number;
}

export function WelcomeHeader({ firstname, servicesCount, domainsCount }: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 md:p-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            {getGreeting()}{firstname ? `, ${firstname}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground max-w-md">
            {servicesCount === 0 && domainsCount === 0 ? (
              "Welcome to Vintech Hosting. Let's get your first project online!"
            ) : (
              <>
                You have <span className="text-foreground font-medium">{servicesCount} project{servicesCount !== 1 ? "s" : ""}</span> and{" "}
                <span className="text-foreground font-medium">{domainsCount} domain{domainsCount !== 1 ? "s" : ""}</span> under management.
              </>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="shadow-lg shadow-primary/25" asChild>
            <Link to="/order">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/domains/search">
              Register Domain
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}