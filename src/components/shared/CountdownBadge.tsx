import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, XCircle } from "lucide-react";
import { differenceInDays, parseISO, isValid } from "date-fns";

interface CountdownBadgeProps {
  date: string | Date;
  label?: string;
}

export function CountdownBadge({ date, label = "Expires" }: CountdownBadgeProps) {
  const targetDate = typeof date === "string" ? parseISO(date) : date;
  
  if (!isValid(targetDate)) {
    return null;
  }

  const daysRemaining = differenceInDays(targetDate, new Date());

  if (daysRemaining < 0) {
    return (
      <Badge variant="destructive" className="bg-destructive/20 text-destructive border-0">
        <XCircle className="h-3 w-3 mr-1" />
        Expired
      </Badge>
    );
  }

  if (daysRemaining <= 7) {
    return (
      <Badge variant="destructive" className="bg-destructive/20 text-destructive border-0">
        <AlertTriangle className="h-3 w-3 mr-1" />
        {daysRemaining === 0 ? "Today" : `${daysRemaining}d left`}
      </Badge>
    );
  }

  if (daysRemaining <= 30) {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 border-0">
        <Clock className="h-3 w-3 mr-1" />
        {daysRemaining}d left
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      <Clock className="h-3 w-3 mr-1" />
      {daysRemaining}d left
    </Badge>
  );
}
