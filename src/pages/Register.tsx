import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWhmcsSso } from "@/hooks/useWhmcsSso";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Zap, AlertCircle, CheckCircle } from "lucide-react";
import { WHMCS_CONFIG } from "@/lib/whmcs-config";
import { RedirectOverlay } from "@/components/RedirectOverlay";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);
const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NL", name: "Netherlands" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "JP", name: "Japan" },
  { code: "PH", name: "Philippines" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { redirectToClientArea } = useWhmcsSso();
  
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [companyname, setCompanyname] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    // Redirect to WHMCS Google OAuth directly
    window.location.href = `${WHMCS_CONFIG.billingUrl}/login.php?oauth=google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!country) {
      setError("Please select a country");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("https://vintechdev.store/api/whmcs.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "AddClient",
          firstname,
          lastname,
          email,
          password2: password,
          phonenumber,
          companyname,
          address1,
          address2,
          city,
          state,
          postcode,
          country,
        }),
      });
      
      const data = await response.json();
      
      if (data.result === "success") {
        // Store session locally
        await login(email, password);
        
        // Show redirect overlay
        setIsRedirecting(true);
        
        // Use SSO to redirect to WHMCS client area
        const success = await redirectToClientArea(email);
        
        if (!success) {
          // If SSO fails, redirect to home
          setIsRedirecting(false);
          navigate("/");
        }
      } else {
        setError(data.message || data.error || "Registration failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Register error:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const benefits = [
    "Instant account activation",
    "30-day money-back guarantee",
    "Free SSL certificates",
    "24/7 expert support",
  ];

  return (
    <>
      {isRedirecting && <RedirectOverlay message="Creating your account..." />}
      <div className="min-h-screen flex">
      {/* Left side - Feature showcase */}
      <div className="hidden lg:flex flex-1 gradient-dark items-center justify-center p-12 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary opacity-20 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-accent opacity-15 blur-3xl" />
        
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Start Your Hosting Journey
          </h2>
          <p className="text-primary-foreground/80 mb-10 text-lg">
            Join thousands of customers who trust Vintech Hosting for their websites.
          </p>
          
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 text-primary-foreground">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-accent" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-primary/10 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <p className="text-primary-foreground/90 text-lg font-medium">
              "Vintech Hosting has been amazing for my business. Fast, reliable, and great support!"
            </p>
            <p className="text-primary-foreground/60 mt-3 text-sm">
              — Happy Customer
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="p-2 rounded-xl gradient-primary shadow-lg shadow-primary/25">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-gradient">Vintech Hosting</span>
          </div>

          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>
                Get started with Vintech Hosting today
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Personal Information */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Personal Information</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstname">First name *</Label>
                      <Input
                        id="firstname"
                        type="text"
                        placeholder="John"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastname">Last name *</Label>
                      <Input
                        id="lastname"
                        type="text"
                        placeholder="Doe"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phonenumber">Phone number *</Label>
                      <Input
                        id="phonenumber"
                        type="tel"
                        placeholder="+1234567890"
                        value={phonenumber}
                        onChange={(e) => setPhonenumber(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Billing Address</h3>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="companyname">Company name (Optional)</Label>
                    <Input
                      id="companyname"
                      type="text"
                      placeholder="Your company"
                      value={companyname}
                      onChange={(e) => setCompanyname(e.target.value)}
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address1">Street address *</Label>
                    <Input
                      id="address1"
                      type="text"
                      placeholder="123 Main Street"
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address2">Street address 2</Label>
                    <Input
                      id="address2"
                      type="text"
                      placeholder="Apt, suite, unit (optional)"
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      disabled={isLoading}
                      className="h-10"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="New York"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="state">State/Region *</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="NY"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="postcode">ZIP/Postal *</Label>
                      <Input
                        id="postcode"
                        type="text"
                        placeholder="10001"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={country} onValueChange={setCountry} disabled={isLoading}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border">
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Account Security */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Account Security</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-10"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Password must be at least 8 characters</p>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  type="submit" 
                  className="w-full gradient-primary hover:opacity-90 h-11 text-base shadow-lg shadow-primary/25"
                  disabled={isLoading || isRedirecting}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || isRedirecting}
                >
                  {isRedirecting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  <span className="ml-2">Continue with Google</span>
                </Button>
                
                <p className="text-sm text-muted-foreground text-center">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/" className="hover:text-primary transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
      </div>
    </>
  );
}
