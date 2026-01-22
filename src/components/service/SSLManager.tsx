import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, ShieldCheck, ShieldX, Loader2, RefreshCw, Calendar, AlertTriangle } from "lucide-react";
import { getSSLStatus, issueSSL, type SSLStatus } from "@/lib/cyberpanel-api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SSLManagerProps {
  domain: string;
}

export function SSLManager({ domain }: SSLManagerProps) {
  const [sslStatus, setSslStatus] = useState<SSLStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIssuing, setIsIssuing] = useState(false);

  const fetchSSLStatus = async () => {
    setIsLoading(true);
    const result = await getSSLStatus(domain);
    if (result) {
      setSslStatus(result);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSSLStatus();
  }, [domain]);

  const handleIssueSSL = async () => {
    setIsIssuing(true);
    const result = await issueSSL(domain);
    
    if (result?.success) {
      toast({ title: "Success", description: "SSL certificate issued successfully" });
      fetchSSLStatus();
    } else {
      toast({ title: "Error", description: result?.message || "Failed to issue SSL", variant: "destructive" });
    }
    setIsIssuing(false);
  };

  const isExpiringSoon = () => {
    if (!sslStatus?.expiry) return false;
    const expiryDate = new Date(sslStatus.expiry);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
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
              <Shield className="h-5 w-5" />
              SSL Certificate
            </CardTitle>
            <CardDescription>Secure your website with HTTPS</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchSSLStatus}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "rounded-lg p-6 flex items-center gap-4",
          sslStatus?.issued ? "bg-success/10" : "bg-muted"
        )}>
          {sslStatus?.issued ? (
            <>
              <div className="h-14 w-14 rounded-full bg-success/20 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-success">SSL Active</h3>
                  <Badge variant="outline" className="text-success border-success">
                    Secured
                  </Badge>
                </div>
                {sslStatus.expiry && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Expires: {new Date(sslStatus.expiry).toLocaleDateString()}
                    </span>
                    {isExpiringSoon() && (
                      <Badge variant="secondary" className="gap-1 text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <Button onClick={handleIssueSSL} disabled={isIssuing}>
                {isIssuing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Renew SSL
              </Button>
            </>
          ) : (
            <>
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <ShieldX className="h-7 w-7 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">No SSL Certificate</h3>
                <p className="text-sm text-muted-foreground">
                  Your website is not secured with HTTPS
                </p>
              </div>
              <Button onClick={handleIssueSSL} disabled={isIssuing}>
                {isIssuing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2" />
                )}
                Issue Free SSL
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
