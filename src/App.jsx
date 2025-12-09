import { BrowserRouter, Routes, Route } from "react-router";
import { useTranslation } from "react-i18next";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import QuickActionDetail from "./pages/QuickActionDetail";
import PaymentsPage from "./pages/PaymentsPage";
import ARInvoicesPage from "./pages/ARInvoicesPage";
import APInvoicesPage from "./pages/APInvoicesPage";
import JournalEntriesPage from "./pages/JournalEntriesPage";
import JournalLinesPage from "./pages/JournalLinesPage";
import CreateJournalPage from "./pages/CreateJournalPage";
import SegmentsPage from "./pages/SegmentsPage";
import CurrencyPage from "./pages/CurrencyPage";
import ExchangeRatesPage from "./pages/ExchangeRatesPage";
import TaxRatesPage from "./pages/TaxRatesPage";
import InvoiceApprovalsPage from "./pages/InvoiceApprovalsPage";
import CustomersPage from "./pages/CustomersPage";
import SuppliersPage from "./pages/SuppliersPage";
import ReportsPage from "./pages/ReportsPage";
import ScrollToTop from "./components/ScrollToTop";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import ProcurementApprovals from "./pages/ProcurementApprovals";
import ProcurementApprovalDetail from "./pages/ProcurementApprovalDetail";
import ProcurementCatalog from "./pages/ProcurementCatalog";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { useEffect } from "react";
import Requisitions from "./pages/Requisitions";
import AssetsPage from "./pages/Assets";

const App = () => {
	const { i18n } = useTranslation();

	useEffect(() => {
		document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
	}, [i18n.language]);

	return (
		<BrowserRouter>
			<ScrollToTop />
			<Routes>
				<Route path="/auth/login" element={<LoginPage />} />
				<Route path="/auth/register" element={<RegisterPage />} />
				<Route path="/auth/forgot-password" element={<ForgetPasswordPage />} />
				<Route path="/auth/reset-password" element={<ResetPasswordPage />} />
				<Route path="/" element={<MainLayout />}>
					<Route index element={<Home />} />
					<Route path="dashboard" element={<Home />} />
					<Route path="quick-actions/:actionId" element={<QuickActionDetail />} />
					<Route path="payments/:type" element={<PaymentsPage />} />
					<Route path="ar-invoices" element={<ARInvoicesPage />} />
					<Route path="ap-invoices" element={<APInvoicesPage />} />
					<Route path="journal/entries" element={<JournalEntriesPage />} />
					<Route path="journal/lines" element={<JournalLinesPage />} />
					<Route path="journal/create" element={<CreateJournalPage />} />
					<Route path="segments" element={<SegmentsPage />} />
					<Route path="assets" element={<AssetsPage />} />
					<Route path="currency" element={<CurrencyPage />} />
					<Route path="exchange-rates" element={<ExchangeRatesPage />} />
					<Route path="tax-rates" element={<TaxRatesPage />} />
					<Route path="invoice-approvals" element={<InvoiceApprovalsPage />} />
					<Route path="customers" element={<CustomersPage />} />
					<Route path="suppliers" element={<SuppliersPage />} />
					<Route path="reports" element={<ReportsPage />} />
					<Route path="procurement" element={<ProcurementDashboard />} />
					<Route path="procurement/approvals" element={<ProcurementApprovals />} />
					<Route path="requisitions" element={<Requisitions />} />
					<Route path="procurement/approvals/:instanceId" element={<ProcurementApprovalDetail />} />
					<Route path="procurement/catalog" element={<ProcurementCatalog />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export default App;
