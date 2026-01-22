import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { FileText, MessageCircle, Globe, RefreshCw } from "lucide-react";

export function NotificationBell() {
  const { 
    notificationCount, 
    totalNotifications, 
    refreshNotifications 
  } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {totalNotifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] animate-pulse"
            >
              {totalNotifications > 9 ? "9+" : totalNotifications}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={(e) => {
              e.preventDefault();
              refreshNotifications();
            }}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {totalNotifications === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">All caught up!</p>
            <p className="text-xs">No new notifications</p>
          </div>
        ) : (
          <>
            {notificationCount.newInvoices > 0 && (
              <DropdownMenuItem 
                className="flex items-center gap-3 py-3 cursor-pointer"
                onClick={() => window.location.href = "/invoices"}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                  <FileText className="h-4 w-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New Invoices</p>
                  <p className="text-xs text-muted-foreground">
                    {notificationCount.newInvoices} unpaid invoice{notificationCount.newInvoices !== 1 ? "s" : ""}
                  </p>
                </div>
                <Badge variant="secondary">{notificationCount.newInvoices}</Badge>
              </DropdownMenuItem>
            )}
            
            {notificationCount.newTicketReplies > 0 && (
              <DropdownMenuItem 
                className="flex items-center gap-3 py-3 cursor-pointer"
                onClick={() => window.location.href = "/tickets"}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Ticket Replies</p>
                  <p className="text-xs text-muted-foreground">
                    {notificationCount.newTicketReplies} new repl{notificationCount.newTicketReplies !== 1 ? "ies" : "y"}
                  </p>
                </div>
                <Badge variant="secondary">{notificationCount.newTicketReplies}</Badge>
              </DropdownMenuItem>
            )}
            
            {notificationCount.expiringDomains > 0 && (
              <DropdownMenuItem 
                className="flex items-center gap-3 py-3 cursor-pointer"
                onClick={() => window.location.href = "/domains"}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                  <Globe className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Domain Expiring</p>
                  <p className="text-xs text-muted-foreground">
                    {notificationCount.expiringDomains} domain{notificationCount.expiringDomains !== 1 ? "s" : ""} expiring soon
                  </p>
                </div>
                <Badge variant="destructive">{notificationCount.expiringDomains}</Badge>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
