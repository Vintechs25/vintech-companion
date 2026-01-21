import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { invoicesApi, type Invoice, WHMCS_BILLING_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  FileText,
  AlertCircle,
  CreditCard,
  Download,
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      if (!id || !user?.userid) return;
      
      try {
        const data = await invoicesApi.getOne(parseInt(id));
        setInvoice(data);
      } catch (err) {
        setError("Failed to load invoice details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoice();
  }, [id, user?.userid]);

  const getPaymentUrl = (invoiceId: number) => 
    `${WHMCS_BILLING_URL}/viewinvoice.php?id=${invoiceId}`;

  const getPdfUrl = (invoiceId: number) => 
    invoicesApi.downloadPdf(invoiceId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/invoices")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Invoice not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isUnpaid = invoice.status.toLowerCase() === "unpaid";
  const isPaid = invoice.status.toLowerCase() === "paid";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate("/invoices")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </Button>

      {/* Invoice Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Invoice #{invoice.id}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  Created: {invoice.date || "—"}
                </CardDescription>
              </div>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invoice Details */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Due Date</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{invoice.duedate}</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Amount</p>
              <p className="text-2xl font-bold text-primary">${invoice.total}</p>
            </div>
          </div>

          <Separator />

          {/* Status Message */}
          {isPaid && (
            <Alert className="border-primary/30 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                This invoice has been paid. Thank you for your payment!
              </AlertDescription>
            </Alert>
          )}

          {isUnpaid && (
            <Alert className="border-destructive/30 bg-destructive/5">
              <Clock className="h-4 w-4 text-destructive" />
              <AlertDescription>
                This invoice is awaiting payment. Please complete payment before the due date.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isUnpaid && (
              <Button asChild className="flex-1 gradient-primary h-12 text-base">
                <a 
                  href={getPaymentUrl(invoice.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay Now
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              asChild 
              className={isUnpaid ? "flex-1 h-12" : "w-full h-12"}
            >
              <a 
                href={getPdfUrl(invoice.id)} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PDF
              </a>
            </Button>
          </div>

          <Separator />

          {/* View in Billing Portal */}
          <div className="text-center">
            <Button variant="link" asChild className="text-muted-foreground">
              <a 
                href={getPaymentUrl(invoice.id)} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                View full invoice in billing portal
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" asChild>
          <Link to="/invoices">View All Invoices</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/hosting">My Hosting</Link>
        </Button>
      </div>
    </div>
  );
}
