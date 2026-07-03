import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const languages = [
    { code: "tr", name: "Türkçe", flag: "/media/flags/flags/tr-TR.svg" },
    { code: "en", name: "English", flag: "/media/flags/flags/en-US.svg" },
];

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const currentLanguage =
        languages.find((l) => l.code === i18n.language) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center gap-2 px-3 py-2 h-10 font-medium transition-colors">
                    <img
                        src={currentLanguage.flag}
                        alt={currentLanguage.name}
                        className="w-5 h-5 rounded-sm object-cover"
                    />
                    <span className="hidden sm:inline-block text-sm">
                        {currentLanguage.name}
                    </span>
                    <Globe className="h-3.5 w-3.5 opacity-50 ml-1" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className="flex items-center gap-2 cursor-pointer">
                        <img
                            src={lang.flag}
                            alt={lang.name}
                            className="w-5 h-5 rounded-sm object-cover"
                        />
                        <span>{lang.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
