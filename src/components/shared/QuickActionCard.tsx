import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  external?: boolean;
  variant?: "default" | "primary" | "muted";
  className?: string;
}

export function QuickActionCard({
  title,
  icon: Icon,
  href,
  onClick,
  external,
  variant = "default",
  className,
}: QuickActionCardProps) {
  const baseClasses = cn(
    "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all cursor-pointer group min-h-[100px]",
    variant === "default" && "bg-muted/50 hover:bg-muted border border-border hover:border-primary/30",
    variant === "primary" && "gradient-primary text-primary-foreground hover:opacity-90",
    variant === "muted" && "bg-card hover:bg-muted border border-border",
    className
  );

  const iconClasses = cn(
    "h-6 w-6 transition-transform group-hover:scale-110",
    variant === "primary" ? "text-primary-foreground" : "text-primary"
  );

  const textClasses = cn(
    "text-sm font-medium text-center",
    variant === "primary" ? "text-primary-foreground" : "text-foreground"
  );

  if (external && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        <Icon className={iconClasses} />
        <span className={textClasses}>{title}</span>
      </a>
    );
  }

  if (href) {
    return (
      <Link to={href} className={baseClasses}>
        <Icon className={iconClasses} />
        <span className={textClasses}>{title}</span>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={baseClasses}>
      <Icon className={iconClasses} />
      <span className={textClasses}>{title}</span>
    </button>
  );
}
