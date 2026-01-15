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
  ExternalLink,
  Key,
  Headphones,
  CreditCard,
  Globe,
  Settings as SettingsIcon,
  Bell,
  Lock,
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

  const whmcsClientArea = "https://billing.vintechdev.store/clientarea.php";
  const whmcsPasswordChange = "https://billing.vintechdev.store/clientarea.php?action=changepw";
  const whmcsDetails = "https://billing.vintechdev.store/clientarea.php?action=details";
  const whmcsContacts = "https://billing.vintechdev.store/clientarea.php?action=contacts";

  const QuickLinkCard = ({ icon: Icon, title, description, href, external = false }: {
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
    external?: boolean;
  }) => (
    <Card className="hover:shadow-lg transition-all hover:border-primary/30 group">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            {external ? (
              <Button variant="outline" size="sm" asChild>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  Open <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to={href}>Open</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
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
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
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
                    <Badge variant="secondary" className="mt-1">User ID: {user?.userid}</Badge>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <a href={whmcsDetails} target="_blank" rel="noopener noreferrer">
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Edit Profile
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={whmcsContacts} target="_blank" rel="noopener noreferrer">
                      <User className="h-4 w-4 mr-2" />
                      Manage Contacts
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Password</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Last changed: Unknown
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={whmcsPasswordChange} target="_blank" rel="noopener noreferrer">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Two-Factor Auth</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Manage 2FA in WHMCS portal
              </p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={`${whmcsClientArea}?action=security`} target="_blank" rel="noopener noreferrer">
                  Manage 2FA
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
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
            title="Billing Portal"
            description="View invoices, payment methods, and billing history"
            href={whmcsClientArea}
            external
          />
          <QuickLinkCard
            icon={Server}
            title="CyberPanel"
            description="Access your hosting control panel"
            href="https://vintechdev.store:8090"
            external
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
            icon={Bell}
            title="Notifications"
            description="Manage email notification preferences"
            href={`${whmcsClientArea}?action=emails`}
            external
          />
          <QuickLinkCard
            icon={Mail}
            title="Email Support"
            description="Contact us at support@vintechdev.store"
            href="mailto:support@vintechdev.store"
            external
          />
        </div>
      </div>
    </div>
  );
}
