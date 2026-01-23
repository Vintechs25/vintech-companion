import { useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { WHMCS_CONFIG } from "@/lib/whmcs-config";

/**
 * WHMCS-based SSO for CyberPanel
 * 
 * WHMCS CyberPanel module provides autologin through the client area.
 * We redirect to the product details page which has the "Login to CyberPanel" button
 * that handles authentication automatically.
 */
export function useCyberPanelSSO() {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Opens CyberPanel via WHMCS SSO
   * @param serviceId - The WHMCS service/product ID
   * @param directPanelUrl - Optional fallback URL if WHMCS SSO fails
   */
  const openCyberPanel = useCallback((
    panelUrl: string,
    _username?: string,
    _domain?: string,
    serviceId?: number
  ) => {
    setIsLoading(true);

    try {
      // If we have a service ID, use WHMCS autologin
      if (serviceId) {
        // WHMCS provides SSO through the clientarea product details page
        // The CyberPanel module adds a "Login to Control Panel" button that handles auth
        const whmcsSsoUrl = `${WHMCS_CONFIG.billingUrl}/clientarea.php?action=productdetails&id=${serviceId}`;
        
        window.open(whmcsSsoUrl, "_blank", "noopener,noreferrer");
        
        toast({
          title: "Opening Control Panel",
          description: "Click 'Login to CyberPanel' in the WHMCS portal",
        });
      } else {
        // Fallback: direct panel URL (requires manual login)
        window.open(panelUrl, "_blank", "noopener,noreferrer");
        
        toast({
          title: "Opening CyberPanel",
          description: "Sign in with your panel credentials",
        });
      }
    } catch (error) {
      console.error("SSO error:", error);
      // Fallback to direct URL
      window.open(panelUrl, "_blank", "noopener,noreferrer");
      
      toast({
        title: "Opening CyberPanel",
        description: "Sign in with your panel credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Opens WHMCS product details page with SSO capability
   * @param serviceId - The WHMCS service ID
   */
  const openWhmcsSso = useCallback((serviceId: number) => {
    const whmcsSsoUrl = `${WHMCS_CONFIG.billingUrl}/clientarea.php?action=productdetails&id=${serviceId}`;
    window.open(whmcsSsoUrl, "_blank", "noopener,noreferrer");
    
    toast({
      title: "Opening Control Panel",
      description: "Click 'Login to CyberPanel' in your account portal",
    });
  }, []);

  return {
    openCyberPanel,
    openWhmcsSso,
    isLoading,
  };
}
