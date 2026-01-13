import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { dashboardApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Shield, ExternalLink, Key, Headphones } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {profile?.firstname} {profile?.lastname}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {profile?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium">{user?.userid}</p>
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
            <p className="text-sm text-muted-foreground">
              Password and security settings are managed through the WHMCS client area.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <a href={whmcsPasswordChange} target="_blank" rel="noopener noreferrer">
                <Key className="h-4 w-4 mr-2" />
                Change Password
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* WHMCS Client Area Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Billing Portal
            </CardTitle>
            <CardDescription>Access full account management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For advanced account settings, billing details, and more, visit the full client area.
            </p>
            <Button className="w-full gradient-primary" asChild>
              <a href={whmcsClientArea} target="_blank" rel="noopener noreferrer">
                Open Client Area
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="h-5 w-5" />
              Support
            </CardTitle>
            <CardDescription>Need help?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <a 
                href="mailto:support@vintechdev.store" 
                className="font-medium text-primary hover:underline"
              >
                support@vintechdev.store
              </a>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <a href="/tickets">
                <Headphones className="h-4 w-4 mr-2" />
                Open Support Ticket
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
