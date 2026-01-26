import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, CheckCircle, ExternalLink, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWhmcsSso } from "@/hooks/useWhmcsSso";
import { WHMCS_CONFIG } from "@/lib/whmcs-config";

const CTA = () => {
  const { isAuthenticated, user } = useAuth();
  const { redirectToClientArea, isLoading: ssoLoading } = useWhmcsSso();

  const handleClientAreaClick = async () => {
    if (user?.email) {
      await redirectToClientArea(user.email, user.userid);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-dark" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-primary opacity-20 blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-accent opacity-15 blur-3xl animate-pulse-glow" style={{ animationDelay: "-1s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-8">
            <Rocket className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">
              {isAuthenticated ? "Manage Your Services" : "Launch Your Website Today"}
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-primary-foreground">
            {isAuthenticated ? "Welcome Back!" : "Ready to Get Started?"}
          </h2>
          
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {isAuthenticated 
              ? "Access your dashboard to manage your hosting, domains, and support tickets."
              : "Join thousands of happy customers and get your website online in minutes with Vintech Hosting."}
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>30-Day Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/90">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>24/7 Support</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <>
                <Button 
                  size="lg" 
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-6 h-auto shadow-xl transition-all hover:scale-105"
                  onClick={handleClientAreaClick}
                  disabled={ssoLoading}
                >
                  {ssoLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-5 h-5 mr-2" />
                  )}
                  Go to Client Area
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6 h-auto"
                  asChild
                >
                  <a href={`${WHMCS_CONFIG.billingUrl}/cart.php?a=add&pid=1`} target="_blank" rel="noopener noreferrer">
                    <Plus className="w-5 h-5 mr-2" />
                    Order Hosting
                  </a>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8 py-6 h-auto shadow-xl transition-all hover:scale-105"
                  asChild
                >
                  <Link to="/register">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-lg px-8 py-6 h-auto"
                  asChild
                >
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </>
            )}
          </div>

          <p className="text-primary-foreground/50 mt-8 text-sm">
            {isAuthenticated 
              ? "Need help? Contact our 24/7 support team"
              : "Starting at KES 167/month · Cancel anytime"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;