import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, Zap, AlertCircle, Shield, Clock } from "lucide-react";
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    // Redirect to WHMCS Google OAuth directly
    window.location.href = `${WHMCS_CONFIG.billingUrl}/login.php?oauth=google`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      // Show redirect overlay
      setIsRedirecting(true);
      
      // Small delay for visual feedback before redirect
      setTimeout(() => {
        // Redirect to WHMCS login with auto-login via dologin action
        // This establishes a proper WHMCS session
        const form = document.createElement("form");
        form.method = "POST";
        form.action = `${WHMCS_CONFIG.billingUrl}/dologin.php`;
        
        const emailField = document.createElement("input");
        emailField.type = "hidden";
        emailField.name = "username";
        emailField.value = email;
        form.appendChild(emailField);
        
        const passwordField = document.createElement("input");
        passwordField.type = "hidden";
        passwordField.name = "password";
        passwordField.value = password;
        form.appendChild(passwordField);
        
        document.body.appendChild(form);
        form.submit();
      }, 500);
    } else {
      setError(result.error || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <>
      {isRedirecting && <RedirectOverlay message="Signing you in..." />}
      <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="p-2 rounded-xl gradient-primary shadow-lg shadow-primary/25">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-gradient">Vintech Hosting</span>
          </div>

          <Card className="border-border/50 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Sign in to your account to continue
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
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link 
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
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
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
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
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Sign up
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

      {/* Right side - Feature showcase */}
      <div className="hidden lg:flex flex-1 gradient-dark items-center justify-center p-12 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary opacity-20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent opacity-15 blur-3xl" />
        
        <div className="relative z-10 max-w-md text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-6">
            Manage Your Hosting
          </h2>
          <p className="text-primary-foreground/80 mb-10 text-lg">
            Access your websites, domains, invoices, and support all from one dashboard.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-primary/10 rounded-xl p-4 backdrop-blur-sm border border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-primary-foreground">Lightning Fast</p>
                <p className="text-sm text-primary-foreground/70">NVMe SSD powered hosting</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-primary/10 rounded-xl p-4 backdrop-blur-sm border border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-primary-foreground">Secure & Reliable</p>
                <p className="text-sm text-primary-foreground/70">Free SSL & daily backups</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-primary/10 rounded-xl p-4 backdrop-blur-sm border border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-primary-foreground">24/7 Support</p>
                <p className="text-sm text-primary-foreground/70">Expert help when you need it</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
