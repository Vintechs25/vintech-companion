import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Clock, CreditCard, Globe, Server } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatPrice, WHMCS_CONFIG } from "@/lib/whmcs-config";

interface OrderDetails {
  orderId: number;
  invoiceId: number;
  planName: string;
  domain: string;
  billingCycle: string;
  hostingPrice: number;
  domainPrice: number;
  totalPrice: number;
  includesDomainRegistration: boolean;
}

interface OrderConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderDetails: OrderDetails | null;
}

const COUNTDOWN_SECONDS = 10;

export function OrderConfirmationDialog({
  open,
  onOpenChange,
  orderDetails,
}: OrderConfirmationDialogProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!open || !orderDetails) {
      setCountdown(COUNTDOWN_SECONDS);
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(`/invoices/${orderDetails.invoiceId}`);
          return 0;
        }
        return prev - 1;
      });
      setProgress((prev) => Math.max(0, prev - (100 / COUNTDOWN_SECONDS)));
    }, 1000);

    return () => clearInterval(interval);
  }, [open, orderDetails, navigate]);

  const handlePayNow = () => {
    if (orderDetails) {
      navigate(`/invoices/${orderDetails.invoiceId}`);
    }
  };

  if (!orderDetails) return null;

  const billingCycleLabel = WHMCS_CONFIG.billingCycles[orderDetails.billingCycle as keyof typeof WHMCS_CONFIG.billingCycles]?.label || orderDetails.billingCycle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl">Order Confirmed!</DialogTitle>
          <DialogDescription>
            Your order #{orderDetails.orderId} has been placed successfully
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 animate-fade-in">
          {/* Order Summary */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{orderDetails.planName}</p>
                <p className="text-sm text-muted-foreground">{billingCycleLabel}</p>
              </div>
              <p className="font-semibold">{formatPrice(orderDetails.hostingPrice)}</p>
            </div>

            {orderDetails.includesDomainRegistration && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{orderDetails.domain}</p>
                  <p className="text-sm text-muted-foreground">Domain registration (1 year)</p>
                </div>
                <p className="font-semibold">KES {orderDetails.domainPrice.toLocaleString()}</p>
              </div>
            )}

            {!orderDetails.includesDomainRegistration && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{orderDetails.domain}</p>
                  <p className="text-sm text-muted-foreground">Existing domain</p>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between font-semibold">
              <span>Total Due</span>
              <span className="text-lg text-primary">
                {formatPrice(orderDetails.totalPrice)}
                {orderDetails.domainPrice > 0 && (
                  <span className="text-sm font-normal text-muted-foreground"> + KES {orderDetails.domainPrice.toLocaleString()}</span>
                )}
              </span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Redirecting to payment in {countdown} seconds...</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handlePayNow} className="w-full gradient-primary">
            <CreditCard className="h-4 w-4 mr-2" />
            Pay Now
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              navigate("/hosting");
            }}
            className="w-full"
          >
            Pay Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
