"use client";

import { Sparkles, Tags, Users, Settings, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks/useAuth";

interface AppSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { id: "vibes", label: "Вайбы", icon: Sparkles },
  { id: "vibes-generator", label: "Генерация AI", icon: Tags },
  { id: "tags", label: "Теги", icon: Tags },
  { id: "users", label: "Пользователи", icon: Users },
  { id: "settings", label: "Настройки", icon: Settings },
];

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  const { user } = useAuth();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <span className="text-sm font-semibold">Админ Панель</span>
            <span className="text-xs text-muted-foreground">Управление системой</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-2">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setActiveSection(item.id)}
                isActive={activeSection === item.id}
                className="w-full"
                tooltip={item.label}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || undefined} />
            <AvatarFallback>
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col group-data-[collapsible=icon]/sidebar-wrapper:hidden">
            <span className="text-sm font-medium">{user?.name || "Администратор"}</span>
            <span className="text-xs text-muted-foreground">{user?.email || "admin@example.com"}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
