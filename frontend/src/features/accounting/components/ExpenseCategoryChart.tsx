import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { CategoryBreakdown } from "@/features/accounting/services/accounting-service";

const COLORS = [
  "hsl(0 84% 60%)",
  "hsl(25 95% 53%)",
  "hsl(45 93% 47%)",
  "hsl(142 76% 36%)",
  "hsl(200 98% 39%)",
  "hsl(262 83% 58%)",
  "hsl(330 81% 60%)",
  "hsl(180 82% 45%)",
  "hsl(80 65% 50%)",
];

interface ExpenseCategoryChartProps {
  data: CategoryBreakdown[];
}

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        {t("financial.noData")}
      </div>
    );
  }

  const chartConfig: Record<string, { label: string; color: string }> = {};
  data.forEach((d, i) => {
    chartConfig[d.category] = {
      label: d.category,
      color: COLORS[i % COLORS.length],
    };
  });

  const pieData = data.map((d, i) => ({
    ...d,
    fill: COLORS[i % COLORS.length],
    name: d.category,
    value: d.amount,
  }));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{t("financial.expenseCategories")}</h3>
      <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {pieData.map((entry) => (
              <Cell key={entry.category} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
