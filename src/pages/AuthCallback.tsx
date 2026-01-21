import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const WHMCS_API_URL = "https://vintechdev.store/api/whmcs.php";

export default function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      if (error) {
        setStatus("error");
        setMessage("Authentication was cancelled or failed");
        
        // Notify parent window
        if (window.opener) {
          window.opener.postMessage({
            type: "google-auth-callback",
            success: false,
            error: "Authentication was cancelled",
          }, window.location.origin);
          setTimeout(() => window.close(), 1500);
        }
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received");
        
        if (window.opener) {
          window.opener.postMessage({
            type: "google-auth-callback",
            success: false,
            error: "No authorization code received",
          }, window.location.origin);
          setTimeout(() => window.close(), 1500);
        }
        return;
      }

      try {
        // Exchange code for user info via WHMCS
        const response = await fetch(WHMCS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            action: "GoogleCallback",
            code,
            state: state || "",
            redirect_uri: window.location.origin + "/auth/google/callback",
          }),
        });

        const data = await response.json();

        if (data.result === "success" && data.userid) {
          setStatus("success");
          setMessage("Login successful! Redirecting...");
          
          // Notify parent window of success
          if (window.opener) {
            window.opener.postMessage({
              type: "google-auth-callback",
              success: true,
              userid: data.userid,
              email: data.email,
            }, window.location.origin);
            setTimeout(() => window.close(), 1000);
          }
        } else {
          setStatus("error");
          setMessage(data.message || "Login failed");
          
          if (window.opener) {
            window.opener.postMessage({
              type: "google-auth-callback",
              success: false,
              error: data.message || "Login failed",
            }, window.location.origin);
            setTimeout(() => window.close(), 2000);
          }
        }
      } catch (err) {
        console.error("Callback error:", err);
        setStatus("error");
        setMessage("An error occurred during authentication");
        
        if (window.opener) {
          window.opener.postMessage({
            type: "google-auth-callback",
            success: false,
            error: "An error occurred during authentication",
          }, window.location.origin);
          setTimeout(() => window.close(), 2000);
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        )}
        {status === "success" && (
          <div className="h-8 w-8 mx-auto rounded-full bg-primary flex items-center justify-center">
            <svg className="h-5 w-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === "error" && (
          <div className="h-8 w-8 mx-auto rounded-full bg-destructive flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
