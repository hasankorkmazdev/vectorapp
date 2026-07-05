import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  accountingService,
  type DashboardSummary,
} from "@/features/accounting/services/accounting-service";
import { DashboardMetrics } from "@/features/accounting/components/DashboardMetrics";
import { IncomeExpenseChart } from "@/features/accounting/components/IncomeExpenseChart";
import { ExpenseCategoryChart } from "@/features/accounting/components/ExpenseCategoryChart";
import { RecentTransactions } from "@/features/accounting/components/RecentTransactions";
import { Card, CardContent } from "@/components/ui/card";

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function MonitorPage() {
  useDocumentTitle("sidebar.monitor");
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    accountingService.getDashboardSummary().then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }, []);

  if (loading || !summary) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  const netPositive = summary.netProfit >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 max-w-6xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-muted/50 p-8">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            {t("financial.dashboardTitle")}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t("financial.dashboardWelcome")}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("financial.dashboardDescription")}
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="text-center">
              <p className={`text-3xl font-extrabold tracking-tight ${netPositive ? "text-emerald-500" : "text-red-500"}`}>
                {netPositive ? "+" : "-"}
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                  minimumFractionDigits: 0,
                }).format(Math.abs(summary.netProfit))}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {netPositive ? t("financial.netProfit") : t("financial.netLoss")}
              </p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-extrabold tracking-tight">
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                  minimumFractionDigits: 0,
                }).format(summary.totalIncome)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("financial.totalIncome")}</p>
            </div>
          </div>
        </div>
      </div>

      <DashboardMetrics summary={summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <IncomeExpenseChart data={summary.monthlyData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <ExpenseCategoryChart data={summary.topExpenseCategories} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <RecentTransactions transactions={summary.recentTransactions} />
        </CardContent>
      </Card>
    </div>
  );
}
