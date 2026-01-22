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
import { Database, Plus, Trash2, Loader2, RefreshCw, HardDrive } from "lucide-react";
import { listDatabases, createDatabase, deleteDatabase, type Database as DBType } from "@/lib/cyberpanel-api";
import { toast } from "@/hooks/use-toast";

interface DatabaseManagerProps {
  domain: string;
}

export function DatabaseManager({ domain }: DatabaseManagerProps) {
  const [databases, setDatabases] = useState<DBType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingDb, setDeletingDb] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDb, setNewDb] = useState({ name: "", user: "", password: "" });

  const fetchDatabases = async () => {
    setIsLoading(true);
    const result = await listDatabases(domain);
    if (result) {
      setDatabases(result.databases);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDatabases();
  }, [domain]);

  const handleCreate = async () => {
    if (!newDb.name || !newDb.user || !newDb.password) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    const result = await createDatabase(domain, newDb.name, newDb.user, newDb.password);
    
    if (result?.success) {
      toast({ title: "Success", description: "Database created" });
      setDialogOpen(false);
      setNewDb({ name: "", user: "", password: "" });
      fetchDatabases();
    } else {
      toast({ title: "Error", description: result?.message || "Failed to create database", variant: "destructive" });
    }
    setIsCreating(false);
  };

  const handleDelete = async (dbName: string) => {
    setDeletingDb(dbName);
    const result = await deleteDatabase(dbName);
    
    if (result?.success) {
      toast({ title: "Success", description: "Database deleted" });
      fetchDatabases();
    } else {
      toast({ title: "Error", description: result?.message || "Failed to delete database", variant: "destructive" });
    }
    setDeletingDb(null);
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
            {[1, 2].map((i) => (
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
              <Database className="h-5 w-5" />
              MySQL Databases
            </CardTitle>
            <CardDescription>Manage databases for {domain}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchDatabases}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Database
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Database</DialogTitle>
                  <DialogDescription>
                    Create a new MySQL database for {domain}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Database Name</Label>
                    <Input
                      placeholder="my_database"
                      value={newDb.name}
                      onChange={(e) => setNewDb({ ...newDb, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Database User</Label>
                    <Input
                      placeholder="db_user"
                      value={newDb.user}
                      onChange={(e) => setNewDb({ ...newDb, user: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>User Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={newDb.password}
                      onChange={(e) => setNewDb({ ...newDb, password: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isCreating}>
                    {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Create Database
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {databases.length === 0 ? (
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No databases yet</p>
            <p className="text-sm text-muted-foreground">Create your first MySQL database</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Database Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {databases.map((db) => (
                <TableRow key={db.name}>
                  <TableCell className="font-mono text-sm">{db.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <HardDrive className="h-3 w-3" />
                      {db.size || "0 MB"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(db.name)}
                      disabled={deletingDb === db.name}
                      className="text-destructive hover:text-destructive"
                    >
                      {deletingDb === db.name ? (
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
