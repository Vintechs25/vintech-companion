import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Globe, Shield, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const transferSchema = z.object({
  domain: z.string()
    .min(1, "Domain is required")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/, "Invalid domain format"),
  eppCode: z.string().min(1, "EPP/Auth code is required").max(100),
});

export default function DomainTransfer() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [domain, setDomain] = useState("");
  const [eppCode, setEppCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = transferSchema.safeParse({ domain: domain.trim().toLowerCase(), eppCode: eppCode.trim() });
    if (!validation.success) {
      toast({
        title: "Invalid Input",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in or create an account to transfer a domain.",
        variant: "destructive",
      });
      navigate(`/login?redirect=${encodeURIComponent(`/domains/transfer`)}`);
      return;
    }

    setIsSubmitting(true);

    // Redirect to WHMCS transfer cart
    window.location.href = `https://billing.vintechdev.store/cart.php?a=add&domain=transfer&query=${encodeURIComponent(domain.trim().toLowerCase())}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/domains/search">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Domain Search
            </Link>
          </Button>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Transfer Your Domain</CardTitle>
                <CardDescription>
                  Move your domain to Vintech Hosting and get extended registration plus free privacy protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain Name</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="domain"
                        placeholder="example.com"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eppCode">EPP/Authorization Code</Label>
                    <Input
                      id="eppCode"
                      type="password"
                      placeholder="Enter your domain's transfer code"
                      value={eppCode}
                      onChange={(e) => setEppCode(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      You can get this code from your current domain registrar
                    </p>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Before transferring, ensure your domain is unlocked and not within 60 days of registration or previous transfer.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" className="w-full gradient-primary" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Processing..." : "Continue Transfer"}
                  </Button>
                </form>

                {/* Benefits */}
                <div className="mt-8 pt-6 border-t">
                  <h3 className="font-semibold mb-4">What you get with transfer:</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span>+1 year added to your registration</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <span>Free WHOIS privacy protection</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-primary" />
                      </div>
                      <span>Easy DNS management</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
