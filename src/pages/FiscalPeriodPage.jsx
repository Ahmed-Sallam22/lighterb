import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaCalendarAlt } from "react-icons/fa";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import Toggle from "../components/shared/Toggle";
import Button from "../components/shared/Button";
import {
	fetchPeriods,
	fetchPeriod,
	createPeriod,
	updatePeriod,
	deletePeriod,
	clearSelectedPeriod,
} from "../store/fiscalPeriodsSlice";

const FiscalPeriodPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { periods, selectedPeriod, loading } = useSelector(state => state.fiscalPeriods);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [filterFiscalYear, setFilterFiscalYear] = useState("");
	const [filterIsAdjustment, setFilterIsAdjustment] = useState("");
	const [formData, setFormData] = useState({
		name: "",
		start_date: "",
		end_date: "",
		fiscal_year: new Date().getFullYear(),
		period_number: 1,
		is_adjustment_period: false,
		description: "",
	});
	const [errors, setErrors] = useState({});

	// Get unique fiscal years from periods for filter dropdown
	const fiscalYearOptions = useMemo(() => {
		const years = [...new Set(periods.map(p => p.fiscal_year))].sort((a, b) => b - a);
		return years.map(year => ({ value: year.toString(), label: year.toString() }));
	}, [periods]);

	// Fetch periods on mount and when filters change
	useEffect(() => {
		const filters = {};
		if (filterFiscalYear) filters.fiscal_year = filterFiscalYear;
		if (filterIsAdjustment !== "") filters.is_adjustment_period = filterIsAdjustment;
		dispatch(fetchPeriods(filters));
	}, [dispatch, filterFiscalYear, filterIsAdjustment]);

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t("fiscalPeriods.table.periodNumber"),
				accessor: "period_number",
				width: "80px",
				render: value => (
					<span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#28819C] text-white text-sm font-semibold">
						{value}
					</span>
				),
			},
			{
				header: t("fiscalPeriods.table.name"),
				accessor: "name",
				render: value => <span className="font-medium text-gray-900">{value}</span>,
			},
			{
				header: t("fiscalPeriods.table.startDate"),
				accessor: "start_date",
				render: value => (
					<span className="text-gray-700">
						{value ? new Date(value).toLocaleDateString(i18n.language) : "-"}
					</span>
				),
			},
			{
				header: t("fiscalPeriods.table.endDate"),
				accessor: "end_date",
				render: value => (
					<span className="text-gray-700">
						{value ? new Date(value).toLocaleDateString(i18n.language) : "-"}
					</span>
				),
			},
			{
				header: t("fiscalPeriods.table.fiscalYear"),
				accessor: "fiscal_year",
				width: "100px",
				render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
			},
			{
				header: t("fiscalPeriods.table.type"),
				accessor: "is_adjustment_period",
				width: "120px",
				render: value => (
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
							value ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
						}`}
					>
						{value ? t("fiscalPeriods.table.adjustment") : t("fiscalPeriods.table.regular")}
					</span>
				),
			},
		],
		[t, i18n.language]
	);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = t("fiscalPeriods.validation.nameRequired");
		}
		if (!formData.start_date) {
			newErrors.start_date = t("fiscalPeriods.validation.startDateRequired");
		}
		if (!formData.end_date) {
			newErrors.end_date = t("fiscalPeriods.validation.endDateRequired");
		}
		if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
			newErrors.end_date = t("fiscalPeriods.validation.endDateAfterStart");
		}
		if (!formData.fiscal_year) {
			newErrors.fiscal_year = t("fiscalPeriods.validation.fiscalYearRequired");
		}
		if (!formData.period_number || formData.period_number < 1) {
			newErrors.period_number = t("fiscalPeriods.validation.periodNumberRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		const payload = {
			name: formData.name,
			start_date: formData.start_date,
			end_date: formData.end_date,
			fiscal_year: parseInt(formData.fiscal_year, 10),
			period_number: parseInt(formData.period_number, 10),
			is_adjustment_period: formData.is_adjustment_period,
			description: formData.description,
		};

		try {
			if (editingId) {
				await dispatch(updatePeriod({ id: editingId, data: payload })).unwrap();
				toast.success(t("fiscalPeriods.messages.updateSuccess"));
			} else {
				await dispatch(createPeriod(payload)).unwrap();
				toast.success(t("fiscalPeriods.messages.createSuccess"));
			}
			handleCloseModal();
			// Refetch with current filters
			const filters = {};
			if (filterFiscalYear) filters.fiscal_year = filterFiscalYear;
			if (filterIsAdjustment !== "") filters.is_adjustment_period = filterIsAdjustment;
			dispatch(fetchPeriods(filters));
		} catch (error) {
			const errorMessage = error?.message || error?.error || error || t("fiscalPeriods.messages.saveError");
			toast.error(typeof errorMessage === "string" ? errorMessage : t("fiscalPeriods.messages.saveError"));
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingId(null);
		setFormData({
			name: "",
			start_date: "",
			end_date: "",
			fiscal_year: new Date().getFullYear(),
			period_number: 1,
			is_adjustment_period: false,
			description: "",
		});
		setErrors({});
	};

	const handleView = async row => {
		try {
			await dispatch(fetchPeriod(row.id)).unwrap();
			setIsViewModalOpen(true);
		} catch {
			toast.error(t("fiscalPeriods.messages.fetchError"));
		}
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearSelectedPeriod());
	};

	const handleEdit = async row => {
		try {
			const result = await dispatch(fetchPeriod(row.id)).unwrap();
			setEditingId(row.id);
			setFormData({
				name: result.name || "",
				start_date: result.start_date || "",
				end_date: result.end_date || "",
				fiscal_year: result.fiscal_year || new Date().getFullYear(),
				period_number: result.period_number || 1,
				is_adjustment_period: result.is_adjustment_period || false,
				description: result.description || "",
			});
			setIsModalOpen(true);
		} catch {
			toast.error(t("fiscalPeriods.messages.fetchError"));
		}
	};

	const handleDelete = row => {
		setDeleteId(row.id);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (deleteId) {
			try {
				await dispatch(deletePeriod(deleteId)).unwrap();
				toast.success(t("fiscalPeriods.messages.deleteSuccess"));
				setIsDeleteModalOpen(false);
				setDeleteId(null);
			} catch (error) {
				const errorMessage = error?.message || error?.error || t("fiscalPeriods.messages.deleteError");
				toast.error(typeof errorMessage === "string" ? errorMessage : t("fiscalPeriods.messages.deleteError"));
			}
		}
	};

	const cancelDelete = () => {
		setIsDeleteModalOpen(false);
		setDeleteId(null);
	};

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
				title={t("fiscalPeriods.title")}
				subtitle={t("fiscalPeriods.subtitle")}
				icon={<FaCalendarAlt className="w-7 h-7 text-[#28819C]" />}
			/>

			<div className="mx-auto px-6 py-8">
				{/* Header with Title and Buttons */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
					<h2 className="text-2xl font-bold text-gray-900">{t("fiscalPeriods.title")}</h2>

					{/* Filters and Actions */}
					<div className="flex flex-wrap items-center gap-3">
						{/* Fiscal Year Filter */}
						<div className="relative min-w-[140px]">
							<select
								value={filterFiscalYear}
								onChange={e => setFilterFiscalYear(e.target.value)}
								className="w-full h-10 px-3 pe-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
							>
								<option value="">{t("fiscalPeriods.filters.allYears")}</option>
								{fiscalYearOptions.map(opt => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
							<FaChevronDown className="absolute top-1/2 end-3 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
						</div>

						{/* Period Type Filter */}
						<div className="relative min-w-[160px]">
							<select
								value={filterIsAdjustment}
								onChange={e => setFilterIsAdjustment(e.target.value)}
								className="w-full h-10 px-3 pe-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
							>
								<option value="">{t("fiscalPeriods.filters.allTypes")}</option>
								<option value="false">{t("fiscalPeriods.table.regular")}</option>
								<option value="true">{t("fiscalPeriods.table.adjustment")}</option>
							</select>
							<FaChevronDown className="absolute top-1/2 end-3 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
						</div>

						{/* Generate Periods Button */}
						<Button
							onClick={() => navigate("/fiscal-periods/generate")}
							title={t("fiscalPeriods.actions.generate")}
							icon={<FaCalendarAlt className="w-4 h-4" />}
							className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium"
						/>

						{/* Add Button */}
						<Button
							onClick={() => setIsModalOpen(true)}
							title={t("fiscalPeriods.actions.add")}
							icon={
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 11H11V15H9V11H5V9H9V5H11V9H15V11Z"
										fill="white"
									/>
								</svg>
							}
							className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
						/>
					</div>
				</div>

				{/* Table */}
				<Table
					columns={columns}
					data={periods}
					onEdit={handleEdit}
					onDelete={handleDelete}
					editIcon="edit"
					loading={loading}
					customActions={[
						{
							title: t("fiscalPeriods.actions.view"),
							icon: (
								<svg
									width="20"
									height="20"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="text-gray-700"
								>
									<path d="M10 4C4.48 4 0 10 0 10s4.48 6 10 6 10-6 10-6-4.48-6-10-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
								</svg>
							),
							onClick: handleView,
						},
					]}
				/>
			</div>

			{/* Add/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingId ? t("fiscalPeriods.modals.editTitle") : t("fiscalPeriods.modals.addTitle")}
				maxWidth="600px"
			>
				<div className="space-y-6">
					{/* Period Name */}
					<FloatingLabelInput
						label={t("fiscalPeriods.form.name")}
						name="name"
						value={formData.name}
						onChange={e => handleInputChange("name", e.target.value)}
						error={errors.name}
						required
						placeholder={t("fiscalPeriods.form.placeholders.name")}
					/>

					{/* Date Range */}
					<div className="grid grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("fiscalPeriods.form.startDate")}
							name="start_date"
							type="date"
							value={formData.start_date}
							onChange={e => handleInputChange("start_date", e.target.value)}
							error={errors.start_date}
							required
						/>
						<FloatingLabelInput
							label={t("fiscalPeriods.form.endDate")}
							name="end_date"
							type="date"
							value={formData.end_date}
							onChange={e => handleInputChange("end_date", e.target.value)}
							error={errors.end_date}
							required
						/>
					</div>

					{/* Fiscal Year and Period Number */}
					<div className="grid grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("fiscalPeriods.form.fiscalYear")}
							name="fiscal_year"
							type="number"
							value={formData.fiscal_year}
							onChange={e => handleInputChange("fiscal_year", e.target.value)}
							error={errors.fiscal_year}
							required
						/>
						<FloatingLabelInput
							label={t("fiscalPeriods.form.periodNumber")}
							name="period_number"
							type="number"
							min="1"
							value={formData.period_number}
							onChange={e => handleInputChange("period_number", e.target.value)}
							error={errors.period_number}
							required
						/>
					</div>

					{/* Description */}
					<FloatingLabelInput
						label={t("fiscalPeriods.form.description")}
						name="description"
						value={formData.description}
						onChange={e => handleInputChange("description", e.target.value)}
						placeholder={t("fiscalPeriods.form.placeholders.description")}
					/>

					{/* Adjustment Period Toggle */}
					<div className="pt-2">
						<Toggle
							label={t("fiscalPeriods.form.isAdjustmentPeriod")}
							checked={formData.is_adjustment_period}
							onChange={checked => handleInputChange("is_adjustment_period", checked)}
						/>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button
							onClick={handleCloseModal}
							title={t("fiscalPeriods.actions.cancel")}
							className="bg-transparent shadow-none hover:shadow-none flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
						/>
						<Button
							onClick={handleSubmit}
							title={editingId ? t("fiscalPeriods.actions.update") : t("fiscalPeriods.actions.create")}
							className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* View Details Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("fiscalPeriods.modals.viewTitle")}
				maxWidth="600px"
			>
				{selectedPeriod && (
					<div className="space-y-6">
						{/* Period Name */}
						<div>
							<label className="block text-sm font-medium text-gray-500 mb-1">
								{t("fiscalPeriods.form.name")}
							</label>
							<span className="text-lg font-semibold text-gray-900">{selectedPeriod.name}</span>
						</div>

						{/* Date Range */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("fiscalPeriods.form.startDate")}
								</label>
								<span className="text-gray-700">
									{selectedPeriod.start_date
										? new Date(selectedPeriod.start_date).toLocaleDateString(i18n.language)
										: "-"}
								</span>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("fiscalPeriods.form.endDate")}
								</label>
								<span className="text-gray-700">
									{selectedPeriod.end_date
										? new Date(selectedPeriod.end_date).toLocaleDateString(i18n.language)
										: "-"}
								</span>
							</div>
						</div>

						{/* Fiscal Year and Period Info */}
						<div className="grid grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("fiscalPeriods.form.fiscalYear")}
								</label>
								<span className="font-semibold text-[#28819C]">{selectedPeriod.fiscal_year}</span>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("fiscalPeriods.form.periodNumber")}
								</label>
								<span className="font-semibold text-gray-900">{selectedPeriod.period_number}</span>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("fiscalPeriods.details.durationDays")}
								</label>
								<span className="font-semibold text-gray-900">
									{selectedPeriod.duration_days} {t("fiscalPeriods.details.days")}
								</span>
							</div>
						</div>

						{/* Period Type */}
						<div>
							<label className="block text-sm font-medium text-gray-500 mb-1">
								{t("fiscalPeriods.table.type")}
							</label>
							<span
								className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
									selectedPeriod.is_adjustment_period
										? "bg-purple-100 text-purple-800"
										: "bg-blue-100 text-blue-800"
								}`}
							>
								{selectedPeriod.is_adjustment_period
									? t("fiscalPeriods.table.adjustment")
									: t("fiscalPeriods.table.regular")}
							</span>
						</div>

						{/* Description */}
						{selectedPeriod.description && (
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("fiscalPeriods.form.description")}
								</label>
								<span className="text-gray-700">{selectedPeriod.description}</span>
							</div>
						)}

						{/* Timestamps */}
						<div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("fiscalPeriods.details.createdAt")}
								</label>
								<span className="text-sm text-gray-600">
									{selectedPeriod.created_at
										? new Date(selectedPeriod.created_at).toLocaleString(i18n.language)
										: "-"}
								</span>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("fiscalPeriods.details.updatedAt")}
								</label>
								<span className="text-sm text-gray-600">
									{selectedPeriod.updated_at
										? new Date(selectedPeriod.updated_at).toLocaleString(i18n.language)
										: "-"}
								</span>
							</div>
						</div>

						{/* Close Button */}
						<div className="flex justify-end pt-4">
							<Button
								onClick={handleCloseViewModal}
								title={t("fiscalPeriods.actions.close")}
								className="px-6 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
							/>
						</div>
					</div>
				)}
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={cancelDelete}
				onConfirm={confirmDelete}
				title={t("fiscalPeriods.modals.deleteTitle")}
				message={t("fiscalPeriods.modals.deleteMessage")}
				confirmText={t("fiscalPeriods.actions.delete")}
				cancelText={t("fiscalPeriods.actions.cancel")}
				type="danger"
			/>
		</div>
	);
};

export default FiscalPeriodPage;
