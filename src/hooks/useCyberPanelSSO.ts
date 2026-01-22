import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SSOResponse {
  success: boolean;
  ssoUrl?: string;
  ssoEnabled?: boolean;
  error?: string;
  message?: string;
}

export function useCyberPanelSSO() {
  const [isLoading, setIsLoading] = useState(false);

  const openCyberPanel = useCallback(async (
    panelUrl: string,
    username?: string,
    domain?: string
  ) => {
    setIsLoading(true);

    try {
      // Call the SSO edge function
      const { data, error } = await supabase.functions.invoke<SSOResponse>("cyberpanel-sso", {
        body: { username, domain },
      });

      if (error) {
        console.error("SSO error:", error);
        // Fallback to direct URL
        window.open(panelUrl, "_blank", "noopener,noreferrer");
        return;
      }

      if (data?.success && data.ssoUrl) {
        // Open the SSO URL
        window.open(data.ssoUrl, "_blank", "noopener,noreferrer");
        
        if (data.ssoEnabled) {
          toast({
            title: "Opening CyberPanel",
            description: "You've been automatically signed in",
          });
        } else if (data.message) {
          toast({
            title: "Opening CyberPanel", 
            description: data.message,
            variant: "default",
          });
        }
      } else {
        // Fallback to direct URL
        window.open(panelUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("SSO failed:", err);
      // Fallback to direct URL on any error
      window.open(panelUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    openCyberPanel,
    isLoading,
  };
}
