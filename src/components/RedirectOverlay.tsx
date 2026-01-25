import { Loader2, Zap } from "lucide-react";

interface RedirectOverlayProps {
  message?: string;
}

export function RedirectOverlay({ message = "Redirecting to your dashboard..." }: RedirectOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-6 text-center p-8">
        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl animate-pulse" />
          <div className="relative p-4 rounded-2xl gradient-primary shadow-2xl shadow-primary/40 animate-bounce">
            <Zap className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        
        {/* Loading spinner and text */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-lg font-medium text-foreground">{message}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Please wait while we set up your session...
          </p>
        </div>
        
        {/* Progress bar animation */}
        <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[progress_1.5s_ease-in-out_infinite]" 
               style={{ width: '100%', animation: 'progress 1.5s ease-in-out infinite' }} />
        </div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
