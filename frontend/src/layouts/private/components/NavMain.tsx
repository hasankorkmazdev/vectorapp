"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { useLocation, Link } from "react-router-dom";

export function NavMain({
  items,
  groupLabel,
  className,
}: {
  items: {
    title?: string;
    name?: string; // Support for either title or name
    url: string;
    icon?: LucideIcon | React.ElementType;
    isActive?: boolean;
    items?: {
      title?: string;
      name?: string;
      url: string;
    }[];
  }[];
  groupLabel?: string;
  className?: string;
}) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <SidebarGroup className={cn("py-0", className)}>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const title = item.title || item.name || "";
          const hasChildren = item.items && item.items.length > 0;

          if (!hasChildren) {
            const isActive =
              pathname === item.url ||
              (item.url !== "/" && pathname.startsWith(item.url + "/"));

            return (
              <SidebarMenuItem key={title}>
                <SidebarMenuButton asChild tooltip={title} isActive={isActive}>
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          const isChildActive = item.items?.some(
            (subItem) =>
              pathname === subItem.url ||
              (subItem.url !== "/" && pathname.startsWith(subItem.url + "/")),
          );

          return (
            <Collapsible
              key={title}
              asChild
              defaultOpen={isChildActive || item.isActive}
              className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={title} isActive={item.isActive}>
                    {item.icon && <item.icon />}
                    <span>{title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const subTitle = subItem.title || subItem.name || "";
                      const isSubActive =
                        pathname === subItem.url ||
                        (subItem.url !== "/" &&
                          pathname.startsWith(subItem.url + "/"));

                      return (
                        <SidebarMenuSubItem key={subTitle}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link to={subItem.url}>
                              <span>{subTitle}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
