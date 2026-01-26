import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SsoOptions {
  email: string;
  userid?: number;
  destination?: string;
}

export function useWhmcsSso() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSsoUrl = useCallback(async ({ email, userid, destination }: SsoOptions): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("whmcs-sso", {
        body: { email, userid, destination },
      });

      if (fnError) {
        console.error("SSO function error:", fnError);
        setError("Failed to create SSO session");
        return null;
      }

      if (data?.error) {
        setError(data.error);
        return null;
      }

      if (data?.redirect_url) {
        return data.redirect_url;
      }

      setError("No redirect URL received");
      return null;
    } catch (err) {
      console.error("SSO error:", err);
      setError("Failed to connect to WHMCS");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const redirectToClientArea = useCallback(async (email: string, userid?: number) => {
    const url = await getSsoUrl({ email, userid, destination: "clientarea:home" });
    if (url) {
      window.location.href = url;
      return true;
    }
    return false;
  }, [getSsoUrl]);

  return {
    getSsoUrl,
    redirectToClientArea,
    isLoading,
    error,
  };
}