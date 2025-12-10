import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Card from "../components/shared/Card";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Toggle from "../components/shared/Toggle";
import {
	fetchSuppliers,
	createSupplier,
	updateSupplier,
	deleteSupplier,
	markPreferred,
	removePreferred,
	putOnHold,
	removeHold,
	blacklistSupplier,
	removeBlacklist,
} from "../store/suppliersSlice";
import { fetchCurrencies } from "../store/currenciesSlice";
import LoadingSpan from "../components/shared/LoadingSpan";

const SupplierIcon = () => (
	<svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g opacity="0.5">
			<path d="M14 2L2 8V20L14 26L26 20V8L14 2Z" stroke="#D3D3D3" strokeWidth="2" strokeLinejoin="round" />
			<path
				d="M14 14C15.6569 14 17 12.6569 17 11C17 9.34315 15.6569 8 14 8C12.3431 8 11 9.34315 11 11C11 12.6569 12.3431 14 14 14Z"
				fill="#D3D3D3"
			/>
			<path
				d="M8 22C8 19.2386 10.2386 17 13 17H15C17.7614 17 20 19.2386 20 22"
				stroke="#D3D3D3"
				strokeWidth="2"
			/>
		</g>
	</svg>
);

const SupplierActionsMenu = ({
	supplier,
	onEdit,
	onTogglePreferred,
	onToggleHold,
	onToggleBlacklist,
	onDelete,
	t,
	isRtl,
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const handleClickOutside = e => {
		if (!e.target.closest(".actions-menu")) {
			setIsOpen(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("click", handleClickOutside);
			return () => document.removeEventListener("click", handleClickOutside);
		}
	}, [isOpen]);

	return (
		<div className="relative actions-menu">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
				aria-label="Actions"
			>
				<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
					<circle cx="10" cy="4" r="1.5" />
					<circle cx="10" cy="10" r="1.5" />
					<circle cx="10" cy="16" r="1.5" />
				</svg>
			</button>

			{isOpen && (
				<div
					className={`absolute ${
						isRtl ? "left-0" : "right-0"
					} mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50`}
				>
					<div className="py-1">
						<button
							onClick={() => {
								onEdit();
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
								<path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
							</svg>
							{t("suppliers.actions.edit")}
						</button>

						<div className="border-t border-gray-200 my-1"></div>

						<button
							onClick={() => {
								onTogglePreferred();
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
						>
							<span className="text-lg">{supplier.is_preferred ? "★" : "☆"}</span>
							{supplier.is_preferred
								? t("suppliers.actions.removePreferred")
								: t("suppliers.actions.markPreferred")}
						</button>

						<button
							onClick={() => {
								onToggleHold();
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
						>
							<span className="text-lg">{supplier.is_on_hold ? "🔓" : "🔒"}</span>
							{supplier.is_on_hold ? t("suppliers.actions.removeHold") : t("suppliers.actions.putOnHold")}
						</button>

						<button
							onClick={() => {
								onToggleBlacklist();
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-start text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
						>
							<span className="text-lg">{supplier.is_blacklisted ? "✓" : "🚫"}</span>
							{supplier.is_blacklisted
								? t("suppliers.actions.removeBlacklist")
								: t("suppliers.actions.blacklist")}
						</button>

						<div className="border-t border-gray-200 my-1"></div>

						<button
							onClick={() => {
								onDelete();
								setIsOpen(false);
							}}
							className="w-full px-4 py-2 text-start text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
								<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
								<path
									fillRule="evenodd"
									d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
								/>
							</svg>
							{t("suppliers.actions.delete")}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

const SuppliersPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const { suppliers, loading, error } = useSelector(state => state.suppliers);
	const { currencies } = useSelector(state => state.currencies);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [editingSupplier, setEditingSupplier] = useState(null);
	const [supplierToDelete, setSupplierToDelete] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");

	const [supplierForm, setSupplierForm] = useState({
		code: "",
		name: "",
		legal_name: "",
		email: "",
		phone: "",
		website: "",
		country: "US",
		currency: "",
		tax_id: "",
		vendor_category: "SERVICES",
		payment_terms: "NET30",
		credit_limit: "",
		address_line1: "",
		address_line2: "",
		city: "",
		state: "",
		postal_code: "",
		bank_name: "",
		bank_account_number: "",
		bank_swift_code: "",
		bank_iban: "",
		bank_routing_number: "",
		is_active: true,
		is_preferred: false,
		compliance_verified: false,
		kyc_verified: false,
		performance_score: "",
		risk_rating: "MEDIUM",
	});

	const vendorCategories = [
		{ value: "GOODS", label: t("suppliers.enums.goods") },
		{ value: "SERVICES", label: t("suppliers.enums.services") },
	];

	const paymentTerms = [
		{ value: "NET15", label: "Net 15 Days" },
		{ value: "NET30", label: "Net 30 Days" },
		{ value: "NET45", label: "Net 45 Days" },
		{ value: "NET60", label: "Net 60 Days" },
		{ value: "NET90", label: "Net 90 Days" },
		{ value: "COD", label: "Cash on Delivery" },
		{ value: "ADVANCE", label: "Advance Payment" },
	];

	const riskRatings = [
		{ value: "LOW", label: t("suppliers.enums.low") },
		{ value: "MEDIUM", label: t("suppliers.enums.medium") },
		{ value: "HIGH", label: t("suppliers.enums.high") },
	];

	const countries = [
		{ value: "AE", label: "United Arab Emirates" },
		{ value: "US", label: "United States" },
		{ value: "GB", label: "United Kingdom" },
		{ value: "DE", label: "Germany" },
		{ value: "FR", label: "France" },
		{ value: "IT", label: "Italy" },
		{ value: "ES", label: "Spain" },
		{ value: "SA", label: "Saudi Arabia" },
		{ value: "IN", label: "India" },
		{ value: "EG", label: "Egypt" },
	];

	// Update browser title
	useEffect(() => {
		document.title = `${t("suppliers.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	const refreshSuppliers = useCallback(() => dispatch(fetchSuppliers()), [dispatch]);

	useEffect(() => {
		refreshSuppliers();
		dispatch(fetchCurrencies());
	}, [refreshSuppliers, dispatch]);

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	const handleOpenModal = (supplier = null) => {
		if (supplier) {
			setEditingSupplier(supplier);
			setSupplierForm({
				code: supplier.code || "",
				name: supplier.name || "",
				legal_name: supplier.legal_name || "",
				email: supplier.email || "",
				phone: supplier.phone || "",
				website: supplier.website || "",
				country: supplier.country || "US",
				currency: supplier.currency ? supplier.currency.toString() : "",
				tax_id: supplier.tax_id || "",
				vendor_category: supplier.vendor_category || "SERVICES",
				payment_terms: supplier.payment_terms || "NET30",
				credit_limit: supplier.credit_limit ? supplier.credit_limit.toString() : "",
				address_line1: supplier.address_line1 || "",
				address_line2: supplier.address_line2 || "",
				city: supplier.city || "",
				state: supplier.state || "",
				postal_code: supplier.postal_code || "",
				bank_name: supplier.bank_name || "",
				bank_account_number: supplier.bank_account_number || "",
				bank_swift_code: supplier.bank_swift_code || "",
				bank_iban: supplier.bank_iban || "",
				bank_routing_number: supplier.bank_routing_number || "",
				is_active: supplier.is_active !== undefined ? supplier.is_active : true,
				is_preferred: supplier.is_preferred || false,
				compliance_verified: supplier.compliance_verified || false,
				kyc_verified: supplier.kyc_verified || false,
				performance_score: supplier.performance_score ? supplier.performance_score.toString() : "",
				risk_rating: supplier.risk_rating || "MEDIUM",
			});
		} else {
			setEditingSupplier(null);
			setSupplierForm({
				code: "",
				name: "",
				legal_name: "",
				email: "",
				phone: "",
				website: "",
				country: "US",
				currency: "",
				tax_id: "",
				vendor_category: "SERVICES",
				payment_terms: "NET30",
				credit_limit: "",
				address_line1: "",
				address_line2: "",
				city: "",
				state: "",
				postal_code: "",
				bank_name: "",
				bank_account_number: "",
				bank_swift_code: "",
				bank_iban: "",
				bank_routing_number: "",
				is_active: true,
				is_preferred: false,
				compliance_verified: false,
				kyc_verified: false,
				performance_score: "",
				risk_rating: "MEDIUM",
			});
		}
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingSupplier(null);
		setSupplierForm({
			code: "",
			name: "",
			legal_name: "",
			email: "",
			phone: "",
			website: "",
			country: "US",
			currency: "",
			tax_id: "",
			vendor_category: "SERVICES",
			payment_terms: "NET30",
			credit_limit: "",
			address_line1: "",
			address_line2: "",
			city: "",
			state: "",
			postal_code: "",
			bank_name: "",
			bank_account_number: "",
			bank_swift_code: "",
			bank_iban: "",
			bank_routing_number: "",
			is_active: true,
			is_preferred: false,
			compliance_verified: false,
			kyc_verified: false,
			performance_score: "",
			risk_rating: "MEDIUM",
		});
	};

	const handleChange = e => {
		const { name, value } = e.target;
		setSupplierForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async e => {
		e.preventDefault();

		if (!supplierForm.name.trim()) {
			toast.error(t("suppliers.messages.nameRequired"));
			return;
		}

		// Format data for API - ensure proper data types
		const formattedData = {
			...supplierForm,
			currency: supplierForm.currency ? parseInt(supplierForm.currency) : null,
			credit_limit: supplierForm.credit_limit ? parseFloat(supplierForm.credit_limit) : null,
			performance_score: supplierForm.performance_score ? parseFloat(supplierForm.performance_score) : null,
		};

		// Remove empty strings and null values for optional fields
		Object.keys(formattedData).forEach(key => {
			if (formattedData[key] === "" || formattedData[key] === null) {
				// Keep boolean fields and required fields
				if (
					typeof formattedData[key] !== "boolean" &&
					![
						"name",
						"country",
						"vendor_category",
						"payment_terms",
						"risk_rating",
						"is_active",
						"is_preferred",
						"compliance_verified",
						"kyc_verified",
					].includes(key)
				) {
					delete formattedData[key];
				}
			}
		});

		try {
			if (editingSupplier) {
				await dispatch(updateSupplier({ id: editingSupplier.id, supplierData: formattedData })).unwrap();
				toast.success(t("suppliers.messages.updated"));
			} else {
				await dispatch(createSupplier(formattedData)).unwrap();
				toast.success(t("suppliers.messages.created"));
			}
			await refreshSuppliers();
			handleCloseModal();
		} catch (err) {
			console.error("Error saving supplier:", err);
			toast.error(err || t("suppliers.messages.error"));
		}
	};

	const handleDeleteClick = supplier => {
		setSupplierToDelete(supplier);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!supplierToDelete) return;

		try {
			await dispatch(deleteSupplier(supplierToDelete.id)).unwrap();
			toast.success(t("suppliers.messages.deleted"));
			await refreshSuppliers();
			setIsDeleteModalOpen(false);
			setSupplierToDelete(null);
		} catch (err) {
			toast.error(err || t("suppliers.messages.error"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setSupplierToDelete(null);
	};

	const handleTogglePreferred = async supplier => {
		try {
			if (supplier.is_preferred) {
				await dispatch(removePreferred(supplier.id)).unwrap();
				toast.success(t("suppliers.messages.preferredUpdated"));
			} else {
				await dispatch(markPreferred(supplier.id)).unwrap();
				toast.success(t("suppliers.messages.preferredUpdated"));
			}
			await refreshSuppliers();
		} catch (err) {
			toast.error(err || t("suppliers.messages.error"));
		}
	};

	const handleToggleHold = async supplier => {
		try {
			if (supplier.is_on_hold) {
				await dispatch(removeHold(supplier.id)).unwrap();
				toast.success(t("suppliers.messages.holdUpdated"));
			} else {
				await dispatch(putOnHold(supplier.id)).unwrap();
				toast.success(t("suppliers.messages.holdUpdated"));
			}
			await refreshSuppliers();
		} catch (err) {
			toast.error(err || t("suppliers.messages.error"));
		}
	};

	const handleToggleBlacklist = async supplier => {
		try {
			if (supplier.is_blacklisted) {
				await dispatch(removeBlacklist(supplier.id)).unwrap();
				toast.success(t("suppliers.messages.blacklistUpdated"));
			} else {
				await dispatch(blacklistSupplier(supplier.id)).unwrap();
				toast.success(t("suppliers.messages.blacklistUpdated"));
			}
			await refreshSuppliers();
		} catch (err) {
			toast.error(err || t("suppliers.messages.error"));
		}
	};

	const columns = [
		{
			header: t("suppliers.table.id"),
			accessor: "id",
			sortable: true,
			width: "80px",
			render: value => <span className="font-semibold text-gray-900">{value}</span>,
		},
		{
			header: t("suppliers.table.code"),
			accessor: "code",
			sortable: true,
			width: "120px",
			render: value => <span className="font-semibold text-gray-700">{value || "-"}</span>,
		},
		{
			header: t("suppliers.table.name"),
			accessor: "name",
			sortable: true,
			render: value => <span className="font-semibold text-gray-900">{value}</span>,
		},
		{
			header: t("suppliers.table.email"),
			accessor: "email",
			sortable: true,
			render: value => <span className="text-gray-600 text-sm">{value || "-"}</span>,
		},
		{
			header: t("suppliers.table.phone"),
			accessor: "phone",
			sortable: true,
			width: "140px",
			render: value => (
				<span className="text-gray-600 text-sm" dir="ltr">
					{value || "-"}
				</span>
			),
		},
		{
			header: t("suppliers.table.country"),
			accessor: "country",
			sortable: true,
			width: "100px",
			render: value => <span className="font-medium text-gray-700">{value}</span>,
		},
		{
			header: t("suppliers.table.city"),
			accessor: "city",
			sortable: true,
			width: "120px",
			render: value => <span className="text-gray-600">{value || "-"}</span>,
		},
		{
			header: t("suppliers.table.address"),
			accessor: "address_line1",
			render: (value, row) => {
				const address = [value, row.address_line2, row.city, row.state, row.postal_code]
					.filter(Boolean)
					.join(", ");
				return <span className="text-gray-600 text-sm">{address || "-"}</span>;
			},
		},
		{
			header: t("suppliers.table.currency"),
			accessor: "currency",
			sortable: true,
			width: "100px",
			render: (value, row) => {
				const currencyCode = value || row?.currency_code || "-";
				return <span className="font-medium text-[#28819C]">{currencyCode}</span>;
			},
		},
		{
			header: t("suppliers.table.category"),
			accessor: "vendor_category_display",
			sortable: true,
			width: "150px",
			render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
		},
		{
			header: t("suppliers.table.onboarding"),
			accessor: "onboarding_status",
			sortable: true,
			width: "140px",
			render: value => {
				const colors = {
					PENDING: "bg-yellow-100 text-yellow-800",
					IN_PROGRESS: "bg-blue-100 text-blue-800",
					COMPLETED: "bg-green-100 text-green-800",
				};
				return (
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
							colors[value] || "bg-gray-100 text-gray-800"
						}`}
					>
						{t(`suppliers.enums.${value?.toLowerCase()}`, value)}
					</span>
				);
			},
		},
		{
			header: t("suppliers.table.status"),
			accessor: "status",
			sortable: true,
			width: "100px",
			render: value => (
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
						value === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
					}`}
				>
					{t(`suppliers.enums.${value?.toLowerCase()}`, value)}
				</span>
			),
		},
		{
			header: t("suppliers.table.preferred"),
			accessor: "is_preferred",
			width: "100px",
			render: value => (
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
						value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
					}`}
				>
					{value ? `⭐ ${t("suppliers.enums.yes")}` : t("suppliers.enums.no")}
				</span>
			),
		},
		{
			header: t("suppliers.table.onHold"),
			accessor: "is_on_hold",
			width: "100px",
			render: value =>
				value ? (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
						🔒 {t("suppliers.enums.yes")}
					</span>
				) : (
					<span className="text-gray-400">-</span>
				),
		},
		{
			header: t("suppliers.table.blacklisted"),
			accessor: "is_blacklisted",
			width: "110px",
			render: value =>
				value ? (
					<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
						🚫 {t("suppliers.enums.yes")}
					</span>
				) : (
					<span className="text-gray-400">-</span>
				),
		},
		{
			header: t("suppliers.table.canTransact"),
			accessor: "can_transact",
			width: "120px",
			render: value => (
				<span
					className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
						value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
					}`}
				>
					{value ? `✓ ${t("suppliers.enums.yes")}` : `✗ ${t("suppliers.enums.no")}`}
				</span>
			),
		},
		{
			header: t("suppliers.table.score"),
			accessor: "performance_score",
			sortable: true,
			width: "120px",
			render: value => {
				if (value === null || value === undefined) return <span className="text-gray-400">-</span>;
				const color = value >= 80 ? "text-green-600" : value >= 60 ? "text-yellow-600" : "text-red-600";
				return <span className={`font-semibold ${color}`}>{value}%</span>;
			},
		},
		{
			header: t("suppliers.table.actions"),
			accessor: "Actions",
			width: "80px",
			render: (_value, supplier) => (
				<SupplierActionsMenu
					supplier={supplier}
					onEdit={() => handleOpenModal(supplier)}
					onTogglePreferred={() => handleTogglePreferred(supplier)}
					onToggleHold={() => handleToggleHold(supplier)}
					onToggleBlacklist={() => handleToggleBlacklist(supplier)}
					onDelete={() => handleDeleteClick(supplier)}
					t={t}
					isRtl={isRtl}
				/>
			),
		},
	];

	const filteredSuppliers = suppliers.filter(
		supplier =>
			supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			supplier.city?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="">
			<ToastContainer
				position={isRtl ? "top-left" : "top-right"}
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop={false}
				closeOnClick
				rtl={isRtl}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				theme="light"
			/>
			<PageHeader title={t("suppliers.title")} subtitle={t("suppliers.subtitle")} icon={<SupplierIcon />} />

			<Card>
				<div className="mb-4 flex justify-between items-center flex-wrap gap-4">
					<input
						type="text"
						placeholder={t("suppliers.actions.search")}
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5f7a] max-w-md ${
							isRtl ? "text-right" : "text-left"
						}`}
					/>
					<button
						onClick={() => handleOpenModal()}
						className="px-6 py-2 bg-[#0d5f7a] text-white rounded-lg hover:bg-[#0a4a5e] transition-colors font-medium"
					>
						{t("suppliers.actions.add")}
					</button>
				</div>

				{loading ? (
					<LoadingSpan />
				) : (
					<Table
						columns={columns}
						data={filteredSuppliers}
						rowsPerPage={10}
						emptyMessage={t("suppliers.messages.error")}
					/>
				)}
			</Card>

			{/* Add/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingSupplier ? t("suppliers.modals.editTitle") : t("suppliers.modals.addTitle")}
			>
				<form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
					{/* Basic Information */}
					<div>
						<h4 className="text-sm font-semibold text-gray-700 mb-3">{t("suppliers.form.basicInfo")}</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("suppliers.form.supplierCode")}
								name="code"
								type="text"
								value={supplierForm.code}
								onChange={handleChange}
								placeholder="e.g., SUP-US-001"
							/>

							<FloatingLabelInput
								label={`${t("suppliers.form.supplierName")} *`}
								name="name"
								type="text"
								value={supplierForm.name}
								onChange={handleChange}
								required
								placeholder={t("suppliers.form.placeholders.enterName")}
							/>

							<FloatingLabelInput
								label={t("suppliers.form.legalName")}
								name="legal_name"
								type="text"
								value={supplierForm.legal_name}
								onChange={handleChange}
								placeholder={t("suppliers.form.placeholders.enterName")}
							/>

							<FloatingLabelInput
								label={t("suppliers.table.email")}
								name="email"
								type="email"
								value={supplierForm.email}
								onChange={handleChange}
								placeholder={t("suppliers.form.placeholders.enterEmail")}
							/>

							<FloatingLabelInput
								label={t("suppliers.table.phone")}
								name="phone"
								type="text"
								value={supplierForm.phone}
								onChange={handleChange}
								placeholder="e.g., +1-555-123-4567"
							/>

							<FloatingLabelInput
								label={t("suppliers.form.website")}
								name="website"
								type="url"
								value={supplierForm.website}
								onChange={handleChange}
								placeholder="https://www.example.com"
							/>

							<FloatingLabelSelect
								label={`${t("suppliers.table.category")} *`}
								name="vendor_category"
								value={supplierForm.vendor_category}
								onChange={handleChange}
								options={vendorCategories}
								placeholder={t("suppliers.form.placeholders.select")}
								required
							/>

							<FloatingLabelInput
								label={t("suppliers.form.taxId")}
								name="tax_id"
								type="text"
								value={supplierForm.tax_id}
								onChange={handleChange}
								placeholder="e.g., 12-3456789"
							/>
						</div>
					</div>

					{/* Financial Information */}
					<div className=" pt-4">
						<h4 className="text-sm font-semibold text-gray-700 mb-3">
							{t("suppliers.form.financialInfo")}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("suppliers.table.currency")}
								name="currency"
								value={supplierForm.currency}
								onChange={handleChange}
								options={currencies.map(curr => ({
									value: curr.id,
									label: `${curr.code} - ${curr.name}`,
								}))}
								placeholder={t("suppliers.form.placeholders.select")}
							/>

							<FloatingLabelSelect
								label={t("suppliers.form.paymentTerms")}
								name="payment_terms"
								value={supplierForm.payment_terms}
								onChange={handleChange}
								options={paymentTerms}
								placeholder={t("suppliers.form.placeholders.select")}
							/>

							<FloatingLabelInput
								label={t("suppliers.form.creditLimit")}
								name="credit_limit"
								type="number"
								step="0.01"
								value={supplierForm.credit_limit}
								onChange={handleChange}
								placeholder="e.g., 100000.00"
							/>

							<FloatingLabelInput
								label={t("suppliers.form.performanceScore")}
								name="performance_score"
								type="number"
								step="0.01"
								min="0"
								max="100"
								value={supplierForm.performance_score}
								onChange={handleChange}
								placeholder="e.g., 92.00"
							/>

							<FloatingLabelSelect
								label={t("suppliers.form.riskRating")}
								name="risk_rating"
								value={supplierForm.risk_rating}
								onChange={handleChange}
								options={riskRatings}
								placeholder={t("suppliers.form.placeholders.select")}
							/>
						</div>
					</div>

					{/* Address Information */}
					<div className=" pt-4">
						<h4 className="text-sm font-semibold text-gray-700 mb-3">{t("suppliers.form.addressInfo")}</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={`${t("suppliers.table.country")} *`}
								name="country"
								value={supplierForm.country}
								onChange={handleChange}
								options={countries}
								placeholder={t("suppliers.form.placeholders.select")}
								required
							/>

							<FloatingLabelInput
								label={t("suppliers.table.city")}
								name="city"
								type="text"
								value={supplierForm.city}
								onChange={handleChange}
								placeholder={t("suppliers.table.city")}
							/>

							<FloatingLabelInput
								label={t("suppliers.form.state")}
								name="state"
								type="text"
								value={supplierForm.state}
								onChange={handleChange}
								placeholder={t("suppliers.form.state")}
							/>

							<FloatingLabelInput
								label={t("suppliers.form.postalCode")}
								name="postal_code"
								type="text"
								value={supplierForm.postal_code}
								onChange={handleChange}
								placeholder={t("suppliers.form.postalCode")}
							/>

							<FloatingLabelInput
								label={t("suppliers.form.addressLine1")}
								name="address_line1"
								type="text"
								value={supplierForm.address_line1}
								onChange={handleChange}
								placeholder={t("suppliers.table.address")}
							/>

							<FloatingLabelInput
								label={t("suppliers.form.addressLine2")}
								name="address_line2"
								type="text"
								value={supplierForm.address_line2}
								onChange={handleChange}
								placeholder={t("suppliers.form.addressLine2")}
							/>
						</div>
					</div>

					{/* Bank Information */}
					<div className=" pt-4">
						<h4 className="text-sm font-semibold text-gray-700 mb-3">{t("suppliers.form.bankInfo")}</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("suppliers.form.bankName")}
								name="bank_name"
								type="text"
								value={supplierForm.bank_name}
								onChange={handleChange}
								placeholder="e.g., Chase Bank"
							/>

							<FloatingLabelInput
								label={t("suppliers.form.accountNumber")}
								name="bank_account_number"
								type="text"
								value={supplierForm.bank_account_number}
								onChange={handleChange}
								placeholder="Enter account number"
							/>

							<FloatingLabelInput
								label={t("suppliers.form.swiftCode")}
								name="bank_swift_code"
								type="text"
								value={supplierForm.bank_swift_code}
								onChange={handleChange}
								placeholder="e.g., CHASUS33"
							/>

							<FloatingLabelInput
								label={t("suppliers.form.iban")}
								name="bank_iban"
								type="text"
								value={supplierForm.bank_iban}
								onChange={handleChange}
								placeholder="e.g., US12CHAS0001987654321"
							/>

							<FloatingLabelInput
								label={t("suppliers.form.routingNumber")}
								name="bank_routing_number"
								type="text"
								value={supplierForm.bank_routing_number}
								onChange={handleChange}
								placeholder="e.g., 021000021"
							/>
						</div>
					</div>

					{/* Status & Verification */}
					<div className=" pt-4">
						<h4 className="text-sm font-semibold text-gray-700 mb-3">
							{t("suppliers.form.statusVerification")}
						</h4>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex items-center gap-3">
								<Toggle
									checked={supplierForm.is_active}
									onChange={checked => setSupplierForm(prev => ({ ...prev, is_active: checked }))}
								/>
								<label className="text-sm font-medium text-gray-700">
									{t("suppliers.form.activeSupplier")}
								</label>
							</div>

							<div className="flex items-center gap-3">
								<Toggle
									checked={supplierForm.is_preferred}
									onChange={checked => setSupplierForm(prev => ({ ...prev, is_preferred: checked }))}
								/>
								<label className="text-sm font-medium text-gray-700">
									{t("suppliers.form.preferredSupplier")}
								</label>
							</div>

							<div className="flex items-center gap-3">
								<Toggle
									checked={supplierForm.compliance_verified}
									onChange={checked =>
										setSupplierForm(prev => ({ ...prev, compliance_verified: checked }))
									}
								/>
								<label className="text-sm font-medium text-gray-700">
									{t("suppliers.form.complianceVerified")}
								</label>
							</div>

							<div className="flex items-center gap-3">
								<Toggle
									checked={supplierForm.kyc_verified}
									onChange={checked => setSupplierForm(prev => ({ ...prev, kyc_verified: checked }))}
								/>
								<label className="text-sm font-medium text-gray-700">
									{t("suppliers.form.kycVerified")}
								</label>
							</div>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4  sticky ">
						<button
							type="button"
							onClick={handleCloseModal}
							className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						>
							{t("suppliers.actions.cancel")}
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-6 py-2 bg-[#0d5f7a] text-white rounded-lg hover:bg-[#0a4a5e] transition-colors disabled:opacity-50"
						>
							{loading
								? t("suppliers.actions.saving")
								: editingSupplier
								? t("suppliers.actions.update")
								: t("suppliers.actions.create")}
						</button>
					</div>
				</form>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("suppliers.modals.deleteTitle")}
				message={t("suppliers.modals.deleteMessage", { name: supplierToDelete?.name })}
				confirmText={t("suppliers.actions.delete")}
				cancelText={t("suppliers.actions.cancel")}
			/>
		</div>
	);
};

export default SuppliersPage;
