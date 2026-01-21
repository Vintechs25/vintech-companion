import { useState, useCallback, useEffect } from "react";

const WHMCS_GOOGLE_LOGIN_URL = "https://billing.vintechdev.store/login.php?oauth=google";

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState<Window | null>(null);

  const initiateGoogleLogin = useCallback((): Promise<{ success: boolean }> => {
    setIsLoading(true);

    const width = 500;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    const authPopup = window.open(
      WHMCS_GOOGLE_LOGIN_URL,
      "googleLogin",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!authPopup) {
      setIsLoading(false);
      return Promise.resolve({ success: false });
    }

    setPopup(authPopup);

    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (authPopup.closed) {
          clearInterval(timer);
          setIsLoading(false);
          setPopup(null);
          // User is now logged in on WHMCS - refresh to sync state
          window.location.reload();
          resolve({ success: true });
        }
      }, 500);
    });
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
