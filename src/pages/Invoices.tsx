import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { invoicesApi, type Invoice, WHMCS_BILLING_URL } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
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

  // Generate proper URLs
  const getInvoiceViewUrl = (invoiceId: number) => 
    `${WHMCS_BILLING_URL}/viewinvoice.php?id=${invoiceId}`;
  
  const getInvoicePdfUrl = (invoiceId: number) => 
    invoicesApi.downloadPdf(invoiceId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
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
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">View and pay your invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-3xl font-bold text-primary">${totalPaid.toFixed(2)}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-3xl font-bold text-yellow-600">${totalUnpaid.toFixed(2)}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-3xl font-bold">{invoices.length}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number or amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
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
        <Card className="border-border/50">
          <CardContent>
            <EmptyState
              icon={FileText}
              title="No invoices yet"
              description="Your billing history will appear here"
            />
          </CardContent>
        </Card>
      ) : filteredInvoices.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No invoices match your search</p>
            <Button variant="link" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const isUnpaid = invoice.status.toLowerCase() === "unpaid";
                  return (
                    <TableRow key={invoice.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-md shadow-primary/20">
                            <FileText className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <span className="font-medium">#{invoice.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.date || "N/A"}</TableCell>
                      <TableCell>{invoice.duedate}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-lg">${invoice.total}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={getInvoiceViewUrl(invoice.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={getInvoicePdfUrl(invoice.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </a>
                          </Button>
                          {isUnpaid && invoice.pay_url && (
                            <Button size="sm" className="gradient-primary shadow-lg shadow-primary/25" asChild>
                              <a href={invoice.pay_url} target="_blank" rel="noopener noreferrer">
                                <CreditCard className="h-4 w-4 mr-1" />
                                Pay Now
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
