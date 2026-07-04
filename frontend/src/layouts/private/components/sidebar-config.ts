import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Megaphone,
  Truck,
  Package,
  Monitor,
  FileDown,
  FileUp,
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

export interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

export interface NavigationConfig {
  groups: NavGroup[];
}

export const getNavigation = (t: any): NavigationConfig => ({
  groups: [
    {
      groupLabel: "",
      items: [
        {
          title: t("sidebar.dashboard"),
          url: "/",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      groupLabel: t("sidebar.customers"),
      items: [
        {
          title: t("sidebar.customersList"),
          url: "/customers",
          icon: Users,
        },
        {
          title: t("sidebar.visits"),
          url: "/visits",
          icon: CalendarCheck,
        },
        {
          title: t("sidebar.marketing"),
          url: "/marketing",
          icon: Megaphone,
        },
      ],
    },
    {
      groupLabel: t("sidebar.suppliers"),
      items: [
        {
          title: t("sidebar.suppliersList"),
          url: "/suppliers",
          icon: Truck,
        },
      ],
    },
    {
      groupLabel: t("sidebar.stock"),
      items: [
        {
          title: t("sidebar.stockItems"),
          url: "/stock",
          icon: Package,
        },
      ],
    },
    {
      groupLabel: t("sidebar.accounting"),
      items: [
        {
          title: t("sidebar.monitor"),
          url: "/accounting/monitor",
          icon: Monitor,
        },
        {
          title: t("sidebar.incomingInvoices"),
          url: "/accounting/invoices/incoming",
          icon: FileDown,
        },
        {
          title: t("sidebar.outgoingInvoices"),
          url: "/accounting/invoices/outgoing",
          icon: FileUp,
        },
      ],
    },
  ],
});
