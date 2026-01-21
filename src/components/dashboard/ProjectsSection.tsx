import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/api";
import { 
  Server, 
  Plus, 
  ArrowRight, 
  Globe, 
  Clock, 
  ExternalLink,
  Cpu,
  Zap
} from "lucide-react";

interface ProjectCardProps {
  service: Service;
  index: number;
}

function ProjectCard({ service, index }: ProjectCardProps) {
  const isActive = service.status.toLowerCase() === "active";
  const isPending = service.status.toLowerCase() === "pending";
  
  // Calculate days until due
  const getDaysUntilDue = () => {
    if (!service.nextduedate) return null;
    const due = new Date(service.nextduedate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };
  
  const daysUntilDue = getDaysUntilDue();

  return (
    <Link 
      to={`/hosting/${service.id}`}
      className={cn(
        "group block animate-fade-in",
        `stagger-${Math.min(index + 1, 5)}`
      )}
      style={{ animationFillMode: 'backwards' }}
    >
      <Card className="h-full overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
        <CardContent className="p-0">
          {/* Header with gradient */}
          <div className="relative p-5 bg-gradient-to-br from-muted/80 to-muted/30">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                  isActive ? "bg-success/20 text-success" : isPending ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"
                )}>
                  <Server className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                    {service.domain}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.product || "Web Hosting"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={cn(
                  "flex h-2.5 w-2.5 rounded-full",
                  isActive ? "bg-success animate-pulse" : isPending ? "bg-warning" : "bg-muted-foreground"
                )} />
                <Badge variant={isActive ? "default" : isPending ? "secondary" : "outline"} className="text-xs">
                  {service.status}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Details */}
          <div className="p-5 space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              {service.ip && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{service.ip}</span>
                </div>
              )}
              {service.billingcycle && (
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground capitalize">{service.billingcycle}</span>
                </div>
              )}
            </div>
            
            {/* Due date warning */}
            {daysUntilDue !== null && (
              <div className={cn(
                "flex items-center gap-2 text-sm p-2 rounded-lg",
                daysUntilDue <= 7 ? "bg-warning/10 text-warning" : 
                daysUntilDue <= 30 ? "bg-muted" : "bg-muted/50"
              )}>
                <Clock className="h-4 w-4" />
                <span>
                  {daysUntilDue < 0 ? (
                    <span className="font-medium">Overdue</span>
                  ) : daysUntilDue === 0 ? (
                    <span className="font-medium">Due today</span>
                  ) : (
                    <>Due in <span className="font-medium">{daysUntilDue} days</span></>
                  )}
                </span>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <span>
                  <Cpu className="h-4 w-4 mr-1" />
                  Manage
                </span>
              </Button>
              {service.panel_url && (
                <Button variant="ghost" size="sm" asChild>
                  <a href={service.panel_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyProjectsState() {
  return (
    <Card className="border-dashed border-2 border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Server className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Plus className="h-4 w-4" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Launch Your First Project</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-6">
          Get your website online in minutes with our blazing-fast NVMe hosting and free SSL certificates.
        </p>
        
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" asChild>
            <Link to="/order">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/domains/search">
              Register Domain
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProjectsSectionProps {
  services: Service[];
}

export function ProjectsSection({ services }: ProjectsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <p className="text-sm text-muted-foreground">
            {services.length > 0 
              ? `${services.length} active hosting service${services.length > 1 ? "s" : ""}`
              : "No projects yet"
            }
          </p>
        </div>
        {services.length > 0 && (
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link to="/hosting">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {services.length === 0 ? (
        <EmptyProjectsState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.slice(0, 6).map((service, index) => (
            <ProjectCard key={service.id} service={service} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}