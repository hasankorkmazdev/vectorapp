import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useDocumentTitle(titleKey: string, isKey: boolean = true) {
  const { t } = useTranslation();

  useEffect(() => {
    const title = isKey ? t(titleKey) : titleKey;
    document.title = `Vector | ${title}`;
  }, [titleKey, t, isKey]);
}
