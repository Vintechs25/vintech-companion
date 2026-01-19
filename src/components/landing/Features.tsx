import { Zap, Shield, Rocket, Globe, Headphones, Database, Lock, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "NVMe SSD Storage",
    description: "Experience lightning-fast website loading with our enterprise-grade NVMe SSD storage infrastructure.",
  },
  {
    icon: Shield,
    title: "99.9% Uptime Guarantee",
    description: "Your website stays online with our enterprise-grade cloud infrastructure and redundant systems.",
  },
  {
    icon: Database,
    title: "Easy Control Panel",
    description: "Manage your websites, emails, and databases through our intuitive web-based control panel.",
  },
  {
    icon: Rocket,
    title: "One-Click Apps",
    description: "Deploy WordPress, WooCommerce, and 100+ popular applications with just a single click.",
  },
  {
    icon: Headphones,
    title: "24/7 Expert Support",
    description: "Get help anytime through our ticket system. Our hosting experts are always ready to assist.",
  },
  {
    icon: Lock,
    title: "Free SSL Certificates",
    description: "Secure your websites with auto-renewing SSL certificates included free with every plan.",
  },
  {
    icon: RefreshCw,
    title: "Daily Backups",
    description: "Rest easy knowing your data is automatically backed up daily with easy one-click restore.",
  },
  {
    icon: Globe,
    title: "Free Domain Features",
    description: "Get free DNS management, email forwarding, and domain privacy with your hosting plan.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-secondary/50" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Succeed Online</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Built on enterprise-grade infrastructure designed for speed, security, and reliability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-2 hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
