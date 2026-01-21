import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CreditCard, X } from "lucide-react";
import { useState } from "react";

interface AlertBannerProps {
  unpaidCount: number;
  unpaidTotal: number;
}

export function AlertBanner({ unpaidCount, unpaidTotal }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || unpaidCount === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-warning/20 via-warning/10 to-transparent border border-warning/30 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,200,0,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
      
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/20">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {unpaidCount} Unpaid Invoice{unpaidCount > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              Total outstanding: <span className="font-medium text-foreground">KES {unpaidTotal.toLocaleString()}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" className="bg-warning hover:bg-warning/90 text-warning-foreground" asChild>
            <Link to="/invoices">
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Now
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}