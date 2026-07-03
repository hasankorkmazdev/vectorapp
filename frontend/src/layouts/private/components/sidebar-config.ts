import {
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: React.ElementType;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface NavigationConfig {
  main: NavItem[];
}

export const getNavigation = (t: any): NavigationConfig => ({
  main: [
    {
      title: t("sidebar.dashboard"),
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: t("sidebar.teams"),
      url: "/teams",
      icon: Users,
    },
    {
      title: t("sidebar.settings"),
      url: "/settings",
      icon: Settings,
    },
  ],
});
