import { cn } from "@/lib/utils";

interface ResourceBarProps {
  label: string;
  used: number;
  total: number;
  unit?: string;
  className?: string;
}

export function ResourceBar({ label, used, total, unit = "GB", className }: ResourceBarProps) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  
  const getBarColor = () => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-primary";
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {used.toFixed(1)} / {total} {unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
