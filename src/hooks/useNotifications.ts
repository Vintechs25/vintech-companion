import { useEffect, useRef, useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi } from "@/lib/api";
import type { Invoice, Ticket, Domain } from "@/lib/api";
import { FileText, MessageCircle, Globe, AlertTriangle, Bell } from "lucide-react";

const STORAGE_KEYS = {
  SEEN_INVOICES: "vintech_seen_invoices",
  SEEN_TICKETS: "vintech_seen_tickets",
  SEEN_TICKET_REPLIES: "vintech_seen_ticket_replies",
  SEEN_DOMAIN_WARNINGS: "vintech_seen_domain_warnings",
  LAST_CHECK: "vintech_last_notification_check",
};

const POLL_INTERVAL = 60000; // Check every 60 seconds
const DOMAIN_EXPIRY_WARNING_DAYS = 30;

interface NotificationState {
  newInvoices: number;
  newTicketReplies: number;
  expiringDomains: number;
}

function getStoredSet(key: string): Set<string> {
  try {
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function storeSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // Ignore storage errors
  }
}

export function useNotifications() {
  const { user, isAuthenticated } = useAuth();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [notificationCount, setNotificationCount] = useState<NotificationState>({
    newInvoices: 0,
    newTicketReplies: 0,
    expiringDomains: 0,
  });

  const checkForNewItems = useCallback(async () => {
    if (!user?.userid) return;

    try {
      const data = await dashboardApi.get(user.userid);
      const invoices = data.invoices || [];
      const tickets = data.tickets || [];
      const domains = data.domains || [];

      // Check for new unpaid invoices
      const seenInvoices = getStoredSet(STORAGE_KEYS.SEEN_INVOICES);
      const unpaidInvoices = invoices.filter(
        (inv: Invoice) => inv.status.toLowerCase() === "unpaid"
      );
      
      let newInvoiceCount = 0;
      unpaidInvoices.forEach((invoice: Invoice) => {
        const invoiceKey = `${invoice.id}`;
        if (!seenInvoices.has(invoiceKey)) {
          newInvoiceCount++;
          seenInvoices.add(invoiceKey);
          
          toast.warning(`New Invoice #${invoice.id}`, {
            description: `KES ${parseFloat(invoice.total).toLocaleString()} due ${invoice.duedate}`,
            action: {
              label: "View",
              onClick: () => window.location.href = `/invoices/${invoice.id}`,
            },
            duration: 8000,
          });
        }
      });
      
      if (newInvoiceCount > 0) {
        storeSet(STORAGE_KEYS.SEEN_INVOICES, seenInvoices);
      }

      // Check for ticket replies (tickets with staff replies)
      const seenTicketReplies = getStoredSet(STORAGE_KEYS.SEEN_TICKET_REPLIES);
      const ticketsWithReplies = tickets.filter(
        (t: Ticket) => t.status.toLowerCase() === "answered"
      );
      
      let newReplyCount = 0;
      ticketsWithReplies.forEach((ticket: Ticket) => {
        const ticketKey = `${ticket.id}_${ticket.lastreply || ticket.status}`;
        if (!seenTicketReplies.has(ticketKey)) {
          newReplyCount++;
          seenTicketReplies.add(ticketKey);
          
          toast.info(`Ticket Reply: ${ticket.subject}`, {
            description: `Support has replied to ticket #${ticket.id}`,
            action: {
              label: "View",
              onClick: () => window.location.href = `/tickets/${ticket.id}`,
            },
            duration: 8000,
          });
        }
      });
      
      if (newReplyCount > 0) {
        storeSet(STORAGE_KEYS.SEEN_TICKET_REPLIES, seenTicketReplies);
      }

      // Check for domain expiry warnings
      const seenDomainWarnings = getStoredSet(STORAGE_KEYS.SEEN_DOMAIN_WARNINGS);
      const now = new Date();
      const expiringDomains = domains.filter((d: Domain) => {
        if (!d.expirydate) return false;
        const expiry = new Date(d.expirydate);
        const daysUntilExpiry = Math.ceil(
          (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry > 0 && daysUntilExpiry <= DOMAIN_EXPIRY_WARNING_DAYS;
      });

      let newDomainWarningCount = 0;
      expiringDomains.forEach((domain: Domain) => {
        const expiry = new Date(domain.expirydate!);
        const daysUntilExpiry = Math.ceil(
          (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // Create warning key based on domain and week threshold
        const weekThreshold = Math.floor(daysUntilExpiry / 7);
        const warningKey = `${domain.domain}_week_${weekThreshold}`;
        
        if (!seenDomainWarnings.has(warningKey)) {
          newDomainWarningCount++;
          seenDomainWarnings.add(warningKey);
          
          const urgency = daysUntilExpiry <= 7 ? "error" : "warning";
          const toastFn = urgency === "error" ? toast.error : toast.warning;
          
          toastFn(`Domain Expiring: ${domain.domain}`, {
            description: `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""} on ${domain.expirydate}`,
            action: {
              label: "Renew",
              onClick: () => window.location.href = "/domains",
            },
            duration: 10000,
          });
        }
      });
      
      if (newDomainWarningCount > 0) {
        storeSet(STORAGE_KEYS.SEEN_DOMAIN_WARNINGS, seenDomainWarnings);
      }

      // Update notification counts
      setNotificationCount({
        newInvoices: newInvoiceCount,
        newTicketReplies: newReplyCount,
        expiringDomains: newDomainWarningCount,
      });

      // Update last check time
      localStorage.setItem(STORAGE_KEYS.LAST_CHECK, Date.now().toString());
    } catch (error) {
      console.error("Notification check failed:", error);
    }
  }, [user?.userid]);

  // Initial check and polling setup
  useEffect(() => {
    if (!isAuthenticated || !user?.userid) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check immediately on mount
    const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_CHECK);
    const shouldCheckNow = !lastCheck || 
      Date.now() - parseInt(lastCheck) > POLL_INTERVAL;
    
    if (shouldCheckNow) {
      // Delay first check slightly to let dashboard load first
      const initialTimeout = setTimeout(checkForNewItems, 3000);
      
      return () => {
        clearTimeout(initialTimeout);
      };
    }
  }, [isAuthenticated, user?.userid, checkForNewItems]);

  // Set up polling interval
  useEffect(() => {
    if (!isAuthenticated || !user?.userid) return;

    intervalRef.current = setInterval(checkForNewItems, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated, user?.userid, checkForNewItems]);

  // Manual refresh function
  const refreshNotifications = useCallback(() => {
    checkForNewItems();
  }, [checkForNewItems]);

  // Clear all seen notifications (useful for testing)
  const clearSeenNotifications = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    setNotificationCount({
      newInvoices: 0,
      newTicketReplies: 0,
      expiringDomains: 0,
    });
  }, []);

  return {
    notificationCount,
    totalNotifications: 
      notificationCount.newInvoices + 
      notificationCount.newTicketReplies + 
      notificationCount.expiringDomains,
    refreshNotifications,
    clearSeenNotifications,
  };
}
