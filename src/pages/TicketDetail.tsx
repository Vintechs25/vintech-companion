import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ticketsApi, type TicketDetail as TicketDetailType } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      // Refresh ticket data
      const data = await ticketsApi.getOne(parseInt(id));
      setTicket(data);
    } catch (err) {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/tickets")}>
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

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === "open") return "bg-yellow-500/20 text-yellow-600";
    if (s === "answered") return "bg-primary/20 text-primary";
    if (s === "closed") return "bg-muted text-muted-foreground";
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tickets")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Ticket #{ticket.id}</h1>
          <p className="text-muted-foreground">{ticket.subject}</p>
        </div>
        <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
      </div>

      {/* Ticket Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Department: {ticket.department || "General"}</span>
            <span>Opened: {ticket.date || "N/A"}</span>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Conversation</h2>
        
        {ticket.replies && ticket.replies.length > 0 ? (
          ticket.replies.map((msg) => (
            <Card key={msg.id} className={msg.admin ? "border-primary/30 bg-primary/5" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    msg.admin ? "bg-primary/20" : "bg-muted"
                  }`}>
                    {msg.admin ? (
                      <Headphones className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {msg.admin ? (msg.name || "Support Team") : "You"}
                      </span>
                      <span className="text-sm text-muted-foreground">{msg.date}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No messages yet
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply Form */}
      {ticket.status.toLowerCase() !== "closed" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Reply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleReply}
                disabled={submitting || !reply.trim()}
                className="gradient-primary"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
