import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { domainsApi, type Domain } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function Domains() {
  const { user } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDomains() {
      if (!user?.userid) return;
      try {
        const data = await domainsApi.getAll(user.userid);
        setDomains(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Failed to load domains");
      } finally {
        setIsLoading(false);
      }
    }
    fetchDomains();
  }, [user?.userid]);

  if (isLoading) return <div className="space-y-6"><h1 className="text-3xl font-bold">Domains</h1><Skeleton className="h-48 w-full" /></div>;
  if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Domains</h1>
      {domains.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Globe className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No domains registered</p></CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Domain</TableHead><TableHead>Status</TableHead><TableHead>Expiry</TableHead></TableRow></TableHeader>
            <TableBody>
              {domains.map((d) => (
                <TableRow key={d.id}><TableCell className="font-medium">{d.domain}</TableCell><TableCell><Badge variant="outline">{d.status}</Badge></TableCell><TableCell>{d.expirydate || "N/A"}</TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}
    </div>
  );
}