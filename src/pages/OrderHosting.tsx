import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Server,
  Check,
  AlertCircle,
  Loader2,
  Rocket,
  Zap,
  Building,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 4.99,
    icon: Server,
    features: [
      "5 GB SSD Storage",
      "1 Website",
      "Free SSL Certificate",
      "Weekly Backups",
      "Email Support",
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 9.99,
    icon: Rocket,
    features: [
      "25 GB NVMe Storage",
      "Unlimited Websites",
      "Free SSL Certificates",
      "Daily Backups",
      "Priority Support",
      "Free Domain",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 24.99,
    icon: Building,
    features: [
      "100 GB NVMe Storage",
      "Unlimited Websites",
      "Free SSL Certificates",
      "Real-time Backups",
      "24/7 Phone Support",
      "Free Domain",
      "Dedicated IP",
      "Advanced Security",
    ],
    popular: false,
  },
];

export default function OrderHosting() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [domain, setDomain] = useState("");
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
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await orderApi.create({
        userid: user.userid,
        product: selectedPlan,
        domain: domain,
      });

      if (response.result === "success") {
        toast({
          title: "Order Placed!",
          description: "Your hosting order has been submitted successfully.",
        });
        navigate("/hosting");
      } else {
        throw new Error(response.error || "Order failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

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
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:border-primary/50"
                } ${plan.popular ? "relative" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
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
                      ${plan.price}
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
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {isSelected ? "Selected" : "Select Plan"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Domain Input */}
        <Card>
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
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/hosting")}>
              Cancel
            </Button>
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
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
