import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, CheckCircle } from "lucide-react";

const CTA = () => {
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
            <span className="text-sm font-medium text-primary-foreground">Launch Your Website Today</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-primary-foreground">
            Ready to Get Started?
          </h2>
          
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of happy customers and get your website online in minutes with Vintech Hosting.
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
              <Link to="/tickets">Contact Sales</Link>
            </Button>
          </div>

          <p className="text-primary-foreground/50 mt-8 text-sm">
            Starting at $4.99/month · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
