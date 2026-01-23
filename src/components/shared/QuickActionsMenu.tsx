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
  const { openWhmcsSso } = useCyberPanelSSO();

  const handleOpenPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Use WHMCS SSO - redirects to product details page with autologin button
    openWhmcsSso(service.id);
  };

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
        
        <DropdownMenuItem onClick={handleOpenPanel}>
          <Terminal className="h-4 w-4 mr-2" />
          Open Control Panel
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        
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