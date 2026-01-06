import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { FaCalendarAlt, FaSave, FaEye, FaEdit, FaArrowLeft, FaGripVertical } from "react-icons/fa";
import PageHeader from "../components/shared/PageHeader";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import SlideUpModal from "../components/shared/SlideUpModal";
import Toggle from "../components/shared/Toggle";
import Button from "../components/shared/Button";
import {
	generatePeriodsPreview,
	bulkSavePeriods,
	clearPreviewData,
	updatePreviewPeriod,
	swapPreviewPeriods,
	fetchPeriods,
} from "../store/fiscalPeriodsSlice";

const GeneratePeriodsPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { previewData, previewLoading, loading, periods } = useSelector(state => state.fiscalPeriods);

	const [activeTab, setActiveTab] = useState("generate");
	const [draggedIndex, setDraggedIndex] = useState(null);
	const [dragOverIndex, setDragOverIndex] = useState(null);
	const [formData, setFormData] = useState({
		start_date: `${new Date().getFullYear()}-01-01`,
		fiscal_year: new Date().getFullYear(),
		num_periods: 12,
		num_adjustment_periods: 1,
		adjustment_period_days: 1,
	});
	const [errors, setErrors] = useState({});
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [editingPeriodIndex, setEditingPeriodIndex] = useState(null);
	const [editFormData, setEditFormData] = useState({});

	// Fetch existing periods for the "View Existing" tab
	useEffect(() => {
		if (activeTab === "existing") {
			dispatch(fetchPeriods({}));
		}
	}, [dispatch, activeTab]);

	// Drag and drop handlers
	const handleDragStart = (e, index) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", index);
		// Add a slight delay to allow the drag image to be captured
		setTimeout(() => {
			e.target.style.opacity = "0.5";
		}, 0);
	};

	const handleDragEnd = e => {
		e.target.style.opacity = "1";
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleDragOver = (e, index) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		if (index !== draggedIndex) {
			setDragOverIndex(index);
		}
	};

	const handleDragLeave = e => {
		e.preventDefault();
		setDragOverIndex(null);
	};

	const handleDrop = (e, toIndex) => {
		e.preventDefault();
		const fromIndex = draggedIndex;

		if (fromIndex !== null && fromIndex !== toIndex) {
			dispatch(swapPreviewPeriods({ fromIndex, toIndex }));
			toast.success(t("generatePeriods.messages.periodsSwapped"));
		}

		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.start_date) {
			newErrors.start_date = t("fiscalPeriods.validation.startDateRequired");
		}
		if (!formData.fiscal_year) {
			newErrors.fiscal_year = t("fiscalPeriods.validation.fiscalYearRequired");
		}
		if (!formData.num_periods || formData.num_periods < 1) {
			newErrors.num_periods = t("generatePeriods.validation.numPeriodsRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleGeneratePreview = async () => {
		if (!validateForm()) return;

		const payload = {
			start_date: formData.start_date,
			fiscal_year: parseInt(formData.fiscal_year, 10),
			num_periods: parseInt(formData.num_periods, 10),
			num_adjustment_periods: parseInt(formData.num_adjustment_periods, 10) || 0,
			adjustment_period_days: parseInt(formData.adjustment_period_days, 10) || 1,
		};

		try {
			await dispatch(generatePeriodsPreview(payload)).unwrap();
			toast.success(t("generatePeriods.messages.previewGenerated"));
		} catch (error) {
			const errorMessage = error?.message || error?.error || error || t("generatePeriods.messages.previewError");
			toast.error(typeof errorMessage === "string" ? errorMessage : t("generatePeriods.messages.previewError"));
		}
	};

	const handleEditPeriod = index => {
		if (previewData?.periods?.[index]) {
			setEditingPeriodIndex(index);
			setEditFormData({ ...previewData.periods[index] });
			setEditModalOpen(true);
		}
	};

	const handleEditFormChange = (field, value) => {
		setEditFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSaveEditedPeriod = () => {
		if (editingPeriodIndex !== null) {
			dispatch(updatePreviewPeriod({ index: editingPeriodIndex, data: editFormData }));
			setEditModalOpen(false);
			setEditingPeriodIndex(null);
			setEditFormData({});
			toast.success(t("generatePeriods.messages.periodUpdated"));
		}
	};

	const handleBulkSave = async () => {
		if (!previewData?.periods?.length) {
			toast.error(t("generatePeriods.messages.noPeriodsToSave"));
			return;
		}

		try {
			await dispatch(bulkSavePeriods(previewData.periods)).unwrap();
			toast.success(t("generatePeriods.messages.saveSuccess"));
			dispatch(clearPreviewData());
			navigate("/fiscal-periods");
		} catch (error) {
			const errorMessage = error?.message || error?.error || error || t("generatePeriods.messages.saveError");
			toast.error(typeof errorMessage === "string" ? errorMessage : t("generatePeriods.messages.saveError"));
		}
	};

	const handleClearPreview = () => {
		dispatch(clearPreviewData());
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
				title={t("generatePeriods.title")}
				subtitle={t("generatePeriods.subtitle")}
				icon={<FaCalendarAlt className="w-7 h-7 text-[#28819C]" />}
			/>

			<div className="mx-auto px-6 py-8">
				{/* Back Button */}
				<Button
					onClick={() => navigate("/fiscal-periods")}
					title={t("generatePeriods.actions.backToList")}
					icon={<FaArrowLeft className="w-4 h-4" />}
					className="mb-6 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
				/>

				{/* Tabs */}
				<div className="flex border-b border-gray-200 mb-6">
					<button
						onClick={() => setActiveTab("generate")}
						className={`px-6 py-3 text-sm font-medium transition-colors ${
							activeTab === "generate"
								? "border-b-2 border-[#28819C] text-[#28819C]"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						{t("generatePeriods.tabs.generate")}
					</button>
					<button
						onClick={() => setActiveTab("existing")}
						className={`px-6 py-3 text-sm font-medium transition-colors ${
							activeTab === "existing"
								? "border-b-2 border-[#28819C] text-[#28819C]"
								: "text-gray-500 hover:text-gray-700"
						}`}
					>
						{t("generatePeriods.tabs.existing")}
					</button>
				</div>

				{/* Generate Tab */}
				{activeTab === "generate" && (
					<div className="space-y-8">
						{/* Generation Form */}
						<div className="bg-white rounded-xl shadow-sm p-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-4">
								{t("generatePeriods.form.title")}
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
								<FloatingLabelInput
									label={t("generatePeriods.form.startDate")}
									name="start_date"
									type="date"
									value={formData.start_date}
									onChange={e => handleInputChange("start_date", e.target.value)}
									error={errors.start_date}
									required
								/>
								<FloatingLabelInput
									label={t("generatePeriods.form.fiscalYear")}
									name="fiscal_year"
									type="number"
									value={formData.fiscal_year}
									onChange={e => handleInputChange("fiscal_year", e.target.value)}
									error={errors.fiscal_year}
									required
								/>
								<FloatingLabelInput
									label={t("generatePeriods.form.numPeriods")}
									name="num_periods"
									type="number"
									min="1"
									max="24"
									value={formData.num_periods}
									onChange={e => handleInputChange("num_periods", e.target.value)}
									error={errors.num_periods}
									required
								/>
								<FloatingLabelInput
									label={t("generatePeriods.form.numAdjustmentPeriods")}
									name="num_adjustment_periods"
									type="number"
									min="0"
									max="4"
									value={formData.num_adjustment_periods}
									onChange={e => handleInputChange("num_adjustment_periods", e.target.value)}
								/>
								<FloatingLabelInput
									label={t("generatePeriods.form.adjustmentDays")}
									name="adjustment_period_days"
									type="number"
									min="1"
									value={formData.adjustment_period_days}
									onChange={e => handleInputChange("adjustment_period_days", e.target.value)}
								/>
							</div>

							<div className="flex gap-3 mt-6">
								<Button
									onClick={handleGeneratePreview}
									title={t("generatePeriods.actions.generatePreview")}
									icon={<FaEye className="w-4 h-4" />}
									disabled={previewLoading}
									className="flex items-center gap-2 px-6 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium disabled:opacity-50"
								/>
								{previewData && (
									<Button
										onClick={handleClearPreview}
										title={t("generatePeriods.actions.clearPreview")}
										className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
									/>
								)}
							</div>
						</div>

						{/* Preview Visualization */}
						{previewData && (
							<div className="bg-white rounded-xl shadow-sm p-6">
								<div className="flex items-center justify-between mb-6">
									<div>
										<h3 className="text-lg font-semibold text-gray-900">
											{t("generatePeriods.preview.title")}
										</h3>
										<p className="text-sm text-gray-500 mt-1">
											{t("generatePeriods.preview.totalPeriods", {
												total: previewData.total_periods,
												regular: previewData.regular_periods,
												adjustment: previewData.adjustment_periods,
											})}
										</p>
									</div>
									<Button
										onClick={handleBulkSave}
										title={t("generatePeriods.actions.saveAll")}
										icon={<FaSave className="w-4 h-4" />}
										disabled={loading}
										className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium disabled:opacity-50"
									/>
								</div>

								<p className="text-sm text-gray-600 mb-4">
									{t("generatePeriods.preview.dragToReorder")}
								</p>

								{/* Drag and Drop Cards Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
									{previewData.periods.map((period, index) => (
										<div
											key={`period-${index}`}
											draggable
											onDragStart={e => handleDragStart(e, index)}
											onDragEnd={handleDragEnd}
											onDragOver={e => handleDragOver(e, index)}
											onDragLeave={handleDragLeave}
											onDrop={e => handleDrop(e, index)}
											className={`relative p-4 rounded-xl border-2 cursor-move transition-all duration-200 ${
												period.is_adjustment_period
													? "bg-purple-50 border-purple-300 hover:border-purple-400"
													: "bg-teal-50 border-teal-300 hover:border-teal-400"
											} ${
												dragOverIndex === index && draggedIndex !== index
													? "ring-2 ring-blue-500 ring-offset-2 scale-105"
													: ""
											} ${draggedIndex === index ? "opacity-50" : ""}`}
										>
											{/* Drag Handle */}
											<div className="absolute top-2 left-2 text-gray-400 cursor-grab active:cursor-grabbing">
												<FaGripVertical className="w-4 h-4" />
											</div>

											{/* Edit Button */}
											<button
												onClick={e => {
													e.stopPropagation();
													handleEditPeriod(index);
												}}
												className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
											>
												<FaEdit className="w-3 h-3 text-gray-500" />
											</button>

											{/* Period Number Badge */}
											<div
												className={`absolute -top-3 left-1/2 transform -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow ${
													period.is_adjustment_period ? "bg-purple-600" : "bg-[#28819C]"
												}`}
											>
												{period.period_number}
											</div>

											{/* Card Content */}
											<div className="pt-4 text-center">
												<h4 className="font-semibold text-gray-900 text-sm truncate mb-1">
													{period.name || `Period ${period.period_number}`}
												</h4>
												<p className="text-xs text-gray-600 mb-1">{period.start_date}</p>
												<p className="text-xs text-gray-600 mb-2">{period.end_date}</p>
												<p className="text-xs text-gray-400 mb-2">
													{period.duration_days} {t("fiscalPeriods.details.days")}
												</p>
												<span
													className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
														period.is_adjustment_period
															? "bg-purple-200 text-purple-700"
															: "bg-teal-200 text-teal-700"
													}`}
												>
													{period.is_adjustment_period
														? t("fiscalPeriods.table.adjustment")
														: t("fiscalPeriods.table.regular")}
												</span>
											</div>
										</div>
									))}
								</div>

								{/* Summary Cards */}
								<div className="grid grid-cols-3 gap-4 mt-6">
									<div className="bg-blue-50 rounded-lg p-4 text-center">
										<p className="text-2xl font-bold text-blue-600">{previewData.total_periods}</p>
										<p className="text-sm text-blue-700">{t("generatePeriods.summary.total")}</p>
									</div>
									<div className="bg-teal-50 rounded-lg p-4 text-center">
										<p className="text-2xl font-bold text-teal-600">
											{previewData.regular_periods}
										</p>
										<p className="text-sm text-teal-700">{t("generatePeriods.summary.regular")}</p>
									</div>
									<div className="bg-purple-50 rounded-lg p-4 text-center">
										<p className="text-2xl font-bold text-purple-600">
											{previewData.adjustment_periods}
										</p>
										<p className="text-sm text-purple-700">
											{t("generatePeriods.summary.adjustment")}
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Existing Periods Tab */}
				{activeTab === "existing" && (
					<div className="bg-white rounded-xl shadow-sm p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							{t("generatePeriods.existing.title")}
						</h3>

						{periods.length === 0 ? (
							<div className="text-center py-12">
								<FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
								<p className="text-gray-500">{t("generatePeriods.existing.noPeriods")}</p>
							</div>
						) : (
							<div className="space-y-3">
								{periods.map(period => (
									<div
										key={period.id}
										className={`flex items-center justify-between p-4 rounded-lg border ${
											period.is_adjustment_period
												? "bg-purple-50 border-purple-200"
												: "bg-blue-50 border-blue-200"
										}`}
									>
										<div className="flex items-center gap-4">
											<span
												className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-semibold ${
													period.is_adjustment_period ? "bg-purple-600" : "bg-[#28819C]"
												}`}
											>
												{period.period_number}
											</span>
											<div>
												<p className="font-medium text-gray-900">{period.name}</p>
												<p className="text-sm text-gray-500">
													{period.start_date} - {period.end_date}
												</p>
											</div>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium ${
												period.is_adjustment_period
													? "bg-purple-100 text-purple-700"
													: "bg-blue-100 text-blue-700"
											}`}
										>
											{period.is_adjustment_period
												? t("fiscalPeriods.table.adjustment")
												: t("fiscalPeriods.table.regular")}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>

			{/* Edit Period Modal */}
			<SlideUpModal
				isOpen={editModalOpen}
				onClose={() => {
					setEditModalOpen(false);
					setEditingPeriodIndex(null);
					setEditFormData({});
				}}
				title={t("generatePeriods.editModal.title")}
				maxWidth="500px"
			>
				<div className="space-y-4">
					<FloatingLabelInput
						label={t("fiscalPeriods.form.name")}
						name="name"
						value={editFormData.name || ""}
						onChange={e => handleEditFormChange("name", e.target.value)}
					/>
					<div className="grid grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("fiscalPeriods.form.startDate")}
							name="start_date"
							type="date"
							value={editFormData.start_date || ""}
							onChange={e => handleEditFormChange("start_date", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("fiscalPeriods.form.endDate")}
							name="end_date"
							type="date"
							value={editFormData.end_date || ""}
							onChange={e => handleEditFormChange("end_date", e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("fiscalPeriods.form.fiscalYear")}
							name="fiscal_year"
							type="number"
							value={editFormData.fiscal_year || ""}
							onChange={e => handleEditFormChange("fiscal_year", e.target.value)}
						/>
						<FloatingLabelInput
							label={t("fiscalPeriods.form.periodNumber")}
							name="period_number"
							type="number"
							value={editFormData.period_number || ""}
							onChange={e => handleEditFormChange("period_number", e.target.value)}
						/>
					</div>
					<FloatingLabelInput
						label={t("fiscalPeriods.form.description")}
						name="description"
						value={editFormData.description || ""}
						onChange={e => handleEditFormChange("description", e.target.value)}
					/>
					<div className="pt-2">
						<Toggle
							label={t("fiscalPeriods.form.isAdjustmentPeriod")}
							checked={editFormData.is_adjustment_period || false}
							onChange={checked => handleEditFormChange("is_adjustment_period", checked)}
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<Button
							onClick={() => {
								setEditModalOpen(false);
								setEditingPeriodIndex(null);
								setEditFormData({});
							}}
							title={t("fiscalPeriods.actions.cancel")}
							className="bg-transparent shadow-none hover:shadow-none flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
						/>
						<Button
							onClick={handleSaveEditedPeriod}
							title={t("generatePeriods.actions.savePeriod")}
							icon={<FaEdit className="w-4 h-4" />}
							className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
						/>
					</div>
				</div>
			</SlideUpModal>
		</div>
	);
};

export default GeneratePeriodsPage;
