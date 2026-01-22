import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  ExternalLink,
  FolderOpen,
  Database,
  Mail,
  Shield,
  Globe,
  Settings,
  Terminal,
} from "lucide-react";
import { useCyberPanelSSO } from "@/hooks/useCyberPanelSSO";
import type { Service } from "@/lib/api";

interface QuickActionsMenuProps {
  service: Service;
  onManage?: () => void;
}

export function QuickActionsMenu({ service, onManage }: QuickActionsMenuProps) {
  const { openCyberPanel } = useCyberPanelSSO();
  const panelUrl = service.panel_url || "";

  const handleOpenPanel = (e: React.MouseEvent, path?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = path ? `${panelUrl}${path}` : panelUrl;
    openCyberPanel(url, service.username, service.domain);
  };

  const quickLinks = [
    { label: "File Manager", icon: FolderOpen, path: `/filemanager/${service.domain}` },
    { label: "Databases", icon: Database, path: "/dataBases/listDatabases" },
    { label: "Email", icon: Mail, path: "/email/listEmails" },
    { label: "SSL", icon: Shield, path: `/manageSSL/${service.domain}` },
    { label: "DNS", icon: Globe, path: "/dns/listDNS" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Quick Actions
        </DropdownMenuLabel>
        
        {panelUrl && (
          <>
            <DropdownMenuItem onClick={(e) => handleOpenPanel(e as unknown as React.MouseEvent)}>
              <Terminal className="h-4 w-4 mr-2" />
              Open CyberPanel
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {quickLinks.map((link) => (
              <DropdownMenuItem 
                key={link.label} 
                onClick={(e) => handleOpenPanel(e as unknown as React.MouseEvent, link.path)}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.label}
                <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem asChild>
          <Link to={`/hosting/${service.id}`} onClick={onManage}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Service
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}