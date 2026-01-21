import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Shield,
  Key,
  Headphones,
  CreditCard,
  Globe,
  Settings as SettingsIcon,
  Lock,
  ChevronRight,
  Server,
} from "lucide-react";

interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
}

export default function Settings() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.userid) return;
      try {
        const data = await dashboardApi.get(user.userid);
        setProfile(data.user);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [user?.userid]);

  const QuickLinkCard = ({ icon: Icon, title, description, href }: {
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
  }) => (
    <Link to={href} className="group">
      <div className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm h-full">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0 group-hover:bg-foreground/10 transition-colors">
            <Icon className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
        </div>
      </div>
    </Link>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-5 border-b border-border">
          <h2 className="font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Profile
          </h2>
        </div>
        <div className="p-5">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-lg bg-foreground/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-foreground">
                  {profile?.firstname?.charAt(0) || "U"}{profile?.lastname?.charAt(0) || ""}
                </span>
              </div>
              <div>
                <h3 className="font-medium">
                  {profile?.firstname} {profile?.lastname}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {profile?.email || "—"}
                </p>
                <Badge variant="secondary" className="mt-2 text-xs">Account #{user?.userid}</Badge>
              </div>
            </div>
          )}
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              To update your profile details, please contact support.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/tickets">
                <Headphones className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="rounded-lg border border-border bg-card">
        <div className="p-5 border-b border-border">
          <h2 className="font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            Security
          </h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-foreground/5 flex items-center justify-center">
                <Lock className="h-5 w-5 text-foreground/70" />
              </div>
              <div>
                <span className="font-medium text-sm">Password</span>
                <p className="text-xs text-muted-foreground">Keep your account secure</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/forgot-password">
                <Key className="h-4 w-4 mr-2" />
                Change
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-foreground/5 flex items-center justify-center">
                <Shield className="h-5 w-5 text-foreground/70" />
              </div>
              <div>
                <span className="font-medium text-sm">Two-Factor Auth</span>
                <p className="text-xs text-muted-foreground">Extra layer of security</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/tickets">
                Request Setup
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div>
        <h2 className="font-medium mb-4">Quick Links</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <QuickLinkCard
            icon={Server}
            title="My Projects"
            description="Manage your hosting services"
            href="/hosting"
          />
          <QuickLinkCard
            icon={CreditCard}
            title="Billing"
            description="View and pay your invoices"
            href="/invoices"
          />
          <QuickLinkCard
            icon={Headphones}
            title="Support"
            description="Get help from our team"
            href="/tickets"
          />
          <QuickLinkCard
            icon={Globe}
            title="Domains"
            description="Manage your domain names"
            href="/domains"
          />
        </div>
      </div>
    </div>
  );
}
