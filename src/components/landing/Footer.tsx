import { Link } from "react-router-dom";
import { Zap, Mail } from "lucide-react";
import { WHMCS_CONFIG } from "@/lib/whmcs-config";

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
    Hosting: [
      { label: "Features", href: "#features", isAnchor: true },
      { label: "Pricing", href: "#pricing", isAnchor: true },
      { label: "Order Hosting", href: `${WHMCS_CONFIG.billingUrl}/cart.php`, isExternal: true },
      { label: "Client Area", href: `${WHMCS_CONFIG.billingUrl}/clientarea.php`, isExternal: true },
    ],
    Domains: [
      { label: "Domain Search", href: "/domains/search", isAnchor: false },
      { label: "Register Domain", href: "/domains/search", isAnchor: false },
      { label: "Transfer Domain", href: "/domains/transfer", isAnchor: false },
    ],
    Resources: [
      { label: "Knowledge Base", href: "#faq", isAnchor: true },
      { label: "FAQ", href: "#faq", isAnchor: true },
      { label: "System Status", href: "#", isAnchor: true },
    ],
    Support: [
      { label: "Contact Us", href: "/contact", isAnchor: false },
      { label: "Open Ticket", href: `${WHMCS_CONFIG.billingUrl}/submitticket.php`, isExternal: true },
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
              Fast, reliable web hosting built on enterprise-grade cloud infrastructure. Trusted by thousands of websites worldwide.
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <a href="mailto:support@vintechdev.store" className="hover:text-foreground transition-colors">
                support@vintechdev.store
              </a>
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
                    ) : link.isExternal ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
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
