import { Link } from "react-router-dom";
import { Check, Sparkles, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WHMCS_CONFIG } from "@/lib/whmcs-config";

// These IDs map to WHMCS product keys: "basic", "pro", "enterprise"
// Make sure your WHMCS products have PIDs matching: basic=1, pro=2, enterprise=3
const plans = [
  {
    id: "basic", // WHMCS Key: basic, PID: 1
    name: "Starter",
    tagline: "For Personal Projects",
    description: "Perfect for portfolios, blogs, and personal websites",
    price: WHMCS_CONFIG.products.basic.monthlyPrice.toFixed(2),
    period: "/month",
    icon: Zap,
    features: [
      "1 Website",
      "10 GB NVMe SSD Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificate",
      "1 Email Account",
      "Weekly Backups",
      "CyberPanel Control",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    id: "pro", // WHMCS Key: pro, PID: 2
    name: "Professional",
    tagline: "Most Popular Choice",
    description: "Ideal for growing businesses and online stores",
    price: WHMCS_CONFIG.products.pro.monthlyPrice.toFixed(2),
    period: "/month",
    icon: Crown,
    features: [
      "Unlimited Websites",
      "50 GB NVMe SSD Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificates",
      "Unlimited Email Accounts",
      "Daily Backups",
      "CyberPanel Control",
      "Priority Support",
      "Free Domain (1 Year)",
    ],
    popular: true,
    cta: "Get Started Now",
  },
  {
    id: "enterprise", // WHMCS Key: enterprise, PID: 3
    name: "Business",
    tagline: "For High Traffic Sites",
    description: "Maximum power for agencies and enterprise",
    price: WHMCS_CONFIG.products.enterprise.monthlyPrice.toFixed(2),
    period: "/month",
    icon: Building2,
    features: [
      "Unlimited Websites",
      "200 GB NVMe SSD Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificates",
      "Unlimited Email Accounts",
      "Real-time Backups",
      "CyberPanel Control",
      "24/7 Priority Support",
      "Dedicated Resources",
      "Advanced Security Suite",
      "Free Domain (1 Year)",
    ],
    popular: false,
    cta: "Contact Sales",
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 relative bg-secondary/30">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Web Hosting Plans</span>
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Fast, Secure{" "}
            <span className="text-gradient">Web Hosting</span>
            <br />
            <span className="text-muted-foreground text-2xl md:text-3xl font-normal">
              Starting at just ${WHMCS_CONFIG.products.basic.monthlyPrice}/month
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Launch your website on lightning-fast NVMe servers with free SSL, daily backups, and 24/7 expert support. No technical skills required.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative border-2 transition-all duration-300 hover:-translate-y-2 overflow-hidden ${
                  plan.popular
                    ? "border-primary shadow-2xl shadow-primary/20 md:scale-105 z-10"
                    : "border-border/50 hover:border-primary/50 hover:shadow-xl"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 gradient-primary py-2 text-center">
                    <span className="text-primary-foreground text-sm font-semibold">
                      ⭐ {plan.tagline}
                    </span>
                  </div>
                )}

                <CardHeader className={`text-center pb-4 ${plan.popular ? "pt-14" : "pt-8"}`}>
                  {/* Plan Icon */}
                  <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    plan.popular 
                      ? "gradient-primary shadow-lg shadow-primary/30" 
                      : "bg-primary/10"
                  }`}>
                    <IconComponent className={`w-7 h-7 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </CardHeader>

                <CardContent className="text-center">
                  {/* Price */}
                  <div className="mb-6 py-4 border-y border-border/50">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-2xl text-muted-foreground">$</span>
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Billed monthly. Save 15% annually.
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.popular ? "bg-primary/20" : "bg-primary/10"
                        }`}>
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] ${
                      plan.popular
                        ? "gradient-primary border-0 hover:opacity-90 shadow-lg shadow-primary/25"
                        : "hover:bg-primary hover:text-primary-foreground"
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link to={`/hosting/order?plan=${plan.id}`}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* WHMCS Integration Note - Hidden from users, visible in code */}
        {/* 
          Frontend Product Keys for WHMCS:
          - "basic" → PID: 1
          - "pro" → PID: 2  
          - "enterprise" → PID: 3
          
          Configure these in src/lib/whmcs-config.ts
        */}

        {/* Trust Badges */}
        <div className="text-center mt-16 space-y-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <span className="text-lg">🔒</span>
              <span>Free SSL Included</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <span className="text-lg">💰</span>
              <span>30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <span className="text-lg">🚀</span>
              <span>99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <span className="text-lg">🎧</span>
              <span>24/7 Support</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70">
            All prices in USD. Cancel anytime. No setup fees.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
