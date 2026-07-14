import { useTranslation } from "react-i18next";
import { PackageOpen } from "lucide-react";

export function ProductsTab() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <PackageOpen className="h-12 w-12 mb-4" />
      <p>{t("customers.productsEmpty")}</p>
    </div>
  );
}
