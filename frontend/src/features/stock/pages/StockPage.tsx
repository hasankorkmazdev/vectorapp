import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function StockPage() {
  useDocumentTitle("sidebar.stockItems");
  const { t } = useTranslation();

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <p className="text-lg text-muted-foreground">{t("sidebar.stockItems")}</p>
    </div>
  );
}
