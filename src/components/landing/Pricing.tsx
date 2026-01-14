import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const plans = [
  {
    id: "basic",
    name: "Basic",
    description: "Perfect for personal sites & blogs",
    price: "4.99",
    period: "/month",
    features: [
      "1 Website",
      "10 GB SSD Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificate",
      "1 Email Account",
      "Weekly Backups",
      "CyberPanel Access",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing businesses",
    price: "9.99",
    period: "/month",
    features: [
      "Unlimited Websites",
      "50 GB NVMe SSD Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificate",
      "Unlimited Email Accounts",
      "Daily Backups",
      "CyberPanel Access",
      "Priority Support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For high-traffic websites",
    price: "24.99",
    period: "/month",
    features: [
      "Unlimited Websites",
      "200 GB NVMe SSD Storage",
      "Unlimited Bandwidth",
      "Free SSL Certificate",
      "Unlimited Email Accounts",
      "Real-time Backups",
      "CyberPanel Access",
      "24/7 Priority Support",
      "Dedicated Resources",
      "Advanced Security",
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple,{" "}
            <span className="text-gradient">Transparent Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your needs. All plans include CyberPanel control panel.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative border-2 transition-all duration-300 hover:-translate-y-2 ${
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/10 scale-105"
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary text-primary-foreground text-sm font-semibold px-4 py-1 rounded-full">
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
                  className={`w-full ${
                    plan.popular
                      ? "gradient-primary border-0 hover:opacity-90"
                      : ""
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
        <p className="text-center text-muted-foreground mt-12">
          💰 30-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  );
};

export default Pricing;
