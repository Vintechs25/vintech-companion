import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowUp, Minus, ArrowDown } from "lucide-react";

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityLower = priority.toLowerCase();

  if (priorityLower === "urgent" || priorityLower === "high") {
    return (
      <Badge variant="destructive" className="bg-destructive/20 text-destructive border-0">
        <AlertCircle className="h-3 w-3 mr-1" />
        {priority}
      </Badge>
    );
  }

  if (priorityLower === "medium") {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 border-0">
        <Minus className="h-3 w-3 mr-1" />
        {priority}
      </Badge>
    );
  }

  if (priorityLower === "low") {
    return (
      <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-0">
        <ArrowDown className="h-3 w-3 mr-1" />
        {priority}
      </Badge>
    );
  }

  return <Badge variant="outline">{priority}</Badge>;
}
