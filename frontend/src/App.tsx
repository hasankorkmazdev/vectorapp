import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PrivateLayout, DashboardLayout, SetupLayout } from "./layouts/private";
import { PublicLayout } from "./layouts/public/Index";
import LoginPage from "./features/auth/pages/login/Index";
import RegisterPage from "./features/auth/pages/register/Index";
import { VerifyEmailPage } from "./features/auth/pages/verify-email/Index";
import ForgotPasswordPage from "./features/auth/pages/forgot-password/Index";
import ResetPasswordPage from "./features/auth/pages/reset-password/Index";
import { Dashboard } from "./features/dashboard/pages/Dashboard";
import { CustomersPage } from "./features/customers/pages/CustomersPage";
import { VisitsPage } from "./features/visits/pages/VisitsPage";
import { MarketingPage } from "./features/marketing/pages/MarketingPage";
import { SuppliersPage } from "./features/suppliers/pages/SuppliersPage";
import { ProductsPage } from "./features/products/pages/ProductsPage";
import { ProductDetailPage } from "./features/products/pages/ProductDetailPage";
import { EditProductPage } from "./features/products/pages/EditProductPage";
import { MonitorPage } from "./features/accounting/pages/MonitorPage";
import { IncomingInvoicesPage } from "./features/accounting/pages/IncomingInvoicesPage";
import { OutgoingInvoicesPage } from "./features/accounting/pages/OutgoingInvoicesPage";
import { OrganizationSetupPage } from "./features/organization/pages/organization-setup/Index";
import { SettingsPage } from "./features/settings/pages/Settings";
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
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/visits" element={<VisitsPage />} />
              <Route path="/marketing" element={<MarketingPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/products/:id/edit" element={<EditProductPage />} />
              <Route path="/accounting/monitor" element={<MonitorPage />} />
              <Route path="/accounting/invoices/incoming" element={<IncomingInvoicesPage />} />
              <Route path="/accounting/invoices/outgoing" element={<OutgoingInvoicesPage />} />
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
