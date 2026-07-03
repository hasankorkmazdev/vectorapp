import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/app-store";

export function PublicLayout() {
    const isAuthenticated = useAppStore((state) => state.isAuthenticated);
    const location = useLocation();

    if (isAuthenticated && location.pathname === "/login") {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen w-full bg-background font-sans antialiased">
            <div className="flex min-h-screen items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
