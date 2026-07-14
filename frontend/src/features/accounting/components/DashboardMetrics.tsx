import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Wallet, Calendar, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { DashboardSummary } from "@/features/accounting/services/accounting-service";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(amount);
}

interface MetricCardProps {
  label: string;
  value: number;
  isCurrency?: boolean;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
}

function MetricCard({ label, value, isCurrency = true, icon, trend, trendLabel }: MetricCardProps) {
  function renderTrendIcon() {
    if (trend === "up") return <TrendingUp className="h-3 w-3" />;
    if (trend === "down") return <TrendingDown className="h-3 w-3" />;
    return null;
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight">
              {isCurrency ? formatCurrency(value) : value.toLocaleString("tr-TR")}
            </p>
            {trendLabel && (
              <p className={`text-xs flex items-center gap-1 ${trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                {renderTrendIcon()}
                {trendLabel}
              </p>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsProps {
  summary: DashboardSummary;
}

export function DashboardMetrics({ summary }: DashboardMetricsProps) {
  const { t } = useTranslation();
  const profitMargin = summary.totalIncome > 0
    ? `${summary.netProfit >= 0 ? "+" : ""}${Math.round((summary.netProfit / summary.totalIncome) * 100)}%`
    : "0%";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        label={t("financial.totalIncome")}
        value={summary.totalIncome}
        icon={<TrendingUp className="h-5 w-5" />}
        trend="up"
        trendLabel={t("financial.vsPreviousMonth")}
      />
      <MetricCard
        label={t("financial.totalExpense")}
        value={summary.totalExpense}
        icon={<TrendingDown className="h-5 w-5" />}
        trend="down"
        trendLabel={t("financial.vsPreviousMonth")}
      />
      <MetricCard
        label={summary.netProfit >= 0 ? t("financial.netProfit") : t("financial.netLoss")}
        value={Math.abs(summary.netProfit)}
        icon={<Wallet className="h-5 w-5" />}
        trend={summary.netProfit >= 0 ? "up" : "down"}
        trendLabel={profitMargin}
      />
      <MetricCard
        label={t("financial.thisMonthIncome")}
        value={summary.thisMonthIncome}
        icon={<Calendar className="h-5 w-5" />}
      />
      <MetricCard
        label={t("financial.thisMonthExpense")}
        value={summary.thisMonthExpense}
        icon={<Calendar className="h-5 w-5" />}
      />
      <MetricCard
        label={t("financial.cashBalance")}
        value={summary.cashBalance}
        icon={<Landmark className="h-5 w-5" />}
      />
    </div>
  );
}
