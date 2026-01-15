import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "default";
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const statusLower = status.toLowerCase();
  const iconClass = size === "sm" ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1";

  if (statusLower === "active" || statusLower === "paid") {
    return (
      <Badge className="bg-primary/20 text-primary border-0 hover:bg-primary/30">
        <CheckCircle className={iconClass} />
        {status}
      </Badge>
    );
  }

  if (statusLower === "pending" || statusLower === "unpaid" || statusLower === "open" || statusLower === "customer-reply") {
    return (
      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 border-0 hover:bg-yellow-500/30">
        <Clock className={iconClass} />
        {status}
      </Badge>
    );
  }

  if (statusLower === "overdue") {
    return (
      <Badge variant="destructive" className="bg-orange-500/20 text-orange-600 dark:text-orange-500 border-0 hover:bg-orange-500/30">
        <AlertTriangle className={iconClass} />
        {status}
      </Badge>
    );
  }

  if (statusLower === "suspended" || statusLower === "cancelled" || statusLower === "terminated" || statusLower === "closed") {
    return (
      <Badge variant="destructive" className="bg-destructive/20 text-destructive border-0 hover:bg-destructive/30">
        <XCircle className={iconClass} />
        {status}
      </Badge>
    );
  }

  if (statusLower === "answered") {
    return (
      <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-0 hover:bg-blue-500/30">
        <CheckCircle className={iconClass} />
        {status}
      </Badge>
    );
  }

  return <Badge variant="outline">{status}</Badge>;
}
