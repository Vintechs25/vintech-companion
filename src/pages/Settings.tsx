import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Shield } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Account Settings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profile</CardTitle><CardDescription>Your account information</CardDescription></CardHeader>
          <CardContent><div className="space-y-4"><div><p className="text-sm text-muted-foreground">User ID</p><p className="font-medium">{user?.userid}</p></div></div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security</CardTitle><CardDescription>Manage your security settings</CardDescription></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">Security settings are managed through WHMCS client area.</p></CardContent>
        </Card>
      </div>
    </div>
  );
}