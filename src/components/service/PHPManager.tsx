import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code, Loader2, RefreshCw, Check } from "lucide-react";
import { getPHPVersion, changePHPVersion } from "@/lib/cyberpanel-api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PHPManagerProps {
  domain: string;
}

const PHP_VERSIONS = [
  { value: "PHP 7.4", label: "PHP 7.4", eol: true },
  { value: "PHP 8.0", label: "PHP 8.0", eol: true },
  { value: "PHP 8.1", label: "PHP 8.1", eol: false },
  { value: "PHP 8.2", label: "PHP 8.2", eol: false },
  { value: "PHP 8.3", label: "PHP 8.3", eol: false, recommended: true },
];

export function PHPManager({ domain }: PHPManagerProps) {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChanging, setIsChanging] = useState(false);

  const fetchPHPVersion = async () => {
    setIsLoading(true);
    const result = await getPHPVersion(domain);
    if (result) {
      setCurrentVersion(result.phpVersion);
      setSelectedVersion(result.phpVersion);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPHPVersion();
  }, [domain]);

  const handleChange = async () => {
    if (!selectedVersion || selectedVersion === currentVersion) return;

    setIsChanging(true);
    const result = await changePHPVersion(domain, selectedVersion);
    
    if (result?.success) {
      toast({ title: "Success", description: `PHP version changed to ${selectedVersion}` });
      setCurrentVersion(selectedVersion);
    } else {
      toast({ title: "Error", description: result?.message || "Failed to change PHP version", variant: "destructive" });
      setSelectedVersion(currentVersion);
    }
    setIsChanging(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
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
              <Code className="h-5 w-5" />
              PHP Version
            </CardTitle>
            <CardDescription>Change PHP version for {domain}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchPHPVersion}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <Select
            value={selectedVersion || ""}
            onValueChange={setSelectedVersion}
            disabled={isChanging}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select PHP version" />
            </SelectTrigger>
            <SelectContent>
              {PHP_VERSIONS.map((version) => (
                <SelectItem key={version.value} value={version.value}>
                  <div className="flex items-center gap-2">
                    <span>{version.label}</span>
                    {version.recommended && (
                      <Badge variant="default" className="text-xs">Recommended</Badge>
                    )}
                    {version.eol && (
                      <Badge variant="secondary" className="text-xs text-warning">EOL</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleChange}
            disabled={isChanging || selectedVersion === currentVersion}
          >
            {isChanging ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : selectedVersion === currentVersion ? (
              <Check className="h-4 w-4 mr-2" />
            ) : null}
            {selectedVersion === currentVersion ? "Current" : "Apply"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Current version: <span className="font-medium">{currentVersion}</span>
        </p>
      </CardContent>
    </Card>
  );
}
