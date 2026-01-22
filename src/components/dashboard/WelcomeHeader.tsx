import { Sparkles } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-primary uppercase tracking-wide">Dashboard</span>
        </div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {getGreeting()}{firstname ? `, ${firstname}` : ""}! 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {servicesCount === 0 && domainsCount === 0 ? (
            "Welcome to Vintech Hosting. Let's get your first project online!"
          ) : (
            <>
              Managing <span className="text-foreground font-medium">{servicesCount} project{servicesCount !== 1 ? "s" : ""}</span> and{" "}
              <span className="text-foreground font-medium">{domainsCount} domain{domainsCount !== 1 ? "s" : ""}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}