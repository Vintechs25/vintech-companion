import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Globe, Shield, Check, Wallet, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { domainsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const countries = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "JP", name: "Japan" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PL", name: "Poland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "IE", name: "Ireland" },
  { code: "NZ", name: "New Zealand" },
  { code: "ZA", name: "South Africa" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "PH", name: "Philippines" },
  { code: "MY", name: "Malaysia" },
  { code: "ID", name: "Indonesia" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "HK", name: "Hong Kong" },
  { code: "TW", name: "Taiwan" },
  { code: "RU", name: "Russia" },
  { code: "UA", name: "Ukraine" },
  { code: "TR", name: "Turkey" },
  { code: "EG", name: "Egypt" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
];

const paymentMethods = [
  { id: "paypal", name: "PayPal", icon: Wallet, description: "Pay securely with PayPal" },
  { id: "stripe", name: "Credit Card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
];

const registrantSchema = z.object({
  firstname: z.string().min(1, "First name is required").max(50),
  lastname: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email").max(255),
  phone: z.string().min(10, "Phone is required").max(20),
  address: z.string().min(1, "Address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  postcode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(2),
});

export default function DomainRegister() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const domain = searchParams.get("domain") || "";
  
  const [years, setYears] = useState("1");
  const [privacy, setPrivacy] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("paypal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "US",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
      }));
    }
  }, [user]);

  const basePrice = 12.99;
  const yearCount = parseInt(years);
  const totalPrice = (basePrice * yearCount).toFixed(2);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in or create an account to register a domain.",
        variant: "destructive",
      });
      navigate(`/login?redirect=${encodeURIComponent(`/domains/register?domain=${domain}`)}`);
      return;
    }

    const validation = registrantSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Missing Information",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await domainsApi.register({
        userid: user!.userid,
        domain,
        years: yearCount,
        privacy,
        paymentmethod: paymentMethod,
        registrant: formData,
      });

      console.log("Domain registration result:", result);

      if (result.result === "success" && result.pay_url) {
        window.location.href = result.pay_url;
      } else if (result.result === "success" && result.invoiceid) {
        // Redirect to invoice payment page
        window.location.href = `https://billing.vintechdev.store/viewinvoice.php?id=${result.invoiceid}`;
      } else if (result.result === "success") {
        toast({
          title: "Domain Registered!",
          description: `${domain} has been registered successfully.`,
        });
        navigate("/domains");
      } else {
        // Show error message instead of redirecting
        toast({
          title: "Registration Failed",
          description: result.message || result.error || "Unable to register domain. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Domain registration error:", error);
      toast({
        title: "Registration Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!domain) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No domain specified</p>
              <Button asChild>
                <Link to="/domains/search">Search for a Domain</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6" asChild>
            <Link to="/domains/search">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Registration Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Register {domain}</CardTitle>
                  <CardDescription>Complete your domain registration</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Registration Period */}
                    <div className="space-y-3">
                      <Label>Registration Period</Label>
                      <RadioGroup value={years} onValueChange={setYears} className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((y) => (
                          <div key={y}>
                            <RadioGroupItem value={y.toString()} id={`year-${y}`} className="peer sr-only" />
                            <Label
                              htmlFor={`year-${y}`}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <span className="text-2xl font-bold">{y}</span>
                              <span className="text-sm text-muted-foreground">year{y > 1 ? "s" : ""}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Privacy Protection */}
                    <div className="flex items-center space-x-3 p-4 rounded-lg border bg-secondary/30">
                      <Checkbox id="privacy" checked={privacy} onCheckedChange={(c) => setPrivacy(!!c)} />
                      <div className="flex-1">
                        <Label htmlFor="privacy" className="font-semibold cursor-pointer">
                          <Shield className="h-4 w-4 inline mr-2 text-primary" />
                          Free Privacy Protection
                        </Label>
                        <p className="text-sm text-muted-foreground">Hide your personal info from WHOIS lookups</p>
                      </div>
                      <span className="text-primary font-semibold">FREE</span>
                    </div>

                    {/* Registrant Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Registrant Information</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstname">First Name *</Label>
                          <Input id="firstname" name="firstname" value={formData.firstname} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastname">Last Name *</Label>
                          <Input id="lastname" name="lastname" value={formData.lastname} onChange={handleInputChange} required />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province *</Label>
                          <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="postcode">Postal Code *</Label>
                          <Input id="postcode" name="postcode" value={formData.postcode} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <Select 
                            value={formData.country} 
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, country: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                      <Label>Payment Method</Label>
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="grid md:grid-cols-2 gap-4"
                      >
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          const isSelected = paymentMethod === method.id;

                          return (
                            <div key={method.id}>
                              <RadioGroupItem value={method.id} id={`payment-${method.id}`} className="peer sr-only" />
                              <Label
                                htmlFor={`payment-${method.id}`}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent ${
                                  isSelected ? "border-primary bg-primary/5" : "border-muted"
                                }`}
                              >
                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                                  isSelected ? "gradient-primary" : "bg-primary/10"
                                }`}>
                                  <Icon className={`h-4 w-4 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{method.name}</p>
                                  <p className="text-xs text-muted-foreground">{method.description}</p>
                                </div>
                                {isSelected && <Check className="h-4 w-4 text-primary" />}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </div>

                    <Button type="submit" className="w-full gradient-primary" size="lg" disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : `Continue to Payment - $${totalPrice}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{domain}</span>
                    <span>${basePrice}/yr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period</span>
                    <span>{yearCount} year{yearCount > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between text-primary">
                    <span>Privacy Protection</span>
                    <span>FREE</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>

                  <div className="pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Free WHOIS Privacy</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Easy DNS Management</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Auto-Renewal Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
