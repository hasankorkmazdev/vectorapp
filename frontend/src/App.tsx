import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PrivateLayout, DashboardLayout, SetupLayout } from "./layouts/private";
import { PublicLayout } from "./layouts/public/Index";
import LoginPage from "./pages/login/Index";
import RegisterPage from "./pages/register/Index";
import { VerifyEmailPage } from "./pages/verify-email/Index";
import ForgotPasswordPage from "./pages/forgot-password/Index";
import ResetPasswordPage from "./pages/reset-password/Index";
import { Dashboard } from "./pages/Dashboard";
import { OrganizationSetupPage } from "./pages/organization-setup/Index";
import { SettingsPage } from "./pages/settings/Settings";
import { Toaster } from "sonner";

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Private Routes */}
          <Route element={<PrivateLayout />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route element={<SetupLayout />}>
              <Route path="/organization-setup" element={<OrganizationSetupPage />} />
            </Route>
          </Route>
        </Routes>
        <Toaster position="bottom-right" richColors />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
