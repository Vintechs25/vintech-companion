import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { invoicesApi, type Invoice } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, AlertCircle, ExternalLink, CheckCircle, Clock } from "lucide-react";

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (isLoading) return <div className="space-y-6"><h1 className="text-3xl font-bold">Invoices</h1><Skeleton className="h-48 w-full" /></div>;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Invoices</h1>
      {invoices.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No invoices yet</p></CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Amount</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">#{inv.id}</TableCell>
                  <TableCell>${inv.amount}</TableCell>
                  <TableCell>{inv.duedate}</TableCell>
                  <TableCell><Badge className={inv.status.toLowerCase() === "paid" ? "bg-primary/20 text-primary" : "bg-yellow-500/20 text-yellow-600"}>{inv.status.toLowerCase() === "paid" ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}{inv.status}</Badge></TableCell>
                  <TableCell className="text-right">{inv.status.toLowerCase() !== "paid" && inv.pay_url && <Button size="sm" asChild><a href={inv.pay_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-1" />Pay Now</a></Button>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}
    </div>
  );
}