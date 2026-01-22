import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Check, X, ArrowRight, Globe, Shield, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { domainsApi, type DomainSearchResult } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTldPricing } from "@/hooks/useTldPricing";
import { z } from "zod";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const domainSchema = z.string()
  .min(1, "Please enter a domain name")
  .max(253, "Domain name is too long")
  .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})?$/, "Invalid domain format");

export default function DomainSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<DomainSearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pricing: tldPricing, isLoading: isPricingLoading } = useTldPricing();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean and validate domain
    let domain = searchTerm.trim().toLowerCase();
    
    // Remove http/https and www
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
    
    // If no TLD, we'll search with common ones
    const hasTld = domain.includes(".");
    
    const validation = domainSchema.safeParse(hasTld ? domain : `${domain}.com`);
    if (!validation.success) {
      toast({
        title: "Invalid Domain",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchResults = await domainsApi.search(domain);
      setResults(searchResults);
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Unable to check domain availability. Please try again.",
        variant: "destructive",
      });
      // Show mock results for demo
      setResults([
        { domain: `${domain}${hasTld ? "" : ".com"}`, available: true, price: "1500" },
        { domain: `${domain.split(".")[0]}.net`, available: true, price: "1800" },
        { domain: `${domain.split(".")[0]}.org`, available: false, price: "1600" },
        { domain: `${domain.split(".")[0]}.io`, available: true, price: "4500" },
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegister = (domain: string) => {
    navigate(`/domains/register?domain=${encodeURIComponent(domain)}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 gradient-dark opacity-5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full gradient-primary opacity-10 blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Find Your Perfect{" "}
                <span className="text-gradient">Domain Name</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-10">
                Search for available domains and secure your online identity today.
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your domain name (e.g., mywebsite.com)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  size="lg" 
                  className="gradient-primary h-14 px-8"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Search Results */}
        {hasSearched && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto space-y-4">
                {results.map((result) => (
                  <Card 
                    key={result.domain} 
                    className={`transition-all ${
                      result.available 
                        ? "border-primary/50 hover:border-primary" 
                        : "border-border/50 opacity-75"
                    }`}
                  >
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          result.available ? "bg-primary/10" : "bg-destructive/10"
                        }`}>
                          {result.available ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <X className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{result.domain}</p>
                          <p className="text-sm text-muted-foreground">
                            {result.available ? "Available" : "Taken"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {result.available && (
                          <>
                            <div className="text-right">
                              <p className="text-2xl font-bold">KES {parseFloat(result.price).toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">/year</p>
                            </div>
                            <Button 
                              onClick={() => handleRegister(result.domain)}
                              className="gradient-primary"
                            >
                              Register
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </>
                        )}
                        {!result.available && (
                          <Badge variant="secondary">Unavailable</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TLD Pricing */}
        {!hasSearched && (
          <section className="py-16 bg-secondary/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold mb-2">Domain Pricing</h2>
                <p className="text-muted-foreground">
                  {isPricingLoading ? "Loading latest prices..." : "Live prices from WHMCS"}
                </p>
              </div>
              
              {isPricingLoading ? (
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="text-center">
                      <CardContent className="pt-6">
                        <Skeleton className="h-6 w-12 mx-auto mb-2" />
                        <Skeleton className="h-8 w-20 mx-auto mb-1" />
                        <Skeleton className="h-4 w-10 mx-auto" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
                  {tldPricing.slice(0, 12).map((tld) => (
                    <Card key={tld.tld} className="text-center hover:border-primary/50 transition-colors">
                      <CardContent className="pt-6">
                        <p className="text-xl font-bold text-primary">{tld.tld}</p>
                        <p className="text-2xl font-bold mt-2">KES {parseFloat(tld.register).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">/year</p>
                        {tld.popular && (
                          <Badge className="mt-2" variant="secondary">Popular</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Transfer Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Already own a domain?</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Transfer your domain to Vintech Hosting and get extended registration plus free privacy protection.
                </p>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/domains/transfer">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Transfer Domain
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Free Privacy Protection</h3>
                <p className="text-sm text-muted-foreground">Keep your personal info private with free WHOIS privacy.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Easy DNS Management</h3>
                <p className="text-sm text-muted-foreground">Manage your DNS records easily through our control panel.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Auto-Renewal</h3>
                <p className="text-sm text-muted-foreground">Never lose your domain with automatic renewal.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
