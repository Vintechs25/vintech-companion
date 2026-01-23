import { useState, useEffect } from "react";
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
  Terminal,
  ExternalLink,
  Loader2,
  Server,
  ChevronDown,
} from "lucide-react";
import { servicesApi, type Service } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useCyberPanelSSO } from "@/hooks/useCyberPanelSSO";

export function QuickLaunchDropdown() {
  const { user } = useAuth();
  const { openWhmcsSso, isLoading: ssoLoading } = useCyberPanelSSO();
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

  const handleOpenPanel = () => {
    if (!selectedService?.id) return;
    openWhmcsSso(selectedService.id);
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

            {/* Open Full Panel via WHMCS SSO */}
            <DropdownMenuItem
              onClick={handleOpenPanel}
              disabled={!selectedService || ssoLoading}
              className="gap-2"
            >
              <Terminal className="h-4 w-4" />
              <span>Open Control Panel</span>
              <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
