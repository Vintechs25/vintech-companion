import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Invoice, Ticket, Domain } from "@/lib/api";
import { 
  FileText, 
  Globe,
  ArrowRight,
  AlertTriangle,
  CreditCard
} from "lucide-react";

interface ActivityFeedProps {
  invoices: Invoice[];
  tickets: Ticket[];
  domains: Domain[];
}

export function ActivityFeed({ invoices, tickets, domains }: ActivityFeedProps) {
  // Get domains expiring soon (within 14 days - more critical)
  const expiringDomains = domains.filter(d => {
    if (!d.expirydate) return false;
    const expiry = new Date(d.expirydate);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 14 && diff > 0;
  });

  // Only show if there are unpaid invoices, expiring domains, or open tickets
  const hasAlerts = invoices.length > 0 || expiringDomains.length > 0 || tickets.length > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Unpaid Invoices - Primary Alert */}
      {invoices.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/20">
                  <CreditCard className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Payment Required</CardTitle>
                  <p className="text-xs text-muted-foreground">{invoices.length} unpaid invoice{invoices.length > 1 ? "s" : ""}</p>
                </div>
              </div>
              <Button size="sm" variant="default" asChild>
                <Link to="/invoices">
                  Pay Now
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {invoices.slice(0, 3).map((invoice) => (
                <Link
                  key={invoice.id}
                  to={`/invoices/${invoice.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/80 hover:bg-background transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Invoice #{invoice.id}</span>
                    <span className="text-xs text-muted-foreground">Due {invoice.duedate}</span>
                  </div>
                  <span className="font-semibold text-sm tabular-nums">
                    KES {parseFloat(invoice.total).toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain Expiry Alerts */}
      {expiringDomains.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/20">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Domains Expiring</CardTitle>
                  <p className="text-xs text-muted-foreground">{expiringDomains.length} domain{expiringDomains.length > 1 ? "s" : ""} need renewal</p>
                </div>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to="/domains">
                  Renew
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {expiringDomains.slice(0, 3).map((domain) => {
                const expiry = new Date(domain.expirydate!);
                const now = new Date();
                const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div 
                    key={domain.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/80"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-destructive" />
                      <span className="font-medium text-sm">{domain.domain}</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {days} days left
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}