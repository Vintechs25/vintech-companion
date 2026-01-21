import { useState, useCallback, useEffect } from "react";

const WHMCS_API_URL = "https://vintechdev.store/api/whmcs.php";

interface GoogleAuthResult {
  success: boolean;
  userid?: number;
  email?: string;
  error?: string;
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);

  const initiateGoogleLogin = useCallback(async (): Promise<GoogleAuthResult> => {
    setIsLoading(true);

    try {
      // Request the Google OAuth URL from WHMCS
      const response = await fetch(WHMCS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          action: "GetGoogleAuthUrl",
          redirect_uri: window.location.origin + "/auth/google/callback",
        }),
      });

      const data = await response.json();

      if (!data.auth_url) {
        setIsLoading(false);
        return { success: false, error: data.message || "Failed to get Google auth URL" };
      }

      // Open popup for Google OAuth
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authPopup = window.open(
        data.auth_url,
        "google-auth",
        `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
      );

      if (!authPopup) {
        setIsLoading(false);
        return { success: false, error: "Popup blocked. Please allow popups for this site." };
      }

      setPopup(authPopup);

      // Wait for the popup to complete and return the result
      return new Promise((resolve) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data?.type === "google-auth-callback") {
            window.removeEventListener("message", handleMessage);
            setIsLoading(false);
            setPopup(null);
            
            if (event.data.success) {
              resolve({
                success: true,
                userid: event.data.userid,
                email: event.data.email,
              });
            } else {
              resolve({
                success: false,
                error: event.data.error || "Google login failed",
              });
            }
          }
        };

        window.addEventListener("message", handleMessage);

        // Check if popup was closed without completing
        const checkClosed = setInterval(() => {
          if (authPopup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", handleMessage);
            setIsLoading(false);
            setPopup(null);
            resolve({ success: false, error: "Authentication cancelled" });
          }
        }, 500);
      });
    } catch (error) {
      console.error("Google auth error:", error);
      setIsLoading(false);
      return { success: false, error: "An error occurred during Google login" };
    }
  }, []);

  // Cleanup popup on unmount
  useEffect(() => {
    return () => {
      if (popup && !popup.closed) {
        popup.close();
      }
    };
  }, [popup]);

  return {
    initiateGoogleLogin,
    isLoading,
  };
}
