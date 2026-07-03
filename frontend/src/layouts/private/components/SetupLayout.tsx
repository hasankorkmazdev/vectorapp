import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "@/components/languageSwitcher/Index";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";

interface SetupLayoutProps {
    children?: ReactNode;
}

export function SetupLayout({ children }: SetupLayoutProps) {
    const { t } = useTranslation();
    const logout = useAppStore((state) => state.logout);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-6 border-b">
                <div className="flex items-center gap-2">
                    <img
                        src="/media/logo/logo-dark.png"
                        alt={t("common.logoAlt")}
                        className="h-8 block dark:hidden"
                    />
                    <img
                        src="/media/logo/logo-light.png"
                        alt={t("common.logoAlt")}
                        className="h-8 hidden dark:block"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher />
                    <ModeToggle />
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => logout()}
                    >
                        {t("common.logout")}
                    </Button>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-6 bg-slate-50/50 dark:bg-zinc-950/20">
                {children || <Outlet />}
            </main>
        </div>
    );
}
