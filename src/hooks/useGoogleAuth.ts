import { useState, useCallback, useEffect, useRef } from "react";

const WHMCS_API_URL = "https://vintechdev.store/api/whmcs.php";

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const initiateGoogleLogin = useCallback(async () => {
    setIsLoading(true);

    try {
      // Get the Google OAuth URL from WHMCS
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

      if (data.result === "success" && data.auth_url) {
        // Open the Google OAuth URL in a popup - this shows Google's native login
        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        popupRef.current = window.open(
          data.auth_url,
          "googleLogin",
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
        );
      } else {
        console.error("Failed to get Google auth URL:", data.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initiating Google login:", error);
      setIsLoading(false);
    }
  }, []);

  // Listen for messages from the callback popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "google-auth-callback") {
        setIsLoading(false);

        if (event.data.success && event.data.userid) {
          // Store user session
          localStorage.setItem("whmcs_user_id", event.data.userid);
          if (event.data.email) {
            localStorage.setItem("whmcs_user_email", event.data.email);
          }
          window.location.reload();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Cleanup popup on unmount
  useEffect(() => {
    return () => {
      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }
    };
  }, []);

  return {
    initiateGoogleLogin,
    isLoading,
  };
}
