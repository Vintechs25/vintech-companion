import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export function useCyberPanelSSO() {
  const openCyberPanel = useCallback((
    panelUrl: string,
    _username?: string,
    _domain?: string
  ) => {
    // Direct open - CyberPanel doesn't support true SSO
    // User will sign in with their panel credentials
    window.open(panelUrl, "_blank", "noopener,noreferrer");
    
    toast({
      title: "Opening CyberPanel",
      description: "Sign in with your panel credentials",
    });
  }, []);

  return {
    openCyberPanel,
    isLoading: false, // No async operation needed
  };
}