import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WHMCS_CONFIG, formatPrice, getMonthlyEquivalent } from "@/lib/whmcs-config";

// Plan configuration with icons
const planConfig = {
  basic: {
    icon: Zap,
    cta: "Get Started",
  },
  pro: {
    icon: Crown,
    cta: "Get Started",
    popular: true,
  },
  enterprise: {
    icon: Building2,
    cta: "Get Started",
  },
};

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<string>("annually");

  return (
    <section id="pricing" className="py-24 relative bg-secondary/30">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="outline" className="mb-6 px-4 py-2 border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Web Hosting Plans</span>
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Fast, Secure{" "}
            <span className="text-gradient">Web Hosting</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Launch your website on lightning-fast NVMe servers with free SSL, daily backups, and expert support. No technical skills required.
          </p>

          {/* Billing Toggle */}
          <div className="flex flex-col items-center gap-3">
            <ToggleGroup
              type="single"
              value={billingCycle}
              onValueChange={(value) => value && setBillingCycle(value)}
              className="bg-muted p-1 rounded-lg"
            >
              <ToggleGroupItem
                value="semiannually"
                className="px-6 py-2 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
              >
                6 Months
              </ToggleGroupItem>
              <ToggleGroupItem
                value="annually"
                className="px-6 py-2 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
              >
                12 Months
                <Badge className="ml-2 text-xs gradient-primary border-0">Best Value</Badge>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {Object.entries(WHMCS_CONFIG.products).map(([key, plan]) => {
            const config = planConfig[key as keyof typeof planConfig];
            const IconComponent = config.icon;
            const isPopular = 'popular' in config && config.popular;
            const price = billingCycle === "annually" ? plan.annualPrice : plan.semiannualPrice;
            const monthlyEquivalent = getMonthlyEquivalent(key, billingCycle);
            
            return (
              <Card
                key={key}
                className={`relative border-2 transition-all duration-300 hover:-translate-y-2 overflow-hidden ${
                  isPopular
                    ? "border-primary shadow-2xl shadow-primary/20 md:scale-105 z-10"
                    : "border-border/50 hover:border-primary/50 hover:shadow-xl"
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 gradient-primary py-2 text-center">
                    <span className="text-primary-foreground text-sm font-semibold">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className={`text-center pb-4 ${isPopular ? "pt-14" : "pt-8"}`}>
                  {/* Plan Icon */}
                  <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                    isPopular 
                      ? "gradient-primary shadow-lg shadow-primary/30" 
                      : "bg-primary/10"
                  }`}>
                    <IconComponent className={`w-7 h-7 ${isPopular ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-primary font-medium">{plan.tagline}</p>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                </CardHeader>

                <CardContent className="text-center">
                  {/* Price */}
                  <div className="mb-6 py-4 border-y border-border/50">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-lg text-muted-foreground">KES</span>
                      <span className="text-5xl font-bold">{price.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      ≈ {formatPrice(monthlyEquivalent)}/month
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {billingCycle === "annually" ? "Billed annually" : "Billed every 6 months"}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isPopular ? "bg-primary/20" : "bg-primary/10"
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
                      isPopular
                        ? "gradient-primary border-0 hover:opacity-90 shadow-lg shadow-primary/25"
                        : "hover:bg-primary hover:text-primary-foreground"
                    }`}
                    variant={isPopular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link to={`/order?plan=${key}&cycle=${billingCycle}`}>{config.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

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
              <span>Expert Support</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground/70">
            All prices in KES. Cancel anytime. No setup fees.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
