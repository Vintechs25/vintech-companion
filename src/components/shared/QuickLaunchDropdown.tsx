import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  FolderOpen,
  Database,
  Mail,
  Shield,
  Globe,
  Code,
  Terminal,
  ExternalLink,
  Loader2,
  Server,
  ChevronDown,
} from "lucide-react";
import { servicesApi, type Service } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCyberPanelSSO } from "@/hooks/useCyberPanelSSO";

interface QuickLaunchItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
}

const quickLaunchItems: QuickLaunchItem[] = [
  {
    id: "filemanager",
    title: "File Manager",
    description: "Browse and edit files",
    icon: FolderOpen,
    path: "/filemanager",
  },
  {
    id: "databases",
    title: "Databases",
    description: "MySQL/MariaDB",
    icon: Database,
    path: "/dataBases/listDatabases",
  },
  {
    id: "email",
    title: "Email Accounts",
    description: "Manage email",
    icon: Mail,
    path: "/email/listEmails",
  },
  {
    id: "ssl",
    title: "SSL Certificates",
    description: "HTTPS security",
    icon: Shield,
    path: "/manageSSL",
  },
  {
    id: "dns",
    title: "DNS Manager",
    description: "DNS records",
    icon: Globe,
    path: "/dns/listDNS",
  },
  {
    id: "php",
    title: "PHP Settings",
    description: "Configure PHP",
    icon: Code,
    path: "/websites/listWebsitesv2",
  },
];

export function QuickLaunchDropdown() {
  const { user } = useAuth();
  const { openCyberPanel, isLoading: ssoLoading } = useCyberPanelSSO();
  const location = useLocation();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch services when dropdown opens
  useEffect(() => {
    if (isOpen && user?.userid && services.length === 0) {
      setIsLoadingServices(true);
      servicesApi
        .getAll(user.userid)
        .then((data) => {
          const activeServices = data.filter(
            (s) => s.status.toLowerCase() === "active" && s.panel_url
          );
          setServices(activeServices);
          if (activeServices.length > 0) {
            setSelectedService(activeServices[0]);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingServices(false));
    }
  }, [isOpen, user?.userid, services.length]);

  // Try to detect current service from URL
  useEffect(() => {
    const match = location.pathname.match(/\/hosting\/(\d+)/);
    if (match && services.length > 0) {
      const serviceId = parseInt(match[1]);
      const found = services.find((s) => s.id === serviceId);
      if (found) {
        setSelectedService(found);
      }
    }
  }, [location.pathname, services]);

  const handleQuickLaunch = (item: QuickLaunchItem) => {
    if (!selectedService?.panel_url) return;
    
    // Build the full URL path
    let fullPath = item.path;
    if (item.id === "filemanager") {
      fullPath = `/filemanager/${selectedService.domain}`;
    } else if (item.id === "ssl") {
      fullPath = `/manageSSL/${selectedService.domain}`;
    }
    
    const targetUrl = `${selectedService.panel_url}${fullPath}`;
    openCyberPanel(targetUrl, selectedService.username, selectedService.domain);
    setIsOpen(false);
  };

  const handleOpenPanel = () => {
    if (!selectedService?.panel_url) return;
    openCyberPanel(selectedService.panel_url, selectedService.username, selectedService.domain);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Rocket className="h-4 w-4" />
          <span className="hidden sm:inline">Quick Launch</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-popover">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Quick Launch</span>
          {ssoLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        </DropdownMenuLabel>
        
        {/* Service Selector */}
        {isLoadingServices ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : services.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No active services with CyberPanel
          </div>
        ) : (
          <>
            {/* Selected Service */}
            <div className="px-2 py-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Server className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate text-xs">
                        {selectedService?.domain || "Select service"}
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-popover" align="start">
                  {services.map((service) => (
                    <DropdownMenuItem
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className="gap-2"
                    >
                      <Server className="h-3.5 w-3.5" />
                      <span className="truncate">{service.domain}</span>
                      {service.id === selectedService?.id && (
                        <Badge variant="secondary" className="ml-auto text-[10px]">
                          Selected
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <DropdownMenuSeparator />

            {/* Quick Launch Items */}
            <div className="grid grid-cols-2 gap-1 p-1">
              {quickLaunchItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickLaunch(item)}
                  disabled={!selectedService || ssoLoading}
                  className="flex flex-col items-center gap-1 rounded-lg p-3 text-center transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium">{item.title}</span>
                </button>
              ))}
            </div>

            <DropdownMenuSeparator />

            {/* Open Full Panel */}
            <DropdownMenuItem
              onClick={handleOpenPanel}
              disabled={!selectedService || ssoLoading}
              className="gap-2"
            >
              <Terminal className="h-4 w-4" />
              <span>Open CyberPanel</span>
              <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
