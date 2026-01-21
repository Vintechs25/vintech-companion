import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";

const Hero = () => {
  const scrollToPricing = () => {
    const element = document.querySelector("#pricing");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-14">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-sm text-muted-foreground mb-8">
            <span className="flex h-2 w-2 rounded-full bg-success" />
            Enterprise-grade infrastructure
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-[1.1]">
            Premium Web Hosting
            <br />
            <span className="text-gradient">Made Simple</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Launch your website on blazing-fast NVMe servers with free SSL, automatic backups, and expert support — starting at just <strong className="text-foreground">$4.99/mo</strong>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Button size="lg" className="h-12 px-8" asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8" onClick={scrollToPricing}>
              View Pricing
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>NVMe SSD</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Free SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
