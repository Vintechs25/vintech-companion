import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface ViewToggleProps {
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center border rounded-lg p-1 bg-muted/50", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          view === "grid" && "bg-background shadow-sm"
        )}
        onClick={() => onViewChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 w-8 p-0",
          view === "list" && "bg-background shadow-sm"
        )}
        onClick={() => onViewChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
