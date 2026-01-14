import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { domainsApi, type Domain } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Globe, AlertCircle, Plus, RefreshCw, ExternalLink } from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Domains</h1>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Domains</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/domains/transfer">
              <RefreshCw className="h-4 w-4 mr-2" />
              Transfer
            </Link>
          </Button>
          <Button className="gradient-primary" asChild>
            <Link to="/domains/search">
              <Plus className="h-4 w-4 mr-2" />
              Register Domain
            </Link>
          </Button>
        </div>
      </div>

      {domains.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No domains registered yet</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" asChild>
                <Link to="/domains/transfer">Transfer Domain</Link>
              </Button>
              <Button className="gradient-primary" asChild>
                <Link to="/domains/search">Search & Register</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.domain}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === "Active" ? "default" : "secondary"}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.registrationdate || "N/A"}</TableCell>
                    <TableCell>{d.expirydate || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`https://billing.vintechdev.store/clientarea.php?action=domaindetails&domainid=${d.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Manage
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}