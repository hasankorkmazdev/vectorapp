import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/app-store";
import { SetupLayout } from "./components/SetupLayout";
import { OrganizationSelection } from "./components/OrganizationSelection";

export function PrivateLayout() {
    const isAuthenticated = useAppStore((state) => state.isAuthenticated);
    const token = useAppStore((state) => state.token);
    const user = useAppStore((state) => state.user);
    const activeOrganizationId = useAppStore((state) => state.activeOrganizationId);
    const setActiveOrganizationId = useAppStore((state) => state.setActiveOrganizationId);
    const fetchActiveOrganizationDetails = useAppStore((state) => state.fetchActiveOrganizationDetails);
    const location = useLocation();

    const hasOrganizations = !!(user?.organizations && user.organizations.length > 0);
    const activeOrganization = user?.organizations?.find((o) => o.id === activeOrganizationId);

    useEffect(() => {
        if (isAuthenticated && activeOrganizationId && token) {
            fetchActiveOrganizationDetails();
        }
    }, [isAuthenticated, activeOrganizationId, token, fetchActiveOrganizationDetails]);

    useEffect(() => {
        if (isAuthenticated && hasOrganizations && !activeOrganizationId) {
            if (user?.organizations && user.organizations.length === 1) {
                setActiveOrganizationId(user.organizations[0].id);
            }
        }
    }, [isAuthenticated, hasOrganizations, activeOrganizationId, user?.organizations, setActiveOrganizationId]);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (activeOrganization?.isSetupRequired && location.pathname !== "/organization-setup") {
        return <Navigate to="/organization-setup" replace />;
    }

    if (hasOrganizations && !activeOrganizationId && user!.organizations!.length > 1) {
        return (
            <SetupLayout>
                <OrganizationSelection
                    organizations={user!.organizations!}
                    onSelect={setActiveOrganizationId}
                />
            </SetupLayout>
        );
    }

    if (hasOrganizations && !activeOrganizationId && user!.organizations!.length === 1) {
        return null;
    }

    return <Outlet />;
}

export { SetupLayout } from "./components/SetupLayout";
export { DashboardLayout } from "./components/DashboardLayout";
