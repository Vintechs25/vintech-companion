import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Link to={href}>
      <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 group cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card - Takes 2 columns */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {profile?.firstname?.charAt(0) || "U"}{profile?.lastname?.charAt(0) || ""}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {profile?.firstname} {profile?.lastname}
                    </h3>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {profile?.email || "N/A"}
                    </p>
                    <Badge variant="secondary" className="mt-2">Account #{user?.userid}</Badge>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    To update your profile details, please contact support.
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/tickets">
                      <Headphones className="h-4 w-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>Manage your security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Password</span>
                  <p className="text-xs text-muted-foreground">Keep your account secure</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                <Link to="/forgot-password">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Link>
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="font-medium">Two-Factor Auth</span>
                  <p className="text-xs text-muted-foreground">Extra layer of security</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                <Link to="/tickets">
                  Request Setup
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <QuickLinkCard
            icon={CreditCard}
            title="Invoices"
            description="View and pay your invoices"
            href="/invoices"
          />
          <QuickLinkCard
            icon={Headphones}
            title="Support Tickets"
            description="Get help from our support team"
            href="/tickets"
          />
          <QuickLinkCard
            icon={Globe}
            title="Domains"
            description="Manage your domain names"
            href="/domains"
          />
          <QuickLinkCard
            icon={SettingsIcon}
            title="My Hosting"
            description="Manage your hosting services"
            href="/hosting"
          />
          <QuickLinkCard
            icon={Mail}
            title="Email Support"
            description="Contact us at support@vintechdev.store"
            href="/tickets"
          />
          <QuickLinkCard
            icon={Key}
            title="Reset Password"
            description="Change your account password"
            href="/forgot-password"
          />
        </div>
      </div>
    </div>
  );
}
