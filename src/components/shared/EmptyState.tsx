import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "default" | "outline" | "primary";
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild>
                <Link to={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
          {action && (
            action.href ? (
              <Button
                className={action.variant === "primary" ? "gradient-primary" : ""}
                variant={action.variant === "outline" ? "outline" : "default"}
                asChild
              >
                <Link to={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button
                className={action.variant === "primary" ? "gradient-primary" : ""}
                variant={action.variant === "outline" ? "outline" : "default"}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
