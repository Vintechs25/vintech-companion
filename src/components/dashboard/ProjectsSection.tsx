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
  Clock,
  ChevronRight
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
      <Card className="h-full overflow-hidden border-border/50 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="relative">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isActive ? "bg-success/10 text-success" : isPending ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
              )}>
                <Server className="h-5 w-5" />
              </div>
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                isActive ? "bg-success" : isPending ? "bg-warning" : "bg-muted-foreground"
              )} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                  {service.domain}
                </h3>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {service.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="truncate">{service.product || "Hosting"}</span>
                {daysUntilDue !== null && daysUntilDue <= 14 && (
                  <>
                    <span>·</span>
                    <span className={cn(
                      "flex items-center gap-1 shrink-0",
                      daysUntilDue <= 7 ? "text-warning" : ""
                    )}>
                      <Clock className="h-3 w-3" />
                      {daysUntilDue < 0 ? "Overdue" : `${daysUntilDue}d`}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyProjectsState() {
  return (
    <Card className="border-dashed border-2 border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4">
        <div className="relative mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Server className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Plus className="h-3 w-3" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Launch Your First Project</h3>
        <p className="text-muted-foreground text-center max-w-sm mb-6 text-sm">
          Get your website online in minutes with blazing-fast hosting and free SSL.
        </p>
        
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild>
            <Link to="/order">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Link>
          </Button>
          <Button variant="outline" asChild>
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
          <h2 className="text-lg font-semibold">Your Projects</h2>
          <p className="text-sm text-muted-foreground">
            {services.length > 0 
              ? `${services.length} active service${services.length > 1 ? "s" : ""}`
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {services.slice(0, 6).map((service, index) => (
            <ProjectCard key={service.id} service={service} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}