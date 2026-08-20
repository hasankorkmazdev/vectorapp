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
import { AccountsPage } from "./features/account/pages/AccountsPage";
import { VisitsPage } from "./features/visits/pages/VisitsPage";
import { MarketingPage } from "./features/marketing/pages/MarketingPage";
import { StocksPage } from "./features/products/pages/ProductsPage";
import { ProductDetailPage } from "./features/products/pages/ProductDetailPage";
import { EditProductPage } from "./features/products/pages/EditProductPage";
import { MonitorPage } from "./features/accounting/pages/MonitorPage";
import { IncomePage } from "./features/accounting/pages/IncomePage";
import { ExpensePage } from "./features/accounting/pages/ExpensePage";
import { IncomingInvoicesPage } from "./features/accounting/pages/IncomingInvoicesPage";
import { OutgoingInvoicesPage } from "./features/accounting/pages/OutgoingInvoicesPage";
import { OrganizationSetupPage } from "./features/organization/pages/organization-setup/Index";
import { SettingsPage } from "./features/settings/pages/Settings";
import { EquipmentsPage } from "./features/maintenance/pages/EquipmentsPage";
import { EquipmentDetailPage } from "./features/maintenance/pages/EquipmentDetailPage";
import { WorkOrdersPage } from "./features/maintenance/pages/WorkOrdersPage";
import { WorkOrderDetailPage } from "./features/maintenance/pages/WorkOrderDetailPage";
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
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/visits" element={<VisitsPage />} />
              <Route path="/marketing" element={<MarketingPage />} />
              <Route path="/products" element={<StocksPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/products/:id/edit" element={<EditProductPage />} />
              <Route path="/accounting/monitor" element={<MonitorPage />} />
              <Route path="/accounting/income" element={<IncomePage />} />
              <Route path="/accounting/expense" element={<ExpensePage />} />
              <Route path="/accounting/invoices/incoming" element={<IncomingInvoicesPage />} />
              <Route path="/accounting/invoices/outgoing" element={<OutgoingInvoicesPage />} />
              <Route path="/equipment" element={<EquipmentsPage />} />
              <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
              <Route path="/maintenance" element={<WorkOrdersPage />} />
              <Route path="/maintenance/:id" element={<WorkOrderDetailPage />} />
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
