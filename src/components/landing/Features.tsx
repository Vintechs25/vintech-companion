import { Zap, Shield, Rocket, Globe, Headphones, HardDrive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Zap,
    title: "Blazing Fast SSD",
    description: "NVMe SSD storage delivers 10x faster read/write speeds for lightning-quick website loading.",
  },
  {
    icon: Shield,
    title: "99.9% Uptime",
    description: "Enterprise-grade infrastructure ensures your website stays online when it matters most.",
  },
  {
    icon: HardDrive,
    title: "Free SSL Certificates",
    description: "Secure your site instantly with auto-renewed SSL certificates at no extra cost.",
  },
  {
    icon: Rocket,
    title: "One-Click Installs",
    description: "Deploy WordPress, Joomla, Drupal, and 400+ apps with a single click.",
  },
  {
    icon: Headphones,
    title: "24/7 Expert Support",
    description: "Our hosting experts are available round the clock to help you succeed.",
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Content delivery network ensures fast loading speeds for visitors worldwide.",
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
            Powerful features designed to help your website perform at its best.
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
