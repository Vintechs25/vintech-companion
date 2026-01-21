import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";
import type { Invoice, Ticket, Domain } from "@/lib/api";
import { 
  FileText, 
  MessageCircle, 
  Globe,
  ArrowRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from "lucide-react";

interface ActivityFeedProps {
  invoices: Invoice[];
  tickets: Ticket[];
  domains: Domain[];
}

export function ActivityFeed({ invoices, tickets, domains }: ActivityFeedProps) {
  // Get domains expiring soon (within 30 days)
  const expiringDomains = domains.filter(d => {
    if (!d.expirydate) return false;
    const expiry = new Date(d.expirydate);
    const now = new Date();
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 30 && diff > 0;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Invoices */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">Recent Invoices</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link to="/invoices">
              View all
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-10 w-10 text-success/50 mb-3" />
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {invoices.slice(0, 5).map((invoice) => {
                const isUnpaid = invoice.status.toLowerCase() === "unpaid";
                return (
                  <Link
                    key={invoice.id}
                    to={`/invoices/${invoice.id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        isUnpaid ? "bg-warning/10" : "bg-success/10"
                      )}>
                        <FileText className={cn(
                          "h-5 w-5",
                          isUnpaid ? "text-warning" : "text-success"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                          Invoice #{invoice.id}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{invoice.duedate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums">
                        KES {parseFloat(invoice.total).toLocaleString()}
                      </span>
                      <StatusBadge status={invoice.status} size="sm" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Tickets & Domain Alerts */}
      <div className="space-y-6">
        {/* Domain Expiry Alerts */}
        {expiringDomains.length > 0 && (
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Domain Expiring Soon</CardTitle>
                  <p className="text-xs text-muted-foreground">{expiringDomains.length} domain{expiringDomains.length > 1 ? "s" : ""} need attention</p>
                </div>
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
                        <Globe className="h-4 w-4 text-warning" />
                        <span className="font-medium text-sm">{domain.domain}</span>
                      </div>
                      <Badge variant="outline" className="text-warning border-warning/30">
                        {days} days left
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                <Link to="/domains">
                  Manage Domains
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Support Tickets */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold">Support Tickets</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link to="/tickets">
                View all
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {tickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-success/50 mb-3" />
                <p className="text-sm text-muted-foreground">No support tickets</p>
                <Button variant="link" size="sm" className="mt-2" asChild>
                  <Link to="/tickets">Open a ticket</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {tickets.slice(0, 4).map((ticket) => {
                  const isOpen = ["open", "customer-reply", "in progress"].includes(ticket.status.toLowerCase());
                  return (
                    <Link
                      key={ticket.id}
                      to={`/tickets/${ticket.id}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                          isOpen ? "bg-warning/10" : "bg-muted"
                        )}>
                          <MessageCircle className={cn(
                            "h-5 w-5",
                            isOpen ? "text-warning" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                            {ticket.subject}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>#{ticket.id}</span>
                            {ticket.department && (
                              <>
                                <span>•</span>
                                <span>{ticket.department}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={ticket.status} size="sm" />
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}