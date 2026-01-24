import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Server, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { WHMCS_CONFIG } from "@/lib/whmcs-config";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const navLinks = [
    { href: "#features", label: "Features", isAnchor: true },
    { href: "#pricing", label: "Pricing", isAnchor: true },
    { href: "/domains/search", label: "Domains", isAnchor: false },
    { href: "#faq", label: "FAQ", isAnchor: true },
    { href: "/contact", label: "Contact", isAnchor: false },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Server className="h-4 w-4" />
            </div>
            <span className="font-semibold">Vintech Hosting</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.isAnchor ? (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <Button size="sm" asChild>
                <a href={`${WHMCS_CONFIG.billingUrl}/clientarea.php`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Client Area
                </a>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.isAnchor ? (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="flex gap-2 pt-4 mt-2 border-t border-border">
                {isAuthenticated ? (
                  <Button size="sm" className="flex-1" asChild>
                    <a href={`${WHMCS_CONFIG.billingUrl}/clientarea.php`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Client Area
                    </a>
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;