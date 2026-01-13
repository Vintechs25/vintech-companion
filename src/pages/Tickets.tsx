import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ticketsApi, type Ticket } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, AlertCircle, Plus, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTickets() {
      if (!user?.userid) return;
      try {
        const data = await ticketsApi.getAll(user.userid);
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load tickets");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, [user?.userid]);

  const handleSubmit = async () => {
    if (!user?.userid || !subject || !message) return;
    setSubmitting(true);
    try {
      await ticketsApi.open(user.userid, subject, message);
      toast({ title: "Ticket Created", description: "Your support ticket has been submitted." });
      setDialogOpen(false);
      setSubject("");
      setMessage("");
      const data = await ticketsApi.getAll(user.userid);
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: "Error", description: "Failed to create ticket", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="space-y-6"><h1 className="text-3xl font-bold">Support Tickets</h1><Skeleton className="h-48 w-full" /></div>;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Support Tickets</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button className="gradient-primary"><Plus className="h-4 w-4 mr-2" />New Ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Open Support Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description" /></div>
              <div className="space-y-2"><Label>Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue..." rows={5} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={submitting} className="gradient-primary">{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Submit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {tickets.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No support tickets</p></CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Last Reply</TableHead></TableRow></TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id}><TableCell>#{t.id}</TableCell><TableCell className="font-medium">{t.subject}</TableCell><TableCell><Badge variant="outline">{t.status}</Badge></TableCell><TableCell>{t.lastreply || "N/A"}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}
    </div>
  );
}