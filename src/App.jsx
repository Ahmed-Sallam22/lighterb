import { BrowserRouter, Routes, Route } from "react-router";
import { useTranslation } from "react-i18next";
import { lazy, Suspense, useEffect } from "react";

import MainLayout from "./layouts/MainLayout";
import ScrollToTop from "./components/ScrollToTop";
import AuthGuard from "./components/auth/AuthGuard";
import ApprovalWorkflow from "./pages/ApprovalWorkflowPage";

// Loading component for Suspense fallback
const PageLoader = () => (
	<div className="min-h-screen flex items-center justify-center bg-[#031b28]">
		<div className="flex flex-col items-center gap-4">
			<div className="w-12 h-12 border-4 border-[#48C1F0] border-t-transparent rounded-full animate-spin"></div>
			<p className="text-white text-sm">Loading...</p>
		</div>
	</div>
);

// Lazy load all pages for better performance
const Home = lazy(() => import("./pages/Home"));
const QuickActionDetail = lazy(() => import("./pages/QuickActionDetail"));
const ARReceiptsPage = lazy(() => import("./pages/ARReceiptsPage"));
const APPaymentsPage = lazy(() => import("./pages/APPaymentsPage"));
const ARInvoicesPage = lazy(() => import("./pages/ARInvoicesPage"));
const APInvoicesPage = lazy(() => import("./pages/APInvoicesPage"));
const OneTimeSupplierInvoicesPage = lazy(() => import("./pages/OneTimeSupplierInvoicesPage"));
const JournalEntriesPage = lazy(() => import("./pages/JournalEntriesPage"));
// const JournalLinesPage = lazy(() => import("./pages/JournalLinesPage"));
const CreateJournalPage = lazy(() => import("./pages/CreateJournalPage"));
const SegmentsPage = lazy(() => import("./pages/SegmentsPage"));
const CurrencyPage = lazy(() => import("./pages/CurrencyPage"));
const CountryPage = lazy(() => import("./pages/CountryPage"));
const TaxRatesPage = lazy(() => import("./pages/TaxRatesPage"));
const InvoiceApprovalsPage = lazy(() => import("./pages/InvoiceApprovalsPage"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const ProcurementDashboard = lazy(() => import("./pages/ProcurementDashboard"));
const ProcurementApprovals = lazy(() => import("./pages/ProcurementApprovals"));
const ProcurementApprovalDetail = lazy(() => import("./pages/ProcurementApprovalDetail"));
const ProcurementCatalog = lazy(() => import("./pages/ProcurementCatalog"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgetPasswordPage = lazy(() => import("./pages/ForgetPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));
const Requisitions = lazy(() => import("./pages/Requisitions"));
const CreateRequisitionPage = lazy(() => import("./pages/CreateRequisitionPage"));
const AssetsPage = lazy(() => import("./pages/Assets"));
const JobRolesPage = lazy(() => import("./pages/JobRolesPage"));
const CreateJobRolePage = lazy(() => import("./pages/CreateJobRolePage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const UOMPage = lazy(() => import("./pages/UOMPage"));
const CreatePoPage = lazy(() => import("./pages/CreatePoPage"));
const PoPage = lazy(() => import("./pages/POPage"));
const Receiving = lazy(() => import("./pages/ReceivingPage"));
const CreateGRNPage = lazy(() => import("./pages/CreateGRNPage"));
const WorkStructurePage = lazy(() => import("./pages/WorkStructurePage"));
const EnterpriseAndBusinessGroupsPage = lazy(() => import("./pages/EnterpriseAndBusinessGroupsPage"));
const DepartmentsPage = lazy(() => import("./pages/DepartmentsPage"));
const GradesAndRatesPage = lazy(() => import("./pages/GradesAndRatesPage"));
const LocationsPage = lazy(() => import("./pages/LocationsPage"));
const PositionsPage = lazy(() => import("./pages/PositionsPage"));
const DefaultValuesPage = lazy(() => import("./pages/DefaultValuesPage"));
const EmployeeSearchPage = lazy(() => import("./pages/EmployeeSearchPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const FiscalPeriodPage = lazy(() => import("./pages/FiscalPeriodPage"));
const GeneratePeriodsPage = lazy(() => import("./pages/GeneratePeriodsPage"));
const ARPeriodsPage = lazy(() => import("./pages/ARPeriodsPage"));
const APPeriodsPage = lazy(() => import("./pages/APPeriodsPage"));
const GLPeriodsPage = lazy(() => import("./pages/GLPeriodsPage"));

const App = () => {
	const { i18n } = useTranslation();

	useEffect(() => {
		document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
	}, [i18n.language]);

	return (
		<BrowserRouter>
			<ScrollToTop />
			<Suspense fallback={<PageLoader />}>
				<Routes>
					{/* Public Routes */}
					<Route path="/auth/login" element={<LoginPage />} />
					{/* <Route path="/auth/register" element={<RegisterPage />} /> */}
					<Route path="/auth/forgot-password" element={<ForgetPasswordPage />} />
					<Route path="/auth/reset-password" element={<ResetPasswordPage />} />

					{/* Semi-Protected Route - Requires Auth but uses Auth Layout */}
					<Route
						path="/change-password"
						element={
							<AuthGuard>
								<ChangePasswordPage />
							</AuthGuard>
						}
					/>

					{/* Protected Routes */}
					<Route
						path="/"
						element={
							<AuthGuard>
								<MainLayout />
							</AuthGuard>
						}
					>
						<Route index element={<Home />} />
						<Route path="dashboard" element={<Home />} />
						<Route path="quick-actions/:actionId" element={<QuickActionDetail />} />
						<Route path="ar-receipts" element={<ARReceiptsPage />} />
						<Route path="ap-payments" element={<APPaymentsPage />} />
						<Route path="ar-invoices" element={<ARInvoicesPage />} />
						<Route path="ap-invoices" element={<APInvoicesPage />} />
						<Route path="one-time-supplier-invoices" element={<OneTimeSupplierInvoicesPage />} />
						<Route path="journal-entries" element={<JournalEntriesPage />} />
						{/* <Route path="journal-entries/:journalEntryId/journal-lines" element={<JournalLinesPage />} /> */}
						<Route path="journal/create" element={<CreateJournalPage />} />
						<Route path="segments" element={<SegmentsPage />} />
						<Route path="assets" element={<AssetsPage />} />
						<Route path="currency" element={<CurrencyPage />} />
						<Route path="countries" element={<CountryPage />} />
						<Route path="tax-rates" element={<TaxRatesPage />} />
						<Route path="approvals" element={<InvoiceApprovalsPage />} />
						<Route path="customers" element={<CustomersPage />} />
						<Route path="suppliers" element={<SuppliersPage />} />
						<Route path="reports" element={<ReportsPage />} />
						<Route path="procurement" element={<ProcurementDashboard />} />
						<Route path="procurement/approvals" element={<ProcurementApprovals />} />
						<Route path="requisitions" element={<Requisitions />} />
						<Route path="create-requisition" element={<CreateRequisitionPage />} />
						<Route path="procurement/approvals/:instanceId" element={<ProcurementApprovalDetail />} />
						<Route path="procurement/catalog" element={<ProcurementCatalog />} />
						<Route path="job-roles" element={<JobRolesPage />} />
						<Route path="job-roles/create" element={<CreateJobRolePage />} />
						<Route path="approval-workflow" element={<ApprovalWorkflow />} />
						<Route path="users" element={<UsersPage />} />
						<Route path="uom" element={<UOMPage />} />
						<Route path="procurement/po" element={<PoPage />} />\
						<Route path="procurement/po/create" element={<CreatePoPage />} />
						<Route path="procurement/receiving-grn" element={<Receiving />} />
						<Route path="procurement/receiving-grn/create" element={<CreateGRNPage />} />
						<Route path="work-structure" element={<WorkStructurePage />} />
						<Route path="enterprise-business-groups" element={<EnterpriseAndBusinessGroupsPage />} />
						<Route path="departments" element={<DepartmentsPage />} />
						<Route path="grades-and-rates" element={<GradesAndRatesPage />} />
						<Route path="locations" element={<LocationsPage />} />
						<Route path="positions" element={<PositionsPage />} />
						<Route path="default-values" element={<DefaultValuesPage />} />
						<Route path="employee-search" element={<EmployeeSearchPage />} />
						<Route path="profile" element={<ProfilePage />} />
						<Route path="fiscal-periods" element={<FiscalPeriodPage />} />
						<Route path="fiscal-periods/generate" element={<GeneratePeriodsPage />} />
						<Route path="fiscal-periods/ar" element={<ARPeriodsPage />} />
						<Route path="fiscal-periods/ap" element={<APPeriodsPage />} />
						<Route path="fiscal-periods/gl" element={<GLPeriodsPage />} />
					</Route>
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
};

export default App;
