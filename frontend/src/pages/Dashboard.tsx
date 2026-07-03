import { useAppStore } from "@/store/app-store";
import { useTranslation } from "react-i18next";
import { ImpresiveCard } from "@/components/ui/impresive-card";
import { Sparkles, Zap } from "lucide-react";

export function Dashboard() {
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  const activeOrganizationId = useAppStore((state) => state.activeOrganizationId);
  const activeOrganization = user?.organizations?.find((o) => o.id === activeOrganizationId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 max-w-5xl mx-auto">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-muted/50 p-8 md:p-12">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            {t("organizationDashboard.statusReady")}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t("organizationDashboard.welcomeTitle")}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {t("organizationDashboard.welcomeDescription")}
          </p>
          {activeOrganization && (
            <div className="text-xs text-muted-foreground mt-2 font-mono">
              {activeOrganization.name}
            </div>
          )}
        </div>
      </div>

      {/* Impresive Card */}
      <ImpresiveCard className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{t("organizationDashboard.impresiveCardTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("organizationDashboard.impresiveCardDescription")}
            </p>
          </div>
        </div>
      </ImpresiveCard>
    </div>
  );
}
