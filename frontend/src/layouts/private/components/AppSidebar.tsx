"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { getNavigation } from "./sidebar-config";
import { useAppStore } from "@/store/app-store";

import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutGrid } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  const navigation = getNavigation(t);

  const userData = {
    name: user?.fullName || t("common.guest"),
    email: user?.email || "",
    avatar: user?.avatarUrl || "/avatars/user.jpg",
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar" {...props}>
      <SidebarHeader className="border-b px-2 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="gap-3 rounded-md">
              <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <LayoutGrid className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{t("sidebar.appName")}</span>
                <span className="truncate text-xs text-sidebar-foreground/60">{t("sidebar.appSubtitle")}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <NavMain items={navigation.main} groupLabel={t("sidebar.home")} />
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
