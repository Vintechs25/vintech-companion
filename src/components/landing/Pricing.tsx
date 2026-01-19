import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const plans = [
  {
    id: "basic",
    name: "Starter",
    description: "Perfect for personal sites & blogs",
    price: "4.99",
    period: "/month",
    features: [
      "1 Website",
      "10 GB NVMe SSD Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificate",
      "1 Email Account",
      "Weekly Backups",
      "Web Control Panel",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Professional",
    description: "For growing businesses",
    price: "9.99",
    period: "/month",
    features: [
      "Unlimited Websites",
      "50 GB NVMe SSD Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificates",
      "Unlimited Email Accounts",
      "Daily Backups",
      "Web Control Panel",
      "Priority Support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Business",
    description: "For high-traffic websites",
    price: "24.99",
    period: "/month",
    features: [
      "Unlimited Websites",
      "200 GB NVMe SSD Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificates",
      "Unlimited Email Accounts",
      "Real-time Backups",
      "Web Control Panel",
      "24/7 Priority Support",
      "Dedicated Resources",
      "Advanced Security Suite",
    ],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple Pricing</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your{" "}
            <span className="text-gradient">Perfect Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Transparent pricing with no hidden fees. All plans include our easy-to-use control panel.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "border-primary shadow-2xl shadow-primary/20 scale-105"
                  : "border-border/50 hover:border-primary/50 hover:shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-2 pt-8">
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full transition-all hover:scale-[1.02] ${
                    plan.popular
                      ? "gradient-primary border-0 hover:opacity-90 shadow-lg shadow-primary/25"
                      : "hover:bg-primary hover:text-primary-foreground"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                  asChild
                >
                  <Link to="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-muted-foreground">
            💰 30-day money-back guarantee. No questions asked.
          </p>
          <p className="text-sm text-muted-foreground/70">
            All prices in USD. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
