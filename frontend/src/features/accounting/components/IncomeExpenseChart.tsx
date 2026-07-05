import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import type { MonthData } from "@/features/accounting/services/accounting-service";

const monthLabels: Record<string, string> = {
  "01": "Oca", "02": "Şub", "03": "Mar", "04": "Nis", "05": "May", "06": "Haz",
  "07": "Tem", "08": "Ağu", "09": "Eyl", "10": "Eki", "11": "Kas", "12": "Ara",
};

function formatMonthLabel(key: string): string {
  const month = key.substring(5, 7);
  return monthLabels[month] || month;
}

interface IncomeExpenseChartProps {
  data: MonthData[];
}

const chartConfig = {
  income: {
    label: "Gelir",
    color: "hsl(142 76% 36%)",
  },
  expense: {
    label: "Gider",
    color: "hsl(0 84% 60%)",
  },
};

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
  }));

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{t("financial.monthlyIncomeExpense")}</h3>
      <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} barSize={30} />
          <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
