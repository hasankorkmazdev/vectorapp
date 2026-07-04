import { useTranslation } from "react-i18next";
import { useDocumentTitle } from "@/hooks/use-document-title";

export function VisitsPage() {
  useDocumentTitle("sidebar.visits");
  const { t } = useTranslation();

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <p className="text-lg text-muted-foreground">{t("sidebar.visits")}</p>
    </div>
  );
}
