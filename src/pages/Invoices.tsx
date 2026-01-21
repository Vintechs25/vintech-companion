import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { invoicesApi, type Invoice, WHMCS_BILLING_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  FileText,
  AlertCircle,
  Search,
  Clock,
  CheckCircle,
  CreditCard,
  Eye,
  Download,
  DollarSign,
} from "lucide-react";

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchInvoices() {
      if (!user?.userid) return;
      try {
        const data = await invoicesApi.getAll(user.userid);
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load invoices");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoices();
  }, [user?.userid]);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.id.toString().includes(searchQuery) ||
      invoice.total.includes(searchQuery);
    const matchesStatus =
      statusFilter === "all" || invoice.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const paidInvoices = invoices.filter((i) => i.status.toLowerCase() === "paid");
  const unpaidInvoices = invoices.filter((i) => i.status.toLowerCase() === "unpaid");
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0);
  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || "0"), 0);

  const getInvoiceViewUrl = (invoiceId: number) => 
    `${WHMCS_BILLING_URL}/viewinvoice.php?id=${invoiceId}`;
  
  const getInvoicePdfUrl = (invoiceId: number) => 
    invoicesApi.downloadPdf(invoiceId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">Loading invoices...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-7 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">View and pay your invoices</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">View and pay your invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-semibold text-foreground mt-1">${totalPaid.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-semibold text-foreground mt-1">${totalUnpaid.toFixed(2)}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <p className="text-2xl font-semibold text-foreground mt-1">{invoices.length}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-foreground/5 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-foreground/70" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px] h-9">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-12">
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Your billing history will appear here"
          />
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No invoices match your search</p>
          <Button variant="link" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="font-medium">Invoice</TableHead>
                <TableHead className="font-medium">Date</TableHead>
                <TableHead className="font-medium">Due Date</TableHead>
                <TableHead className="font-medium">Amount</TableHead>
                <TableHead className="font-medium">Status</TableHead>
                <TableHead className="text-right font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const isUnpaid = invoice.status.toLowerCase() === "unpaid";
                return (
                  <TableRow key={invoice.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-foreground/5 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-foreground/70" />
                        </div>
                        <span className="font-medium text-sm">#{invoice.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{invoice.date || "—"}</TableCell>
                    <TableCell className="text-sm">{invoice.duedate}</TableCell>
                    <TableCell>
                      <span className="font-semibold">${invoice.total}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                          <a
                            href={getInvoiceViewUrl(invoice.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                          <a
                            href={getInvoicePdfUrl(invoice.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        {isUnpaid && invoice.pay_url && (
                          <Button size="sm" className="h-8" asChild>
                            <a href={invoice.pay_url} target="_blank" rel="noopener noreferrer">
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
