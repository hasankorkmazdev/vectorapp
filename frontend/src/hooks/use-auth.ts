import { useAppStore } from "@/store/app-store";

export function useAuth() {
  const user = useAppStore((s) => s.user);
  const activeOrganizationId = useAppStore((s) => s.activeOrganizationId);

  const activeOrgRole =
    user?.organizations?.find((o) => o.id === activeOrganizationId)?.role ?? null;

  const hasRole = (role: string) => activeOrgRole === role;
  const isMechanic = activeOrgRole === "Mechanic";
  const isFinance = activeOrgRole === "Finance";
  const isOrganizationAdmin = activeOrgRole === "OrganizationAdmin";

  return { activeOrgRole, hasRole, isMechanic, isFinance, isOrganizationAdmin };
}
