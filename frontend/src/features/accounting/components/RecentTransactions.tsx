import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/features/accounting/services/accounting-service";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { t } = useTranslation();

  function renderTrendIcon(tx: Transaction) {
    if (tx.type === "income") {
      return <TrendingUp className="h-3.5 w-3.5" />;
    }
    return <TrendingDown className="h-3.5 w-3.5" />;
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        {t("financial.noData")}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{t("financial.recentTransactions")}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">{t("financial.date")}</TableHead>
            <TableHead>{t("financial.description")}</TableHead>
            <TableHead>{t("financial.category")}</TableHead>
            <TableHead className="text-right">{t("financial.amount")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(tx.date)}
              </TableCell>
              <TableCell className="font-medium">{tx.description}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {tx.categoryName}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span className={`inline-flex items-center gap-1 text-sm font-medium ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {renderTrendIcon(tx)}
                  {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
