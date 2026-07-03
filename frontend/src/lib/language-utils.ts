export const AVAILABLE_LANGUAGES = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
];

export const LANG_NAMES: Record<string, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  ru: "Русский",
  ar: "العربية",
  fr: "Français",
  es: "Español",
};

export const getDefaultCurrency = (langCode: string): string => {
  switch (langCode.toLowerCase()) {
    case "tr":
      return "TRY";
    case "de":
    case "fr":
    case "es":
      return "EUR";
    case "gb":
      return "GBP";
    default:
      return "USD";
  }
};

export const currencyOptions = ["TRY", "USD", "EUR", "GBP"];

export const getCurrencySymbol = (currency: string): string => {
  const symbolMap: Record<string, string> = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };
  return symbolMap[currency.toUpperCase()] || currency;
};
