import { Zap, Shield, Rocket, Globe, Headphones, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "NVMe SSD Storage",
    description: "Ultra-fast NVMe SSD storage for lightning-quick website loading and optimal performance.",
  },
  {
    icon: Shield,
    title: "99.9% Uptime",
    description: "Enterprise-grade Oracle Cloud infrastructure ensures your website stays online 24/7.",
  },
  {
    icon: Server,
    title: "CyberPanel Control",
    description: "Full access to CyberPanel for easy website, email, and database management.",
  },
  {
    icon: Rocket,
    title: "One-Click WordPress",
    description: "Deploy WordPress and other popular CMS platforms with a single click via CyberPanel.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Get help anytime through our ticket system. Our team is ready to assist you.",
  },
  {
    icon: Globe,
    title: "Free SSL Certificates",
    description: "Secure your websites with auto-renewed Let's Encrypt SSL certificates at no extra cost.",
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-gradient">Succeed Online</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powered by Oracle Cloud infrastructure with CyberPanel control panel.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
