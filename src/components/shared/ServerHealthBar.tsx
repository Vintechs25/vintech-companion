import { cn } from "@/lib/utils";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";

interface ServerHealthBarProps {
  cpu: number;
  ram: number;
  disk: number;
  compact?: boolean;
  showLabels?: boolean;
}

function getUsageColor(value: number): string {
  if (value < 50) return "bg-success";
  if (value < 75) return "bg-warning";
  return "bg-destructive";
}

function getUsageTextColor(value: number): string {
  if (value < 50) return "text-success";
  if (value < 75) return "text-warning";
  return "text-destructive";
}

export function ServerHealthBar({ cpu, ram, disk, compact = false, showLabels = true }: ServerHealthBarProps) {
  const metrics = [
    { label: "CPU", value: cpu, icon: Cpu },
    { label: "RAM", value: ram, icon: MemoryStick },
    { label: "Disk", value: disk, icon: HardDrive },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon className={cn("h-3 w-3", getUsageTextColor(value))} />
            <span className={cn("text-xs font-medium tabular-nums", getUsageTextColor(value))}>
              {Math.round(value)}%
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {metrics.map(({ label, value, icon: Icon }) => (
        <div key={label} className="space-y-1">
          {showLabels && (
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="h-3 w-3" />
                {label}
              </span>
              <span className={cn("font-medium tabular-nums", getUsageTextColor(value))}>
                {Math.round(value)}%
              </span>
            </div>
          )}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", getUsageColor(value))}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}