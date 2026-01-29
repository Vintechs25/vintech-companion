import { useState, useCallback, useEffect, useRef } from "react";

// This URL should redirect to Google OAuth automatically
const GOOGLE_LOGIN_URL = "https://billing.vintechdev.store/login.php?oauth=google";

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<Window | null>(null);

  const initiateGoogleLogin = useCallback(() => {
    setIsLoading(true);

    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    popupRef.current = window.open(
      GOOGLE_LOGIN_URL,
      "googleLogin",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`
    );

    if (!popupRef.current) {
      setIsLoading(false);
      return;
    }

    // Monitor popup close
    const timer = setInterval(() => {
      if (popupRef.current?.closed) {
        clearInterval(timer);
        setIsLoading(false);
        popupRef.current = null;
        // Refresh to sync session after OAuth completes
        window.location.reload();
      }
    }, 500);
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
