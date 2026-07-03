import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { PanelLeft } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/languageSwitcher/Index";
import { ModeToggle } from "@/components/mode-toggle";
import { OrganizationSwitcher } from "./OrganizationSwitcher";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/store/app-store";

interface DashboardLayoutProps {
    children?: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const { t } = useTranslation();
    const user = useAppStore((state) => state.user);
    const hasOrganizations = !!(user?.organizations && user.organizations.length > 0);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="min-h-svh bg-muted/25">
                <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background/90 px-4 backdrop-blur-xl transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex min-w-0 items-center gap-2">
                        <SidebarTrigger className="-ml-1 h-9 w-9 rounded-md border bg-background shadow-sm">
                            <PanelLeft className="h-4 w-4" />
                        </SidebarTrigger>
                        <Separator orientation="vertical" className="mx-1 h-5" />
                        {hasOrganizations && (
                            <>
                                <OrganizationSwitcher />
                                <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />
                            </>
                        )}
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#" className="text-sm font-medium text-muted-foreground">
                                        {t("common.breadcrumbHome")}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                        <LanguageSwitcher />
                        <ModeToggle />
                    </div>
                </header>
                <main className="min-h-[calc(100svh-4rem)] px-4 py-5 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1680px]">
                        {children || <Outlet />}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
