import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import ConfirmModal from "../components/shared/ConfirmModal";
import Button from "../components/shared/Button";
import LoadingSpan from "../components/shared/LoadingSpan";

import {
	fetchCountries,
	createCountry,
	updateCountry,
	deleteCountry,
	clearError,
} from "../store/countriesSlice";

import { BiPlusCircle } from "react-icons/bi";
import { FaGlobeAmericas } from "react-icons/fa";

const INITIAL_FORM_STATE = {
	code: "",
	name: "",
};

const CountryPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const { countries = [], loading, error, creating, updating, deleting, actionError } = useSelector(
		state => state.countries || {}
	);

	// Modal states
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [selectedCountry, setSelectedCountry] = useState(null);

	// Form state
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [formErrors, setFormErrors] = useState({});

	// Search state
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch countries on mount
	useEffect(() => {
		dispatch(fetchCountries());
	}, [dispatch]);

	// Show error toast
	useEffect(() => {
		if (error || actionError) {
			const errorMsg = typeof actionError === "object" 
				? Object.values(actionError).flat().join(", ") 
				: error || actionError;
			toast.error(errorMsg, { autoClose: 5000 });
			dispatch(clearError());
		}
	}, [error, actionError, dispatch]);

	// Update page title
	useEffect(() => {
		document.title = `${t("countries.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	// Filter countries based on search
	const filteredCountries = useMemo(() => {
		return countries.filter(country => {
			const matchesSearch =
				!searchTerm ||
				country.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				country.code?.toLowerCase().includes(searchTerm.toLowerCase());
			return matchesSearch;
		});
	}, [countries, searchTerm]);

	// Table columns
	const columns = [
		{
			header: t("countries.table.code"),
			accessor: "code",
			render: value => (
				<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#28819C]/10 text-[#28819C]">
					{value || "-"}
				</span>
			),
		},
		{
			header: t("countries.table.name"),
			accessor: "name",
			render: value => <span className="font-medium text-gray-800">{value || "-"}</span>,
		},
	];

	// Form handlers
	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (formErrors[field]) {
			setFormErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};

		if (!formData.code.trim()) {
			errors.code = t("countries.validation.codeRequired");
		} else if (formData.code.length > 3) {
			errors.code = t("countries.validation.codeMaxLength");
		}

		if (!formData.name.trim()) {
			errors.name = t("countries.validation.nameRequired");
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleOpenCreate = () => {
		setFormData(INITIAL_FORM_STATE);
		setFormErrors({});
		setIsEditMode(false);
		setIsModalOpen(true);
	};

	const handleEdit = row => {
		setSelectedCountry(row);
		setFormData({
			code: row.code || "",
			name: row.name || "",
		});
		setFormErrors({});
		setIsEditMode(true);
		setIsModalOpen(true);
	};

	const handleDelete = row => {
		setSelectedCountry(row);
		setIsDeleteModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsEditMode(false);
		setSelectedCountry(null);
		setFormData(INITIAL_FORM_STATE);
		setFormErrors({});
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		try {
			const countryData = {
				code: formData.code.toUpperCase().trim(),
				name: formData.name.trim(),
			};

			if (isEditMode && selectedCountry) {
				await dispatch(updateCountry({ id: selectedCountry.id, data: countryData })).unwrap();
				toast.success(t("countries.messages.updateSuccess"));
			} else {
				await dispatch(createCountry(countryData)).unwrap();
				toast.success(t("countries.messages.createSuccess"));
			}

			handleCloseModal();
			dispatch(fetchCountries());
		} catch {
			// Error handled by Redux
		}
	};

	const handleConfirmDelete = async () => {
		try {
			await dispatch(deleteCountry(selectedCountry.id)).unwrap();
			toast.success(t("countries.messages.deleteSuccess"));
			setIsDeleteModalOpen(false);
			setSelectedCountry(null);
		} catch {
			// Error handled by Redux
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<PageHeader
				title={t("countries.title")}
				subtitle={t("countries.subtitle")}
				icon={<FaGlobeAmericas size={30} color="#28819C" />}
			/>

			<div className="mx-auto px-6 py-8">
				{/* Header with Title and Button */}
				<div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("countries.title")}</h2>

					<div className="flex items-center gap-4">
						{/* Search Input */}
						<div className="relative">
							<svg
								className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
								width="20"
								height="20"
								viewBox="0 0 20 20"
								fill="none"
							>
								<path
									d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<input
								type="text"
								placeholder={t("countries.searchPlaceholder")}
								value={searchTerm}
								onChange={e => setSearchTerm(e.target.value)}
								className="w-64 pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#48C1F0]/40 transition-all"
							/>
						</div>

						{/* Add Button */}
						<Button
							onClick={handleOpenCreate}
							title={t("countries.actions.add")}
							icon={<BiPlusCircle size={24} />}
						/>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-[#28819C]/10 flex items-center justify-center">
								<FaGlobeAmericas size={24} className="text-[#28819C]" />
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("countries.stats.total")}</p>
								<p className="text-2xl font-bold text-gray-900">{countries.length}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-green-600">
									<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("countries.stats.active")}</p>
								<p className="text-2xl font-bold text-gray-900">{countries.length}</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600">
									<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
								</svg>
							</div>
							<div>
								<p className="text-sm text-gray-500">{t("countries.stats.lastUpdated")}</p>
								<p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Table */}
				{loading ? (
					<LoadingSpan />
				) : (
					<Table
						columns={columns}
						data={filteredCountries}
						onEdit={handleEdit}
						onDelete={handleDelete}
						editIcon="edit"
						emptyMessage={t("countries.table.emptyMessage")}
					/>
				)}
			</div>

			{/* Add/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={isEditMode ? t("countries.modals.editTitle") : t("countries.modals.addTitle")}
				maxWidth="500px"
			>
				<div className="space-y-5 p-4">
					{/* Country Code */}
					<FloatingLabelInput
						label={t("countries.form.code")}
						name="code"
						value={formData.code}
						onChange={e => handleInputChange("code", e.target.value.toUpperCase())}
						placeholder={t("countries.form.codePlaceholder")}
						error={formErrors.code}
						maxLength={3}
					/>

					{/* Country Name */}
					<FloatingLabelInput
						label={t("countries.form.name")}
						name="name"
						value={formData.name}
						onChange={e => handleInputChange("name", e.target.value)}
						placeholder={t("countries.form.namePlaceholder")}
						error={formErrors.name}
					/>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4 justify-center">

						<Button
							onClick={handleCloseModal}
							title={t("countries.actions.cancel")}
							className=" bg-gray-100 text-gray-700  hover:bg-gray-200 "
						/>

						<Button
														disabled={creating || updating}
							onClick={handleSubmit}
							title={creating || updating
								? t("countries.actions.saving")
								: isEditMode
								? t("countries.actions.update")
								: t("countries.actions.create")}
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={() => {
					setIsDeleteModalOpen(false);
					setSelectedCountry(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("countries.modals.deleteTitle")}
				message={t("countries.modals.deleteMessage", { name: selectedCountry?.name })}
				confirmText={deleting ? t("countries.actions.deleting") : t("countries.actions.delete")}
				cancelText={t("countries.actions.cancel")}
				loading={deleting}
			/>

			{/* Toast Container */}
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
		</div>
	);
};

export default CountryPage;
