import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/shared/PageHeader";
import Card from "../components/shared/Card";
import Tabs from "../components/shared/Tabs";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";
import Toggle from "../components/shared/Toggle";
import Button from "../components/shared/Button";
import LoadingSpan from "../components/shared/LoadingSpan";

import { fetchBankById, clearSelectedBank } from "../store/banksSlice";
import {
	fetchBranches,
	createBranch,
	updateBranch,
	deleteBranch,
	activateBranch,
	deactivateBranch,
	setPage as setBranchPage,
	clearBranches,
} from "../store/branchesSlice";
import {
	fetchBankAccounts,
	createBankAccount,
	updateBankAccount,
	deleteBankAccount,
	freezeAccount,
	unfreezeAccount,
	updateAccountBalance,
	setPage as setAccountPage,
	clearAccounts,
	ACCOUNT_TYPE_OPTIONS,
} from "../store/bankAccountsSlice";
import { fetchCountries } from "../store/countriesSlice";
import { fetchCurrencies } from "../store/currenciesSlice";
import { fetchSegmentTypes, fetchSegmentValues } from "../store/segmentsSlice";

import { BiPlus, BiArrowBack } from "react-icons/bi";
import { FaChevronDown } from "react-icons/fa";
import { BsBank2, BsBuilding, BsCreditCard2Back } from "react-icons/bs";
import { FiGlobe, FiMail, FiPhone } from "react-icons/fi";

// Bank Header Icon
const BankHeaderIcon = () => <BsBank2 className="w-8 h-8 text-white" />;

// Initial form states
const BRANCH_INITIAL_STATE = {
	branch_name: "",
	branch_code: "",
	address: "",
	city: "",
	state: "",
	postal_code: "",
	country: "",
	contact_phone: "",
	contact_email: "",
	manager_name: "",
	swift_code: "",
	is_active: true,
	notes: "",
};

const ACCOUNT_INITIAL_STATE = {
	account_number: "",
	account_name: "",
	account_type: "CURRENT",
	transction_type: "",
	branch: "",
	currency: "",
	opening_balance: "0.00",
	iban: "",
	opening_date: "",
	is_active: true,
	description: "",
	cash_GL_segments: [],
	cash_clearing_GL_segments: [],
};

const BALANCE_UPDATE_INITIAL = {
	amount: "",
	transaction_type: "INCREASE",
	description: "",
};

const BankDetailsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { bankId } = useParams();

	// Redux state
	const { selectedBank, loading: bankLoading } = useSelector(state => state.banks);
	const {
		branches,
		loading: branchesLoading,
		count: branchCount,
		page: branchPage,
		hasNext: branchHasNext,
		hasPrevious: branchHasPrevious,
		actionLoading: branchActionLoading,
	} = useSelector(state => state.branches);
	const {
		accounts,
		loading: accountsLoading,
		count: accountCount,
		page: accountPage,
		hasNext: accountHasNext,
		hasPrevious: accountHasPrevious,
		actionLoading: accountActionLoading,
	} = useSelector(state => state.bankAccounts);
	const { countries = [] } = useSelector(state => state.countries);
	const { currencies = [] } = useSelector(state => state.currencies);
	const { types: segmentTypes = [], values: segmentValues = [] } = useSelector(state => state.segments);

	// Local state
	const [activeTab, setActiveTab] = useState("branches");
	const [branchPageSize, setBranchPageSize] = useState(10);
	const [accountPageSize, setAccountPageSize] = useState(10);

	// Branch modal state
	const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
	const [editingBranch, setEditingBranch] = useState(null);
	const [branchFormData, setBranchFormData] = useState(BRANCH_INITIAL_STATE);
	const [branchErrors, setBranchErrors] = useState({});
	const [confirmDeleteBranch, setConfirmDeleteBranch] = useState(false);
	const [branchToDelete, setBranchToDelete] = useState(null);

	// Account modal state
	const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
	const [editingAccount, setEditingAccount] = useState(null);
	const [accountFormData, setAccountFormData] = useState(ACCOUNT_INITIAL_STATE);
	const [accountErrors, setAccountErrors] = useState({});
	const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
	const [accountToDelete, setAccountToDelete] = useState(null);

	// Balance update modal
	const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
	const [balanceUpdateAccount, setBalanceUpdateAccount] = useState(null);
	const [balanceFormData, setBalanceFormData] = useState(BALANCE_UPDATE_INITIAL);

	// View account details modal
	const [isViewAccountModalOpen, setIsViewAccountModalOpen] = useState(false);
	const [viewingAccount, setViewingAccount] = useState(null);

	// Fetch bank details and supporting data on mount
	useEffect(() => {
		if (bankId) {
			dispatch(fetchBankById(bankId));
			dispatch(fetchCountries());
			dispatch(fetchCurrencies({ page_size: 100 }));
			dispatch(fetchSegmentTypes());
			dispatch(fetchSegmentValues({ node_type: "child", page_size: 1000 }));
			// Fetch branches and accounts for statistics
			dispatch(fetchBranches({ bank: bankId, page: 1, page_size: 10 }));
			dispatch(fetchBankAccounts({ page: 1, page_size: 10 }));
		}

		return () => {
			dispatch(clearSelectedBank());
			dispatch(clearBranches());
			dispatch(clearAccounts());
		};
	}, [dispatch, bankId]);

	// Fetch branches when on branches tab
	useEffect(() => {
		if (bankId && activeTab === "branches") {
			dispatch(fetchBranches({ bank: bankId, page: branchPage, page_size: branchPageSize }));
		}
	}, [dispatch, bankId, activeTab, branchPage, branchPageSize]);

	// Fetch accounts when on accounts tab
	useEffect(() => {
		if (bankId && activeTab === "accounts") {
			dispatch(fetchBankAccounts({ page: accountPage, page_size: accountPageSize }));
		}
	}, [dispatch, bankId, activeTab, accountPage, accountPageSize]);

	// Tabs configuration - use counts from Redux state
	const tabs = useMemo(
		() => [
			{
				id: "branches",
				label: t("bankDetails.tabs.branches"),
				count: branchCount || selectedBank?.total_branches || 0,
			},
			{
				id: "accounts",
				label: t("bankDetails.tabs.accounts"),
				count: accountCount || selectedBank?.total_accounts || 0,
			},
		],
		[t, branchCount, accountCount, selectedBank]
	);

	// Branch options for account form
	const branchOptions = useMemo(() => {
		return branches.map(b => ({
			value: b.id,
			label: `${b.branch_name} (${b.branch_code})`,
		}));
	}, [branches]);

	// Currency options
	const currencyOptions = useMemo(() => {
		return currencies.map(c => ({
			value: c.id,
			label: `${c.code} - ${c.name}`,
		}));
	}, [currencies]);

	// Account type options
	const accountTypeOptions = useMemo(() => {
		return ACCOUNT_TYPE_OPTIONS.map(opt => ({
			value: opt.value,
			label: t(`bankDetails.accountTypes.${opt.value.toLowerCase()}`) || opt.label,
		}));
	}, [t]);

	// Transaction type options
	const transactionTypeOptions = useMemo(
		() => [
			{ value: "", label: t("bankDetails.accountForm.selectTransactionType") || "Select Transaction Type" },
			{ value: "bank transfer", label: t("bankDetails.accountForm.bankTransfer") || "Bank Transfer" },
			{ value: "cash", label: t("bankDetails.accountForm.cash") || "Cash" },
			{ value: "check", label: t("bankDetails.accountForm.check") || "Check" },
		],
		[t]
	);

	// Get segment options for a specific segment type
	const getSegmentOptions = useCallback(
		segmentTypeId => {
			if (!segmentTypeId) return [];
			return segmentValues
				.filter(seg => seg.segment_type === segmentTypeId && seg.node_type === "child")
				.map(seg => ({
					value: seg.code,
					label: `${seg.code} - ${seg.name || seg.alias || ""}`,
				}));
		},
		[segmentValues]
	);

	// Handle segment change for cash_GL_segments or cash_clearing_GL_segments
	const handleSegmentChange = (field, segmentTypeId, segmentCode) => {
		setAccountFormData(prev => {
			const currentSegments = [...(prev[field] || [])];
			const existingIndex = currentSegments.findIndex(seg => seg.segment_type_id === segmentTypeId);

			if (segmentCode) {
				if (existingIndex >= 0) {
					currentSegments[existingIndex] = { segment_type_id: segmentTypeId, segment_code: segmentCode };
				} else {
					currentSegments.push({ segment_type_id: segmentTypeId, segment_code: segmentCode });
				}
			} else {
				if (existingIndex >= 0) {
					currentSegments.splice(existingIndex, 1);
				}
			}

			return { ...prev, [field]: currentSegments };
		});
	};

	// Get current segment value for a field and segment type
	const getSegmentValue = (field, segmentTypeId) => {
		const segments = accountFormData[field] || [];
		const segment = segments.find(seg => seg.segment_type_id === segmentTypeId);
		return segment?.segment_code || "";
	};

	// ===== BRANCH HANDLERS =====

	const branchColumns = useMemo(
		() => [
			{
				header: t("bankDetails.branchTable.branchName"),
				accessor: "branch_name",
				render: value => <span className="font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t("bankDetails.branchTable.branchCode"),
				accessor: "branch_code",
				width: "120px",
				render: value => <span className="font-mono text-gray-700">{value}</span>,
			},
			{
				header: t("bankDetails.branchTable.city"),
				accessor: "city",
				render: value => <span className="text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("bankDetails.branchTable.country"),
				accessor: "country_name",
				render: value => <span className="text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("bankDetails.branchTable.totalAccounts"),
				accessor: "total_accounts",
				width: "120px",
				render: value => (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{value || 0}
					</span>
				),
			},
			{
				header: t("bankDetails.branchTable.active"),
				accessor: "is_active",
				width: "100px",
				render: (value, row) => (
					<Toggle checked={!!value} onChange={checked => handleToggleBranchActive(row, checked)} />
				),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[t]
	);

	const handleToggleBranchActive = async (branch, newValue) => {
		try {
			if (newValue) {
				await dispatch(activateBranch(branch.id)).unwrap();
				toast.success(t("bankDetails.messages.branchActivated"));
			} else {
				await dispatch(deactivateBranch(branch.id)).unwrap();
				toast.success(t("bankDetails.messages.branchDeactivated"));
			}
		} catch (err) {
			toast.error(err?.message || t("bankDetails.messages.branchUpdateError"));
		}
	};

	const validateBranchForm = () => {
		const newErrors = {};
		if (!branchFormData.branch_name.trim()) {
			newErrors.branch_name = t("bankDetails.validation.branchNameRequired");
		}
		if (!branchFormData.branch_code.trim()) {
			newErrors.branch_code = t("bankDetails.validation.branchCodeRequired");
		}
		if (!branchFormData.country) {
			newErrors.country = t("bankDetails.validation.countryRequired");
		}
		setBranchErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleBranchInputChange = (field, value) => {
		setBranchFormData(prev => ({ ...prev, [field]: value }));
		if (branchErrors[field]) {
			setBranchErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleCreateBranch = () => {
		setEditingBranch(null);
		setBranchFormData({ ...BRANCH_INITIAL_STATE, country: selectedBank?.country || "" });
		setBranchErrors({});
		setIsBranchModalOpen(true);
	};

	const handleEditBranch = row => {
		const branch = row.rawData || row;
		setEditingBranch(branch);
		setBranchFormData({
			branch_name: branch.branch_name || "",
			branch_code: branch.branch_code || "",
			address: branch.address || "",
			city: branch.city || "",
			state: branch.state || "",
			postal_code: branch.postal_code || "",
			country: branch.country || "",
			contact_phone: branch.contact_phone || branch.phone || "",
			contact_email: branch.contact_email || branch.email || "",
			manager_name: branch.manager_name || "",
			swift_code: branch.swift_code || "",
			is_active: branch.is_active !== undefined ? branch.is_active : true,
			notes: branch.notes || "",
		});
		setBranchErrors({});
		setIsBranchModalOpen(true);
	};

	const handleSubmitBranch = async () => {
		if (!validateBranchForm()) return;

		const branchData = {
			bank: parseInt(bankId),
			branch_name: branchFormData.branch_name.trim(),
			branch_code: branchFormData.branch_code.trim().toUpperCase(),
			address: branchFormData.address.trim() || null,
			city: branchFormData.city.trim() || null,
			state: branchFormData.state.trim() || null,
			postal_code: branchFormData.postal_code.trim() || null,
			country: parseInt(branchFormData.country),
			contact_phone: branchFormData.contact_phone.trim() || null,
			contact_email: branchFormData.contact_email.trim() || null,
			manager_name: branchFormData.manager_name.trim() || null,
			swift_code: branchFormData.swift_code.trim() || null,
			is_active: branchFormData.is_active,
			notes: branchFormData.notes.trim() || null,
		};

		try {
			if (editingBranch) {
				await dispatch(updateBranch({ id: editingBranch.id, data: branchData })).unwrap();
				toast.success(t("bankDetails.messages.branchUpdateSuccess"));
			} else {
				await dispatch(createBranch(branchData)).unwrap();
				toast.success(t("bankDetails.messages.branchCreateSuccess"));
			}
			setIsBranchModalOpen(false);
			dispatch(fetchBranches({ bank: bankId, page: branchPage, page_size: branchPageSize }));
		} catch (err) {
			const errorMessage = err?.message || t("bankDetails.messages.branchSaveError");
			toast.error(errorMessage);
		}
	};

	const handleDeleteBranch = row => {
		const branch = row.rawData || row;
		setBranchToDelete(branch);
		setConfirmDeleteBranch(true);
	};

	const handleConfirmDeleteBranch = async () => {
		try {
			await dispatch(deleteBranch(branchToDelete.id)).unwrap();
			toast.success(t("bankDetails.messages.branchDeleteSuccess"));
			setConfirmDeleteBranch(false);
			setBranchToDelete(null);
		} catch (err) {
			toast.error(err?.message || t("bankDetails.messages.branchDeleteError"));
		}
	};

	// ===== ACCOUNT HANDLERS =====

	const accountColumns = useMemo(
		() => [
			{
				header: t("bankDetails.accountTable.accountNumber"),
				accessor: "account_number",
				render: value => <span className="font-mono font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t("bankDetails.accountTable.accountName"),
				accessor: "account_name",
				render: value => <span className="text-gray-700">{value}</span>,
			},
			{
				header: t("bankDetails.accountTable.accountType"),
				accessor: "account_type_display",
				width: "150px",
				render: value => (
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
						{value}
					</span>
				),
			},
			{
				header: t("bankDetails.accountTable.branch"),
				accessor: "branch_name",
				render: value => <span className="text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("bankDetails.accountTable.currency"),
				accessor: "currency_code",
				width: "100px",
				render: value => <span className="font-mono text-gray-700">{value}</span>,
			},
			{
				header: t("bankDetails.accountTable.currentBalance"),
				accessor: "current_balance",
				width: "150px",
				render: value => (
					<span className="font-semibold text-green-600">
						{parseFloat(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
					</span>
				),
			},
			{
				header: t("bankDetails.accountTable.active"),
				accessor: "is_active",
				width: "100px",
				render: (value, row) => (
					<Toggle checked={!!value} onChange={checked => handleToggleAccountActive(row, checked)} />
				),
			},
			{
				header: t("bankDetails.accountTable.frozen"),
				accessor: "is_frozen",
				width: "100px",
				render: (value, row) => {
					const account = row.rawData || row;
					return (
						<Toggle
							checked={!!account.is_frozen}
							onChange={checked => handleFreezeUnfreeze(row, checked)}
						/>
					);
				},
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[t]
	);

	const validateAccountForm = () => {
		const newErrors = {};
		if (!accountFormData.account_number.trim()) {
			newErrors.account_number = t("bankDetails.validation.accountNumberRequired");
		}
		if (!accountFormData.account_name.trim()) {
			newErrors.account_name = t("bankDetails.validation.accountNameRequired");
		}
		if (!accountFormData.branch) {
			newErrors.branch = t("bankDetails.validation.branchRequired");
		}
		if (!accountFormData.currency) {
			newErrors.currency = t("bankDetails.validation.currencyRequired");
		}
		setAccountErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAccountInputChange = (field, value) => {
		setAccountFormData(prev => ({ ...prev, [field]: value }));
		if (accountErrors[field]) {
			setAccountErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleCreateAccount = () => {
		// First ensure we have branches loaded
		if (branches.length === 0) {
			toast.warning(t("bankDetails.messages.noBranchesForAccount"));
			return;
		}
		setEditingAccount(null);
		setAccountFormData({ ...ACCOUNT_INITIAL_STATE, branch: branches[0]?.id || "" });
		setAccountErrors({});
		setIsAccountModalOpen(true);
	};

	const handleEditAccount = row => {
		const account = row.rawData || row;
		setEditingAccount(account);
		setAccountFormData({
			account_number: account.account_number || "",
			account_name: account.account_name || "",
			account_type: account.account_type || "CURRENT",
			transction_type: account.transction_type || "",
			branch: account.branch || "",
			currency: account.currency || "",
			opening_balance: account.opening_balance || "0.00",
			iban: account.iban || "",
			opening_date: account.opening_date || "",
			is_active: account.is_active !== undefined ? account.is_active : true,
			description: account.description || "",
			cash_GL_segments: account.cash_GL_segments || [],
			cash_clearing_GL_segments: account.cash_clearing_GL_segments || [],
		});
		setAccountErrors({});
		setIsAccountModalOpen(true);
	};

	const handleViewAccount = async row => {
		const account = row.rawData || row;
		setViewingAccount(account);
		setIsViewAccountModalOpen(true);
	};

	const handleSubmitAccount = async () => {
		if (!validateAccountForm()) return;

		const accountData = {
			branch: parseInt(accountFormData.branch),
			account_number: accountFormData.account_number.trim(),
			account_name: accountFormData.account_name.trim(),
			account_type: accountFormData.account_type,
			transction_type: accountFormData.transction_type || null,
			currency: parseInt(accountFormData.currency),
			opening_balance: accountFormData.opening_balance || "0.00",
			iban: accountFormData.iban.trim() || null,
			opening_date: accountFormData.opening_date || null,
			is_active: accountFormData.is_active,
			description: accountFormData.description.trim() || null,
			cash_GL_segments: accountFormData.cash_GL_segments.filter(seg => seg.segment_code),
			cash_clearing_GL_segments: accountFormData.cash_clearing_GL_segments.filter(seg => seg.segment_code),
		};

		try {
			if (editingAccount) {
				await dispatch(updateBankAccount({ id: editingAccount.id, data: accountData })).unwrap();
				toast.success(t("bankDetails.messages.accountUpdateSuccess"));
			} else {
				await dispatch(createBankAccount(accountData)).unwrap();
				toast.success(t("bankDetails.messages.accountCreateSuccess"));
			}
			setIsAccountModalOpen(false);
			dispatch(fetchBankAccounts({ page: accountPage, page_size: accountPageSize }));
		} catch (err) {
			const errorMessage = err?.message || t("bankDetails.messages.accountSaveError");
			toast.error(errorMessage);
		}
	};

	const handleDeleteAccount = row => {
		const account = row.rawData || row;
		setAccountToDelete(account);
		setConfirmDeleteAccount(true);
	};

	const handleConfirmDeleteAccount = async () => {
		try {
			await dispatch(deleteBankAccount(accountToDelete.id)).unwrap();
			toast.success(t("bankDetails.messages.accountDeleteSuccess"));
			setConfirmDeleteAccount(false);
			setAccountToDelete(null);
		} catch (err) {
			toast.error(err?.message || t("bankDetails.messages.accountDeleteError"));
		}
	};

	const handleToggleAccountActive = async (row, newValue) => {
		const account = row.rawData || row;
		try {
			await dispatch(
				updateBankAccount({
					id: account.id,
					data: { is_active: newValue },
				})
			).unwrap();
			toast.success(
				newValue ? t("bankDetails.messages.accountActivated") : t("bankDetails.messages.accountDeactivated")
			);
			dispatch(fetchBankAccounts({ page: accountPage, page_size: accountPageSize }));
		} catch (err) {
			toast.error(err?.message || t("bankDetails.messages.accountUpdateError"));
		}
	};

	const handleFreezeUnfreeze = async (row, freeze) => {
		const account = row.rawData || row;
		try {
			if (freeze) {
				await dispatch(freezeAccount(account.id)).unwrap();
				toast.success(t("bankDetails.messages.accountFrozen"));
			} else {
				await dispatch(unfreezeAccount(account.id)).unwrap();
				toast.success(t("bankDetails.messages.accountUnfrozen"));
			}
			dispatch(fetchBankAccounts({ page: accountPage, page_size: accountPageSize }));
		} catch (err) {
			toast.error(err?.message || t("bankDetails.messages.freezeError"));
		}
	};

	const handleOpenBalanceUpdate = account => {
		setBalanceUpdateAccount(account);
		setBalanceFormData(BALANCE_UPDATE_INITIAL);
		setIsBalanceModalOpen(true);
	};

	const handleSubmitBalanceUpdate = async () => {
		if (!balanceFormData.amount || parseFloat(balanceFormData.amount) <= 0) {
			toast.error(t("bankDetails.messages.invalidAmount"));
			return;
		}

		try {
			await dispatch(
				updateAccountBalance({
					id: balanceUpdateAccount.id,
					amount: balanceFormData.amount,
					transaction_type: balanceFormData.transaction_type,
					description: balanceFormData.description,
				})
			).unwrap();
			toast.success(t("bankDetails.messages.balanceUpdateSuccess"));
			setIsBalanceModalOpen(false);
			dispatch(fetchBankAccounts({ page: accountPage, page_size: accountPageSize }));
		} catch (err) {
			toast.error(err?.message || t("bankDetails.messages.balanceUpdateError"));
		}
	};

	// Pagination handlers
	const handleBranchPageChange = useCallback(
		newPage => {
			dispatch(setBranchPage(newPage));
		},
		[dispatch]
	);

	const handleAccountPageChange = useCallback(
		newPage => {
			dispatch(setAccountPage(newPage));
		},
		[dispatch]
	);

	// Go back
	const handleGoBack = () => {
		navigate("/banks");
	};

	if (bankLoading && !selectedBank) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<LoadingSpan />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<PageHeader
				title={selectedBank?.bank_name || t("bankDetails.title")}
				subtitle={t("bankDetails.subtitle")}
				icon={<BankHeaderIcon />}
			/>

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Back Button */}
				<Button
					onClick={handleGoBack}
					title={t("bankDetails.backToBanks")}
					icon={<BiArrowBack className="text-lg" />}
					className="mb-6 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
				/>

				{/* Bank Details Header Card */}
				{selectedBank && (
					<Card className="mb-6">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{/* Bank Name & Code */}
							<div className="flex items-start gap-3">
								<div className="p-2 bg-[#28819C]/10 rounded-lg">
									<BsBank2 className="w-6 h-6 text-[#28819C]" />
								</div>
								<div>
									<p className="text-sm text-gray-500">{t("bankDetails.header.bankName")}</p>
									<p className="font-semibold text-gray-900">{selectedBank.bank_name}</p>
									<p className="text-sm text-gray-600 font-mono">{selectedBank.bank_code}</p>
								</div>
							</div>

							{/* Country */}
							<div className="flex items-start gap-3">
								<div className="p-2 bg-green-100 rounded-lg">
									<FiGlobe className="w-6 h-6 text-green-600" />
								</div>
								<div>
									<p className="text-sm text-gray-500">{t("bankDetails.header.country")}</p>
									<p className="font-semibold text-gray-900">{selectedBank.country_name}</p>
									<p className="text-sm text-gray-600">{selectedBank.country_code}</p>
								</div>
							</div>

							{/* SWIFT Code */}
							<div className="flex items-start gap-3">
								<div className="p-2 bg-purple-100 rounded-lg">
									<BsBuilding className="w-6 h-6 text-purple-600" />
								</div>
								<div>
									<p className="text-sm text-gray-500">{t("bankDetails.header.swiftCode")}</p>
									<p className="font-semibold text-gray-900 font-mono">
										{selectedBank.swift_code || "-"}
									</p>
								</div>
							</div>

							{/* Statistics */}
							<div className="flex items-start gap-3">
								<div className="p-2 bg-orange-100 rounded-lg">
									<BsCreditCard2Back className="w-6 h-6 text-orange-600" />
								</div>
								<div>
									<p className="text-sm text-gray-500">{t("bankDetails.header.statistics")}</p>
									<p className="font-semibold text-gray-900">
										{branchCount || selectedBank.total_branches || 0}{" "}
										{t("bankDetails.header.branches")}
									</p>
									<p className="text-sm text-gray-600">
										{accountCount || selectedBank.total_accounts || 0}{" "}
										{t("bankDetails.header.accounts")}
									</p>
								</div>
							</div>
						</div>

						{/* Contact Info Row */}
						{(selectedBank.contact_email || selectedBank.contact_phone || selectedBank.website) && (
							<div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-6">
								{selectedBank.contact_email && (
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<FiMail className="w-4 h-4" />
										<span>{selectedBank.contact_email}</span>
									</div>
								)}
								{selectedBank.contact_phone && (
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<FiPhone className="w-4 h-4" />
										<span>{selectedBank.contact_phone}</span>
									</div>
								)}
								{selectedBank.website && (
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<FiGlobe className="w-4 h-4" />
										<a
											href={selectedBank.website}
											target="_blank"
											rel="noopener noreferrer"
											className="text-[#28819C] hover:underline"
										>
											{selectedBank.website}
										</a>
									</div>
								)}
							</div>
						)}

						{/* Status Badge */}
						<div className="mt-4">
							<span
								className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
									selectedBank.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
								}`}
							>
								{selectedBank.is_active
									? t("bankDetails.status.active")
									: t("bankDetails.status.inactive")}
							</span>
						</div>
					</Card>
				)}

				{/* Tabs */}
				<div className="mb-6">
					<Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
				</div>

				{/* Branches Tab Content */}
				{activeTab === "branches" && (
					<Card>
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-xl font-bold text-gray-900">
								{t("bankDetails.branchesSection.title")}
							</h3>
							<Button
								onClick={handleCreateBranch}
								title={t("bankDetails.branchesSection.addBranch")}
								icon={<BiPlus className="text-xl" />}
								className="bg-[#28819C] hover:bg-[#206b85] text-white"
							/>
						</div>

						{branchesLoading ? (
							<LoadingSpan />
						) : (
							<>
								<Table
									columns={branchColumns}
									data={branches}
									onEdit={handleEditBranch}
									onDelete={handleDeleteBranch}
								/>
								<Pagination
									currentPage={branchPage}
									totalCount={branchCount}
									pageSize={branchPageSize}
									hasNext={branchHasNext}
									hasPrevious={branchHasPrevious}
									onPageChange={handleBranchPageChange}
									onPageSizeChange={setBranchPageSize}
								/>
							</>
						)}
					</Card>
				)}

				{/* Accounts Tab Content */}
				{activeTab === "accounts" && (
					<Card>
						<div className="flex justify-between items-center mb-6">
							<h3 className="text-xl font-bold text-gray-900">
								{t("bankDetails.accountsSection.title")}
							</h3>
							<Button
								onClick={handleCreateAccount}
								title={t("bankDetails.accountsSection.addAccount")}
								icon={<BiPlus className="text-xl" />}
								className="bg-[#28819C] hover:bg-[#206b85] text-white"
							/>
						</div>

						{accountsLoading ? (
							<LoadingSpan />
						) : (
							<>
								<Table
									columns={accountColumns}
									data={accounts}
									onView={handleViewAccount}
									onEdit={handleEditAccount}
									onDelete={handleDeleteAccount}
									customActions={[
										{
											title: t("bankDetails.accountActions.updateBalance"),
											icon: (
												<svg
													className="w-5 h-5 text-green-600"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
											),
											onClick: row => handleOpenBalanceUpdate(row.rawData || row),
										},
									]}
								/>
								<Pagination
									currentPage={accountPage}
									totalCount={accountCount}
									pageSize={accountPageSize}
									hasNext={accountHasNext}
									hasPrevious={accountHasPrevious}
									onPageChange={handleAccountPageChange}
									onPageSizeChange={setAccountPageSize}
								/>
							</>
						)}
					</Card>
				)}
			</div>

			{/* Branch Modal */}
			<SlideUpModal
				isOpen={isBranchModalOpen}
				onClose={() => setIsBranchModalOpen(false)}
				title={editingBranch ? t("bankDetails.branchModal.titleEdit") : t("bankDetails.branchModal.titleAdd")}
				maxWidth="700px"
			>
				<div className="space-y-6 p-2">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("bankDetails.branchForm.branchName")}
							name="branch_name"
							value={branchFormData.branch_name}
							onChange={e => handleBranchInputChange("branch_name", e.target.value)}
							error={branchErrors.branch_name}
							required
						/>
						<FloatingLabelInput
							label={t("bankDetails.branchForm.branchCode")}
							name="branch_code"
							value={branchFormData.branch_code}
							onChange={e => handleBranchInputChange("branch_code", e.target.value)}
							error={branchErrors.branch_code}
							required
						/>
					</div>

					<FloatingLabelInput
						label={t("bankDetails.branchForm.address")}
						name="address"
						value={branchFormData.address}
						onChange={e => handleBranchInputChange("address", e.target.value)}
					/>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<FloatingLabelInput
							label={t("bankDetails.branchForm.city")}
							name="city"
							value={branchFormData.city}
							onChange={e => handleBranchInputChange("city", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("bankDetails.branchForm.state")}
							name="state"
							value={branchFormData.state}
							onChange={e => handleBranchInputChange("state", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("bankDetails.branchForm.postalCode")}
							name="postal_code"
							value={branchFormData.postal_code}
							onChange={e => handleBranchInputChange("postal_code", e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelSelect
							label={t("bankDetails.branchForm.country")}
							name="country"
							value={branchFormData.country}
							onChange={e => handleBranchInputChange("country", e.target.value)}
							options={countries.map(c => ({ value: c.id, label: c.name }))}
							error={branchErrors.country}
							required
						/>
						<FloatingLabelInput
							label={t("bankDetails.branchForm.swiftCode")}
							name="swift_code"
							value={branchFormData.swift_code}
							onChange={e => handleBranchInputChange("swift_code", e.target.value)}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("bankDetails.branchForm.contactPhone")}
							name="contact_phone"
							value={branchFormData.contact_phone}
							onChange={e => handleBranchInputChange("contact_phone", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("bankDetails.branchForm.contactEmail")}
							name="contact_email"
							type="email"
							value={branchFormData.contact_email}
							onChange={e => handleBranchInputChange("contact_email", e.target.value)}
						/>
					</div>

					<FloatingLabelInput
						label={t("bankDetails.branchForm.managerName")}
						name="manager_name"
						value={branchFormData.manager_name}
						onChange={e => handleBranchInputChange("manager_name", e.target.value)}
					/>

					<FloatingLabelTextarea
						label={t("bankDetails.branchForm.notes")}
						name="notes"
						value={branchFormData.notes}
						onChange={e => handleBranchInputChange("notes", e.target.value)}
						rows={3}
					/>

					<div className="flex items-center gap-3">
						<span className="text-sm font-medium text-gray-700">{t("bankDetails.branchForm.active")}</span>
						<Toggle
							checked={branchFormData.is_active}
							onChange={checked => handleBranchInputChange("is_active", checked)}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
						<Button
							onClick={() => setIsBranchModalOpen(false)}
							title={t("bankDetails.modal.cancel")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button
							onClick={handleSubmitBranch}
							disabled={branchActionLoading}
							title={branchActionLoading ? t("bankDetails.modal.saving") : t("bankDetails.modal.save")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Account Modal */}
			<SlideUpModal
				isOpen={isAccountModalOpen}
				onClose={() => setIsAccountModalOpen(false)}
				title={
					editingAccount ? t("bankDetails.accountModal.titleEdit") : t("bankDetails.accountModal.titleAdd")
				}
				maxWidth="800px"
			>
				<div className="space-y-6 p-2">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("bankDetails.accountForm.accountNumber")}
							name="account_number"
							value={accountFormData.account_number}
							onChange={e => handleAccountInputChange("account_number", e.target.value)}
							error={accountErrors.account_number}
							required
						/>
						<FloatingLabelInput
							label={t("bankDetails.accountForm.accountName")}
							name="account_name"
							value={accountFormData.account_name}
							onChange={e => handleAccountInputChange("account_name", e.target.value)}
							error={accountErrors.account_name}
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelSelect
							label={t("bankDetails.accountForm.accountType")}
							name="account_type"
							value={accountFormData.account_type}
							onChange={e => handleAccountInputChange("account_type", e.target.value)}
							options={accountTypeOptions}
						/>
						<FloatingLabelSelect
							label={t("bankDetails.accountForm.transactionType")}
							name="transction_type"
							value={accountFormData.transction_type}
							onChange={e => handleAccountInputChange("transction_type", e.target.value)}
							options={transactionTypeOptions}
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelSelect
							label={t("bankDetails.accountForm.branch")}
							name="branch"
							value={accountFormData.branch}
							onChange={e => handleAccountInputChange("branch", e.target.value)}
							options={branchOptions}
							error={accountErrors.branch}
							required
						/>
						<FloatingLabelSelect
							label={t("bankDetails.accountForm.currency")}
							name="currency"
							value={accountFormData.currency}
							onChange={e => handleAccountInputChange("currency", e.target.value)}
							options={currencyOptions}
							error={accountErrors.currency}
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("bankDetails.accountForm.openingBalance")}
							name="opening_balance"
							type="number"
							step="0.01"
							value={accountFormData.opening_balance}
							onChange={e => handleAccountInputChange("opening_balance", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("bankDetails.accountForm.openingDate")}
							name="opening_date"
							type="date"
							value={accountFormData.opening_date}
							onChange={e => handleAccountInputChange("opening_date", e.target.value)}
						/>
					</div>

					<FloatingLabelInput
						label={t("bankDetails.accountForm.iban")}
						name="iban"
						value={accountFormData.iban}
						onChange={e => handleAccountInputChange("iban", e.target.value)}
					/>

					{/* Cash GL Segments Section */}
					<div className="bg-gray-50 rounded-lg p-4">
						<h4 className="text-sm font-semibold text-gray-800 mb-4">
							{t("bankDetails.accountForm.cashGLSegments") || "Cash GL Segments"}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{segmentTypes.map(st => {
								const options = getSegmentOptions(st.id);
								return (
									<div key={`cash-gl-${st.id}`} className="relative">
										<label className="block text-sm font-medium text-gray-600 mb-1">
											{st.name || st.segment_name || `Segment ${st.id}`}
										</label>
										<select
											value={getSegmentValue("cash_GL_segments", st.id)}
											onChange={e =>
												handleSegmentChange("cash_GL_segments", st.id, e.target.value)
											}
											className="w-full h-11 px-3 pe-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
										>
											<option value="">
												{t("bankDetails.accountForm.selectSegment") || "Select..."}
											</option>
											{options.map(opt => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
										<FaChevronDown className="absolute top-[38px] end-3 w-3 h-3 text-gray-400 pointer-events-none" />
									</div>
								);
							})}
						</div>
					</div>

					{/* Cash Clearing GL Segments Section */}
					<div className="bg-gray-50 rounded-lg p-4">
						<h4 className="text-sm font-semibold text-gray-800 mb-4">
							{t("bankDetails.accountForm.cashClearingGLSegments") || "Cash Clearing GL Segments"}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{segmentTypes.map(st => {
								const options = getSegmentOptions(st.id);
								return (
									<div key={`cash-clearing-${st.id}`} className="relative">
										<label className="block text-sm font-medium text-gray-600 mb-1">
											{st.name || st.segment_name || `Segment ${st.id}`}
										</label>
										<select
											value={getSegmentValue("cash_clearing_GL_segments", st.id)}
											onChange={e =>
												handleSegmentChange("cash_clearing_GL_segments", st.id, e.target.value)
											}
											className="w-full h-11 px-3 pe-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
										>
											<option value="">
												{t("bankDetails.accountForm.selectSegment") || "Select..."}
											</option>
											{options.map(opt => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
										<FaChevronDown className="absolute top-[38px] end-3 w-3 h-3 text-gray-400 pointer-events-none" />
									</div>
								);
							})}
						</div>
					</div>

					<FloatingLabelTextarea
						label={t("bankDetails.accountForm.description")}
						name="description"
						value={accountFormData.description}
						onChange={e => handleAccountInputChange("description", e.target.value)}
						rows={3}
					/>

					<div className="flex items-center gap-3">
						<span className="text-sm font-medium text-gray-700">{t("bankDetails.accountForm.active")}</span>
						<Toggle
							checked={accountFormData.is_active}
							onChange={checked => handleAccountInputChange("is_active", checked)}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
						<Button
							onClick={() => setIsAccountModalOpen(false)}
							title={t("bankDetails.modal.cancel")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button
							onClick={handleSubmitAccount}
							disabled={accountActionLoading}
							title={accountActionLoading ? t("bankDetails.modal.saving") : t("bankDetails.modal.save")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Balance Update Modal */}
			<SlideUpModal
				isOpen={isBalanceModalOpen}
				onClose={() => setIsBalanceModalOpen(false)}
				title={t("bankDetails.balanceModal.title")}
				maxWidth="500px"
			>
				<div className="space-y-6 p-2">
					{balanceUpdateAccount && (
						<div className="bg-gray-50 rounded-lg p-4">
							<p className="text-sm text-gray-600">{t("bankDetails.balanceModal.account")}</p>
							<p className="font-semibold text-gray-900">{balanceUpdateAccount.account_name}</p>
							<p className="text-sm text-gray-600 font-mono">{balanceUpdateAccount.account_number}</p>
							<p className="text-lg font-bold text-green-600 mt-2">
								{t("bankDetails.balanceModal.currentBalance")}: {balanceUpdateAccount.currency_code}{" "}
								{parseFloat(balanceUpdateAccount.current_balance || 0).toLocaleString(undefined, {
									minimumFractionDigits: 2,
								})}
							</p>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("bankDetails.balanceModal.amount")}
							name="amount"
							type="number"
							step="0.01"
							min="0"
							value={balanceFormData.amount}
							onChange={e => setBalanceFormData(prev => ({ ...prev, amount: e.target.value }))}
							required
						/>
						<FloatingLabelSelect
							label={t("bankDetails.balanceModal.transactionType")}
							name="transaction_type"
							value={balanceFormData.transaction_type}
							onChange={e => setBalanceFormData(prev => ({ ...prev, transaction_type: e.target.value }))}
							options={[
								{ value: "INCREASE", label: t("bankDetails.balanceModal.increase") },
								{ value: "DECREASE", label: t("bankDetails.balanceModal.decrease") },
							]}
						/>
					</div>

					<FloatingLabelTextarea
						label={t("bankDetails.balanceModal.description")}
						name="description"
						value={balanceFormData.description}
						onChange={e => setBalanceFormData(prev => ({ ...prev, description: e.target.value }))}
						rows={3}
					/>

					<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
						<Button
							onClick={() => setIsBalanceModalOpen(false)}
							title={t("bankDetails.modal.cancel")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button
							onClick={handleSubmitBalanceUpdate}
							disabled={accountActionLoading}
							title={t("bankDetails.balanceModal.update")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* View Account Details Modal */}
			<SlideUpModal
				isOpen={isViewAccountModalOpen}
				onClose={() => {
					setIsViewAccountModalOpen(false);
					setViewingAccount(null);
				}}
				title={t("bankDetails.viewAccountModal.title")}
				maxWidth="600px"
			>
				{viewingAccount && (
					<div className="space-y-4 p-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("bankDetails.accountForm.accountNumber")}
								</label>
								<p className="mt-1 text-lg font-mono font-semibold text-gray-900">
									{viewingAccount.account_number}
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("bankDetails.accountForm.accountName")}
								</label>
								<p className="mt-1 text-lg font-semibold text-gray-900">
									{viewingAccount.account_name}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("bankDetails.accountForm.accountType")}
								</label>
								<p className="mt-1 font-semibold text-gray-900">
									{viewingAccount.account_type_display}
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("bankDetails.accountForm.currency")}
								</label>
								<p className="mt-1 font-semibold text-gray-900">{viewingAccount.currency_code}</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("bankDetails.balanceModal.currentBalance")}
								</label>
								<p className="mt-1 text-xl font-bold text-green-600">
									{parseFloat(viewingAccount.current_balance || 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("bankDetails.accountForm.openingBalance")}
								</label>
								<p className="mt-1 font-semibold text-gray-900">
									{parseFloat(viewingAccount.opening_balance || 0).toLocaleString(undefined, {
										minimumFractionDigits: 2,
									})}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("bankDetails.accountTable.branch")}
								</label>
								<p className="mt-1 font-semibold text-gray-900">{viewingAccount.branch_name}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500">
									{t("bankDetails.viewAccountModal.bank")}
								</label>
								<p className="mt-1 font-semibold text-gray-900">{viewingAccount.bank_name}</p>
							</div>
						</div>

						<div className="pt-4 border-t border-gray-200">
							<div className="flex items-center gap-4">
								<span
									className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
										viewingAccount.is_active
											? "bg-green-100 text-green-800"
											: "bg-red-100 text-red-800"
									}`}
								>
									{viewingAccount.is_active
										? t("bankDetails.status.active")
										: t("bankDetails.status.inactive")}
								</span>
								{viewingAccount.is_frozen && (
									<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
										{t("bankDetails.status.frozen")}
									</span>
								)}
							</div>
						</div>

						{viewingAccount.description && (
							<div className="pt-4">
								<label className="block text-sm font-medium text-gray-500">
									{t("bankDetails.accountForm.description")}
								</label>
								<p className="mt-1 text-gray-700">{viewingAccount.description}</p>
							</div>
						)}
					</div>
				)}
			</SlideUpModal>

			{/* Delete Branch Confirmation */}
			<ConfirmModal
				isOpen={confirmDeleteBranch}
				onClose={() => {
					setConfirmDeleteBranch(false);
					setBranchToDelete(null);
				}}
				onConfirm={handleConfirmDeleteBranch}
				title={t("bankDetails.deleteBranchConfirm.title")}
				message={t("bankDetails.deleteBranchConfirm.message", {
					name: branchToDelete?.branch_name,
				})}
				confirmText={t("bankDetails.deleteBranchConfirm.confirm")}
				cancelText={t("bankDetails.deleteBranchConfirm.cancel")}
			/>

			{/* Delete Account Confirmation */}
			<ConfirmModal
				isOpen={confirmDeleteAccount}
				onClose={() => {
					setConfirmDeleteAccount(false);
					setAccountToDelete(null);
				}}
				onConfirm={handleConfirmDeleteAccount}
				title={t("bankDetails.deleteAccountConfirm.title")}
				message={t("bankDetails.deleteAccountConfirm.message", {
					name: accountToDelete?.account_name,
				})}
				confirmText={t("bankDetails.deleteAccountConfirm.confirm")}
				cancelText={t("bankDetails.deleteAccountConfirm.cancel")}
			/>
		</div>
	);
};

export default BankDetailsPage;
