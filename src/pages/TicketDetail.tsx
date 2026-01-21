import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketsApi, type TicketDetail as TicketDetailType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, AlertCircle, Loader2, Send, User, Headphones } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTicket() {
      if (!id) return;
      try {
        const data = await ticketsApi.getOne(parseInt(id));
        setTicket(data);
      } catch (err) {
        setError("Failed to load ticket details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchTicket();
  }, [id]);

  const handleReply = async () => {
    if (!id || !reply.trim()) return;
    setSubmitting(true);
    try {
      await ticketsApi.reply(parseInt(id), reply);
      toast({ title: "Reply Sent", description: "Your reply has been submitted." });
      setReply("");
      const data = await ticketsApi.getOne(parseInt(id));
      setTicket(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (status: string) => {
    const s = status.toLowerCase();
    if (s === "open" || s === "customer-reply") return "warning";
    if (s === "answered") return "default";
    if (s === "closed") return "secondary";
    return "outline";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/tickets")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tickets
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Ticket not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/tickets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">Ticket #{ticket.id}</h1>
            <Badge variant={getStatusVariant(ticket.status) as any}>{ticket.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{ticket.subject}</p>
        </div>
      </div>

      {/* Ticket Info */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Department:</span>
            <span className="ml-2 font-medium">{ticket.department || "General"}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Opened:</span>
            <span className="ml-2 font-medium">{ticket.date || "—"}</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">Conversation</h2>
        
        {ticket.replies && ticket.replies.length > 0 ? (
          <div className="space-y-3">
            {ticket.replies.map((msg) => (
              <div 
                key={msg.id} 
                className={`rounded-lg border p-4 ${
                  msg.admin 
                    ? "border-primary/20 bg-primary/5" 
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.admin ? "bg-primary/10" : "bg-muted"
                  }`}>
                    {msg.admin ? (
                      <Headphones className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-sm font-medium">
                        {msg.admin ? (msg.name || "Support Team") : "You"}
                      </span>
                      <span className="text-xs text-muted-foreground">{msg.date}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-foreground/90">{msg.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">No messages yet</p>
          </div>
        )}
      </div>

      {/* Reply Form */}
      {ticket.status.toLowerCase() !== "closed" && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <h3 className="text-sm font-medium">Reply</h3>
          <Textarea
            placeholder="Type your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleReply}
              disabled={submitting || !reply.trim()}
              size="sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
