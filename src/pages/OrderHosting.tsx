import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "@/lib/api";
import { WHMCS_CONFIG, calculatePrice, formatBillingCyclePrice } from "@/lib/whmcs-config";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Server,
  Check,
  AlertCircle,
  Loader2,
  Rocket,
  Zap,
  Building,
  CreditCard,
  Wallet,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const planIcons = {
  basic: Server,
  pro: Rocket,
  enterprise: Building,
};

export default function OrderHosting() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [domain, setDomain] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlan) {
      setError("Please select a hosting plan");
      return;
    }
    
    if (!domain) {
      setError("Please enter a domain name");
      return;
    }

    if (!user?.userid) {
      setError("Please log in to continue");
      navigate("/login?redirect=/hosting/order");
      return;
    }

    const product = WHMCS_CONFIG.products[selectedPlan as keyof typeof WHMCS_CONFIG.products];
    if (!product) {
      setError("Invalid plan selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await orderApi.create({
        userid: user.userid,
        pid: product.pid, // Numeric WHMCS product ID
        domain: domain.trim().toLowerCase(),
        billingcycle: billingCycle,
        paymentmethod: paymentMethod,
      });

      if (response.result === "success") {
        if (response.pay_url) {
          // Redirect to payment page
          window.location.href = response.pay_url;
        } else {
          toast({
            title: "Order Placed!",
            description: "Your hosting order has been submitted successfully.",
          });
          navigate("/hosting");
        }
      } else {
        throw new Error(response.message || response.error || "Order failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProduct = selectedPlan 
    ? WHMCS_CONFIG.products[selectedPlan as keyof typeof WHMCS_CONFIG.products] 
    : null;

  const totalPrice = selectedProduct 
    ? calculatePrice(selectedProduct.monthlyPrice, billingCycle) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Order Hosting</h1>
        <p className="text-muted-foreground">
          Choose a plan that fits your needs
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleOrder}>
        {/* Plans */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {Object.entries(WHMCS_CONFIG.products).map(([key, plan]) => {
            const Icon = planIcons[key as keyof typeof planIcons] || Server;
            const isSelected = selectedPlan === key;
            const isPro = key === "pro";
            
            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:border-primary/50"
                } ${isPro ? "relative" : ""}`}
                onClick={() => setSelectedPlan(key)}
              >
                {isPro && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary border-0">
                    <Zap className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pt-8">
                  <div className={`mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${
                    isSelected ? "gradient-primary" : "bg-primary/10"
                  }`}>
                    <Icon className={`h-6 w-6 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      ${plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full ${isSelected ? "gradient-primary" : ""}`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    {isSelected ? "Selected" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Billing Cycle */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Billing Cycle</CardTitle>
            <CardDescription>
              Save more with longer billing periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={billingCycle} onValueChange={setBillingCycle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WHMCS_CONFIG.billingCycles).map(([key, cycle]) => (
                  <SelectItem key={key} value={key}>
                    {cycle.label}
                    {cycle.discount > 0 && (
                      <span className="ml-2 text-primary">Save {cycle.discount}%</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && (
              <p className="mt-2 text-sm text-muted-foreground">
                Total: {formatBillingCyclePrice(selectedProduct.monthlyPrice, billingCycle)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Domain Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Domain Name</CardTitle>
            <CardDescription>
              Enter the domain name for your hosting account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                type="text"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                You can use an existing domain or register a new one
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select how you'd like to pay</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="grid gap-4 md:grid-cols-2"
            >
{WHMCS_CONFIG.paymentMethods.map((method) => {
                const Icon = CreditCard;
                const isSelected = paymentMethod === method.id;

                return (
                  <div key={method.id}>
                    <RadioGroupItem value={method.id} id={method.id} className="peer sr-only" />
                    <Label
                      htmlFor={method.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-accent ${
                        isSelected ? "border-primary bg-primary/5" : "border-muted"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "gradient-primary" : "bg-primary/10"
                      }`}>
                        <Icon className={`h-5 w-5 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-primary ml-auto" />}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <div>
              <Button type="button" variant="outline" onClick={() => navigate("/hosting")}>
                Cancel
              </Button>
            </div>
            <div className="flex items-center gap-4">
              {selectedProduct && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">${totalPrice.toFixed(2)}</p>
                </div>
              )}
              <Button
                type="submit"
                className="gradient-primary hover:opacity-90"
                disabled={isLoading || !selectedPlan || !domain}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Checkout
                    <Rocket className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
