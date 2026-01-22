import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, Plus, Trash2, Loader2, RefreshCw, HardDrive } from "lucide-react";
import { listEmails, createEmail, deleteEmail, type EmailAccount } from "@/lib/cyberpanel-api";
import { toast } from "@/hooks/use-toast";

interface EmailManagerProps {
  domain: string;
}

export function EmailManager({ domain }: EmailManagerProps) {
  const [emails, setEmails] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState({ username: "", password: "" });

  const fetchEmails = async () => {
    setIsLoading(true);
    const result = await listEmails(domain);
    if (result) {
      setEmails(result.emails);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmails();
  }, [domain]);

  const handleCreate = async () => {
    if (!newEmail.username || !newEmail.password) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    if (newEmail.password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    const result = await createEmail(domain, newEmail.username, newEmail.password);
    
    if (result?.success) {
      toast({ title: "Success", description: "Email account created" });
      setDialogOpen(false);
      setNewEmail({ username: "", password: "" });
      fetchEmails();
    } else {
      toast({ title: "Error", description: result?.message || "Failed to create email", variant: "destructive" });
    }
    setIsCreating(false);
  };

  const handleDelete = async (email: string) => {
    setDeletingEmail(email);
    const result = await deleteEmail(email);
    
    if (result?.success) {
      toast({ title: "Success", description: "Email account deleted" });
      fetchEmails();
    } else {
      toast({ title: "Error", description: result?.message || "Failed to delete email", variant: "destructive" });
    }
    setDeletingEmail(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Accounts
            </CardTitle>
            <CardDescription>Manage email accounts for {domain}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchEmails}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Email Account</DialogTitle>
                  <DialogDescription>
                    Create a new email account for {domain}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Email Username</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="username"
                        value={newEmail.username}
                        onChange={(e) => setNewEmail({ ...newEmail, username: e.target.value })}
                      />
                      <span className="text-muted-foreground whitespace-nowrap">@{domain}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter password (min 8 chars)"
                      value={newEmail.password}
                      onChange={(e) => setNewEmail({ ...newEmail, password: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Create Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {emails.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No email accounts yet</p>
            <p className="text-sm text-muted-foreground">Create your first email account</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email Address</TableHead>
                <TableHead>Disk Usage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.map((email) => (
                <TableRow key={email.email}>
                  <TableCell className="font-medium">{email.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <HardDrive className="h-3 w-3" />
                      {email.diskUsed || "0 MB"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(email.email)}
                      disabled={deletingEmail === email.email}
                      className="text-destructive hover:text-destructive"
                    >
                      {deletingEmail === email.email ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
