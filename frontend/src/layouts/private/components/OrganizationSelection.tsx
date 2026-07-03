import { useTranslation } from "react-i18next";
import { Building2 } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Organization {
    id: string;
    name: string;
    role: string;
    isSetupRequired: boolean;
}

interface OrganizationSelectionProps {
    organizations: Organization[];
    onSelect: (id: string) => void;
}

export function OrganizationSelection({ organizations, onSelect }: OrganizationSelectionProps) {
    const { t } = useTranslation();

    return (
        <Card className="w-full max-w-md shadow-lg border-muted/50 bg-background/95">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center font-bold tracking-tight">
                    {t("organizationSwitcher.selectOrganizationTitle")}
                </CardTitle>
                <CardDescription className="text-center">
                    {t("organizationSwitcher.selectOrganizationDescription")}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2 max-h-[320px] overflow-y-auto pr-1">
                    {organizations.map((organization) => (
                        <Button
                            key={organization.id}
                            variant="outline"
                            onClick={() => onSelect(organization.id)}
                            className="flex items-center justify-between p-4 h-auto rounded-xl border border-muted hover:border-primary hover:bg-accent/40 text-left transition-all duration-200 cursor-pointer group w-full"
                        >
                            <div className="flex items-center gap-3 truncate">
                                <div className="p-2.5 rounded-lg bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div className="truncate">
                                    <div className="font-semibold text-sm truncate">{organization.name}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {t("organizationSwitcher.selectOrganizationRole", { role: organization.role })}
                                    </div>
                                </div>
                            </div>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
