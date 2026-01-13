import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const footerLinks = {
    Product: [
      { label: "Features", href: "#features", isAnchor: true },
      { label: "Pricing", href: "#pricing", isAnchor: true },
      { label: "Order Hosting", href: "/order", isAnchor: false },
      { label: "Login", href: "/login", isAnchor: false },
    ],
    Company: [
      { label: "About", href: "#", isAnchor: true },
      { label: "Blog", href: "#", isAnchor: true },
      { label: "Careers", href: "#", isAnchor: true },
      { label: "Contact", href: "/tickets", isAnchor: false },
    ],
    Support: [
      { label: "Help Center", href: "/tickets", isAnchor: false },
      { label: "Documentation", href: "#", isAnchor: true },
      { label: "Status", href: "#", isAnchor: true },
      { label: "FAQ", href: "#faq", isAnchor: true },
    ],
    Legal: [
      { label: "Privacy", href: "#", isAnchor: true },
      { label: "Terms", href: "#", isAnchor: true },
      { label: "Cookie Policy", href: "#", isAnchor: true },
      { label: "GDPR", href: "#", isAnchor: true },
    ],
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-16 grid md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">Vintech Hosting</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Lightning-fast web hosting for businesses of all sizes. Reliable, secure, and backed by 24/7 expert support.
            </p>
            <div className="flex gap-4">
              {["Twitter", "GitHub", "LinkedIn"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                  aria-label={social}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.isAnchor ? (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} Vintech Hosting. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
