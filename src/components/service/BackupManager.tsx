import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Archive, Plus, RotateCcw, Loader2, RefreshCw, HardDrive, Calendar } from "lucide-react";
import { listBackups, createBackup, restoreBackup, type Backup } from "@/lib/cyberpanel-api";
import { toast } from "@/hooks/use-toast";

interface BackupManagerProps {
  domain: string;
}

export function BackupManager({ domain }: BackupManagerProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null);

  const fetchBackups = async () => {
    setIsLoading(true);
    const result = await listBackups(domain);
    if (result) {
      setBackups(result.backups);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBackups();
  }, [domain]);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    const result = await createBackup(domain);
    
    if (result?.success) {
      toast({ title: "Success", description: "Backup started. This may take a few minutes." });
      setTimeout(fetchBackups, 5000); // Refresh after 5 seconds
    } else {
      toast({ title: "Error", description: result?.message || "Failed to create backup", variant: "destructive" });
    }
    setIsCreating(false);
  };

  const handleRestore = async (backupName: string) => {
    setRestoringBackup(backupName);
    const result = await restoreBackup(domain, backupName);
    
    if (result?.success) {
      toast({ title: "Success", description: "Restore started. This may take a few minutes." });
    } else {
      toast({ title: "Error", description: result?.message || "Failed to restore backup", variant: "destructive" });
    }
    setRestoringBackup(null);
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
              <Archive className="h-5 w-5" />
              Backups
            </CardTitle>
            <CardDescription>Backup and restore your website</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchBackups}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleCreateBackup} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Backup
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {backups.length === 0 ? (
          <div className="text-center py-8">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No backups yet</p>
            <p className="text-sm text-muted-foreground">Create your first backup</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Backup Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.name}>
                  <TableCell className="font-mono text-sm">{backup.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {backup.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <HardDrive className="h-3 w-3" />
                      {backup.size}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={restoringBackup === backup.name}
                        >
                          {restoringBackup === backup.name ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                          )}
                          Restore
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Restore Backup?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will restore your website to the state from {backup.date}. 
                            Current files and databases will be overwritten. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRestore(backup.name)}>
                            Restore Backup
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
