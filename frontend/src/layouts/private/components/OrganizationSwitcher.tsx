import { useTranslation } from "react-i18next";
import { ChevronsUpDown, Building2, Check } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function OrganizationSwitcher() {
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  const activeOrganizationId = useAppStore((state) => state.activeOrganizationId);
  const setActiveOrganizationId = useAppStore((state) => state.setActiveOrganizationId);

  if (!user?.organizations || user.organizations.length === 0) return null;

  const organizations = user.organizations || [];
  const activeOrganization = organizations.find((o) => o.id === activeOrganizationId);

  const handleSwitch = (organizationId: string) => {
    setActiveOrganizationId(organizationId);
    // Reload the page to ensure all active queries and states refresh with the new header
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-label={t("organizationSwitcher.switch")}
          className="flex items-center justify-between gap-2 px-3 py-1.5 h-9 min-w-[180px] max-w-[240px] text-sm font-medium border border-input rounded-lg bg-background hover:bg-accent hover:text-accent-foreground transition-colors duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {activeOrganization ? activeOrganization.name : t("organizationSwitcher.placeholder")}
            </span>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[240px] rounded-lg mt-1 p-1 shadow-lg border border-border bg-popover text-popover-foreground"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("organizationSwitcher.switch")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 border-b border-border" />
        <div className="max-h-[200px] overflow-y-auto">
          {organizations.length === 0 ? (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
              {t("organizationSwitcher.noOrganization")}
            </div>
          ) : (
            organizations.map((organization) => {
              const isActive = organization.id === activeOrganizationId;
              return (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() => handleSwitch(organization.id)}
                  className="flex items-center justify-between px-2 py-2 text-sm rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors duration-150"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{organization.name}</span>
                  </div>
                  {isActive && <Check className="size-4 shrink-0 text-primary" />}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
