import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { FaChevronDown, FaPlus, FaTrash } from "react-icons/fa";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import ConfirmModal from "../components/shared/ConfirmModal";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Toggle from "../components/shared/Toggle";
import Button from "../components/shared/Button";
import {
	fetchDefaultCombinations,
	fetchDefaultCombination,
	createDefaultCombination,
	updateDefaultCombination,
	deleteDefaultCombination,
	clearSelectedCombination,
} from "../store/defaultCombinationsSlice";
import { fetchSegmentTypes, fetchSegmentValues } from "../store/segmentsSlice";

const DefaultValuesPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();
	const { combinations, selectedCombination, loading } = useSelector(state => state.defaultCombinations);
	const { types: segmentTypes = [], values: segmentValues = [] } = useSelector(state => state.segments);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [filterIsActive, setFilterIsActive] = useState("");
	const [formData, setFormData] = useState({
		transaction_type: "",
		segments: [],
		is_active: true,
	});
	const [errors, setErrors] = useState({});

	// Fetch default combinations on mount and when filters change
	useEffect(() => {
		const filters = {};
		if (filterIsActive !== "") filters.is_active = filterIsActive;
		dispatch(fetchDefaultCombinations(filters));
	}, [dispatch, filterIsActive]);

	// Fetch segment types and values on mount
	useEffect(() => {
		dispatch(fetchSegmentTypes());
		dispatch(fetchSegmentValues({ node_type: "child", page_size: 1000 }));
	}, [dispatch]);

	// Initialize form segments when segment types are loaded or modal opens
	useEffect(() => {
		if (isModalOpen && segmentTypes.length > 0 && !editingId) {
			setFormData(prev => ({
				...prev,
				segments: segmentTypes.map(st => ({
					segment_type_id: st.id,
					segment_code: "",
				})),
			}));
		}
	}, [isModalOpen, segmentTypes, editingId]);

	// Transaction type options
	const transactionTypeOptions = useMemo(
		() => [
			{ value: "AP_INVOICE", label: t("defaultValues.options.transactionTypes.AP_INVOICE") },
			{ value: "AR_INVOICE", label: t("defaultValues.options.transactionTypes.AR_INVOICE") },
		],
		[t]
	);

	// Get segment options filtered by segment type and node_type="child"
	const getSegmentOptions = segmentTypeId => {
		if (!segmentTypeId) return [{ value: "", label: t("defaultValues.form.selectSegment") }];

		const filteredSegments = segmentValues.filter(
			segment => segment.segment_type === segmentTypeId && segment.node_type === "child"
		);

		return [
			{ value: "", label: t("defaultValues.form.selectSegment") },
			...filteredSegments.map(segment => ({
				value: segment.code,
				label: `${segment.code} - ${segment.name || segment.alias || ""}`,
			})),
		];
	};

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t("defaultValues.table.transactionType"),
				accessor: "transaction_type_display",
				render: (value, row) => (
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
							row.transaction_type === "AP_INVOICE"
								? "bg-orange-100 text-orange-800"
								: "bg-blue-100 text-blue-800"
						}`}
					>
						{value || row.transaction_type}
					</span>
				),
			},
			{
				header: t("defaultValues.table.segmentCombination"),
				accessor: "segment_combination_description",
				render: value => <span className="text-gray-700">{value || "-"}</span>,
			},
			{
				header: t("defaultValues.table.validationStatus"),
				accessor: "is_valid",
				width: "120px",
				render: value => (
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
							value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
						}`}
					>
						{value ? t("defaultValues.table.valid") : t("defaultValues.table.invalid")}
					</span>
				),
			},
			{
				header: t("defaultValues.table.status"),
				accessor: "is_active",
				width: "100px",
				render: value => (
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
							value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
						}`}
					>
						{value ? t("defaultValues.table.active") : t("defaultValues.table.inactive")}
					</span>
				),
			},
			{
				header: t("defaultValues.table.updatedAt"),
				accessor: "updated_at",
				render: value =>
					value ? (
						<span className="text-gray-600 text-sm">
							{new Date(value).toLocaleDateString(i18n.language, {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						</span>
					) : (
						"-"
					),
			},
		],
		[t, i18n.language]
	);

	// Handle transaction type change - check if it already exists and switch to update mode
	const handleTransactionTypeChange = async value => {
		setFormData(prev => ({ ...prev, transaction_type: value }));
		if (errors.transaction_type) {
			setErrors(prev => ({ ...prev, transaction_type: "" }));
		}

		// Check if a combination for this transaction type already exists
		const existingCombination = combinations.find(c => c.transaction_type === value);
		if (existingCombination && !editingId) {
			// Fetch the full details and switch to update mode
			try {
				const result = await dispatch(fetchDefaultCombination(existingCombination.id)).unwrap();
				setEditingId(existingCombination.id);

				// Map the segment details to form format
				const segmentMap = {};
				if (result.segment_details?.segments) {
					result.segment_details.segments.forEach(seg => {
						const segType = segmentTypes.find(st => st.name === seg.segment_type);
						if (segType) {
							segmentMap[segType.id] = seg.segment_code;
						}
					});
				}

				setFormData(prev => ({
					...prev,
					transaction_type: value,
					segments: segmentTypes.map(st => ({
						segment_type_id: st.id,
						segment_code: segmentMap[st.id] || "",
					})),
					is_active: result.is_active,
				}));
				toast.info(t("defaultValues.messages.switchedToUpdate"));
			} catch {
				// If fetch fails, continue with create mode
			}
		} else if (!existingCombination && editingId && !combinations.find(c => c.id === editingId)) {
			// If switching to a new type that doesn't exist, reset to create mode
			setEditingId(null);
			setFormData(prev => ({
				...prev,
				segments: segmentTypes.map(st => ({
					segment_type_id: st.id,
					segment_code: "",
				})),
				is_active: true,
			}));
		}
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleSegmentChange = (segmentTypeId, segmentCode) => {
		setFormData(prev => ({
			...prev,
			segments: prev.segments.map(seg =>
				seg.segment_type_id === segmentTypeId ? { ...seg, segment_code: segmentCode } : seg
			),
		}));
	};

	const getSegmentValue = segmentTypeId => {
		const segment = formData.segments.find(seg => seg.segment_type_id === segmentTypeId);
		return segment?.segment_code || "";
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.transaction_type) {
			newErrors.transaction_type = t("defaultValues.validation.transactionTypeRequired");
		}

		// Check that at least one segment is selected
		const hasSelectedSegment = formData.segments.some(seg => seg.segment_code);
		if (!hasSelectedSegment) {
			newErrors.segments = t("defaultValues.validation.segmentsRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		// Filter out segments with empty codes
		const filteredSegments = formData.segments.filter(seg => seg.segment_code);

		const payload = {
			transaction_type: formData.transaction_type,
			segments: filteredSegments,
			is_active: formData.is_active,
		};

		try {
			if (editingId) {
				await dispatch(updateDefaultCombination({ id: editingId, data: payload })).unwrap();
				toast.success(t("defaultValues.messages.updateSuccess"));
			} else {
				await dispatch(createDefaultCombination(payload)).unwrap();
				toast.success(t("defaultValues.messages.createSuccess"));
			}
			handleCloseModal();
			// Refetch with current filters
			const filters = {};
			if (filterIsActive !== "") filters.is_active = filterIsActive;
			dispatch(fetchDefaultCombinations(filters));
		} catch (error) {
			const errorMessage = error?.message || error?.error || error || t("defaultValues.messages.saveError");
			toast.error(typeof errorMessage === "string" ? errorMessage : t("defaultValues.messages.saveError"));
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingId(null);
		setFormData({
			transaction_type: "",
			segments: segmentTypes.map(st => ({
				segment_type_id: st.id,
				segment_code: "",
			})),
			is_active: true,
		});
		setErrors({});
	};

	const handleView = async row => {
		try {
			await dispatch(fetchDefaultCombination(row.id)).unwrap();
			setIsViewModalOpen(true);
		} catch {
			toast.error(t("defaultValues.messages.fetchError"));
		}
	};

	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		dispatch(clearSelectedCombination());
	};

	const handleEdit = async row => {
		try {
			const result = await dispatch(fetchDefaultCombination(row.id)).unwrap();
			setEditingId(row.id);

			// Map the segment details to form format
			const segmentMap = {};
			if (result.segment_details?.segments) {
				result.segment_details.segments.forEach(seg => {
					// Find segment type ID by name
					const segType = segmentTypes.find(st => st.name === seg.segment_type);
					if (segType) {
						segmentMap[segType.id] = seg.segment_code;
					}
				});
			}

			setFormData({
				transaction_type: result.transaction_type || "",
				segments: segmentTypes.map(st => ({
					segment_type_id: st.id,
					segment_code: segmentMap[st.id] || "",
				})),
				is_active: result.is_active,
			});
			setIsModalOpen(true);
		} catch {
			toast.error(t("defaultValues.messages.fetchError"));
		}
	};

	const handleDelete = row => {
		setDeleteId(row.id);
		setIsDeleteModalOpen(true);
	};

	const confirmDelete = async () => {
		if (deleteId) {
			try {
				await dispatch(deleteDefaultCombination(deleteId)).unwrap();
				toast.success(t("defaultValues.messages.deleteSuccess"));
				setIsDeleteModalOpen(false);
				setDeleteId(null);
			} catch (error) {
				const errorMessage = error?.message || error?.error || t("defaultValues.messages.deleteError");
				toast.error(typeof errorMessage === "string" ? errorMessage : t("defaultValues.messages.deleteError"));
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
				title={t("defaultValues.title")}
				subtitle={t("defaultValues.subtitle")}
				icon={
					<svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M25.3 0H3.7C1.66 0 0 1.66 0 3.7V31.3C0 33.34 1.66 35 3.7 35H25.3C27.34 35 29 33.34 29 31.3V3.7C29 1.66 27.34 0 25.3 0ZM26 31.3C26 31.69 25.69 32 25.3 32H3.7C3.31 32 3 31.69 3 31.3V3.7C3 3.31 3.31 3 3.7 3H25.3C25.69 3 26 3.31 26 3.7V31.3Z"
							fill="#28819C"
						/>
						<path d="M7 9H22V12H7V9ZM7 15H22V18H7V15ZM7 21H17V24H7V21Z" fill="#28819C" />
					</svg>
				}
			/>

			<div className="mx-auto px-6 py-8">
				{/* Header with Title and Buttons */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
					<h2 className="text-2xl font-bold text-gray-900">{t("defaultValues.title")}</h2>

					{/* Filters */}
					<div className="flex flex-wrap items-center gap-3">
						{/* Active Status Filter */}
						<div className="relative min-w-[140px]">
							<select
								value={filterIsActive}
								onChange={e => setFilterIsActive(e.target.value)}
								className="w-full h-10 px-3 pe-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
							>
								<option value="">{t("defaultValues.filters.allStatuses")}</option>
								<option value="true">{t("defaultValues.table.active")}</option>
								<option value="false">{t("defaultValues.table.inactive")}</option>
							</select>
							<FaChevronDown className="absolute top-1/2 end-3 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
						</div>

						{/* Add Button */}
						<Button
							onClick={() => setIsModalOpen(true)}
							title={t("defaultValues.actions.add")}
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
					data={combinations}
					onEdit={handleEdit}
					onDelete={handleDelete}
					editIcon="edit"
					loading={loading}
					customActions={[
						{
							title: t("defaultValues.actions.view"),
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
				title={editingId ? t("defaultValues.modals.editTitle") : t("defaultValues.modals.addTitle")}
				maxWidth="600px"
			>
				<div className="space-y-6">
					{/* Transaction Type */}
					<FloatingLabelSelect
						label={t("defaultValues.form.transactionType")}
						name="transaction_type"
						value={formData.transaction_type}
						onChange={e => handleTransactionTypeChange(e.target.value)}
						error={errors.transaction_type}
						options={transactionTypeOptions}
						required
						placeholder={t("defaultValues.options.selectTransactionType")}
					/>

					{/* Active Status Toggle */}
					<div className="pt-2">
						<Toggle
							label={t("defaultValues.form.setActive")}
							checked={formData.is_active}
							onChange={checked => handleInputChange("is_active", checked)}
						/>
					</div>

					{/* Segment Selections */}
					<div className="space-y-4">
						<h4 className="text-sm font-medium text-gray-700">{t("defaultValues.form.segmentValues")}</h4>
						{errors.segments && <p className="text-red-500 text-xs mt-1">{errors.segments}</p>}

						<div className="bg-gray-50 rounded-lg p-4 space-y-4">
							{segmentTypes.map(st => {
								const options = getSegmentOptions(st.id);
								return (
									<div key={st.id} className="relative">
										<label className="block text-sm font-medium text-gray-600 mb-1">
											{st.name || st.segment_name || `Segment ${st.id}`}
										</label>
										<div className="relative">
											<select
												value={getSegmentValue(st.id)}
												onChange={e => handleSegmentChange(st.id, e.target.value)}
												className="w-full h-11 px-3 pe-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
											>
												{options.map(opt => (
													<option key={opt.value} value={opt.value}>
														{opt.label}
													</option>
												))}
											</select>
											<FaChevronDown className="absolute top-1/2 end-3 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
										</div>
									</div>
								);
							})}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button
							onClick={handleCloseModal}
							title={t("defaultValues.actions.cancel")}
							className="bg-transparent shadow-none hover:shadow-none flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
						/>
						<Button
							onClick={handleSubmit}
							title={editingId ? t("defaultValues.actions.update") : t("defaultValues.actions.create")}
							className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* View Details Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("defaultValues.modals.viewTitle")}
				maxWidth="600px"
			>
				{selectedCombination && (
					<div className="space-y-6">
						{/* Transaction Type */}
						<div>
							<label className="block text-sm font-medium text-gray-500 mb-1">
								{t("defaultValues.form.transactionType")}
							</label>
							<span
								className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
									selectedCombination.transaction_type === "AP_INVOICE"
										? "bg-orange-100 text-orange-800"
										: "bg-blue-100 text-blue-800"
								}`}
							>
								{selectedCombination.transaction_type_display || selectedCombination.transaction_type}
							</span>
						</div>

						{/* Segment Details */}
						{selectedCombination.segment_details && (
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-2">
									{t("defaultValues.form.segmentValues")}
								</label>
								<div className="bg-gray-50 rounded-lg p-4">
									<p className="text-sm text-gray-600 mb-3">
										<span className="font-medium">{t("defaultValues.details.combinationId")}:</span>{" "}
										{selectedCombination.segment_details.combination_id}
									</p>
									<p className="text-sm text-gray-600 mb-3">
										<span className="font-medium">{t("defaultValues.details.description")}:</span>{" "}
										{selectedCombination.segment_details.description || "-"}
									</p>
									<div className="space-y-2">
										{selectedCombination.segment_details.segments?.map((seg, index) => (
											<div
												key={index}
												className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
											>
												<span className="text-sm font-medium text-gray-700">
													{seg.segment_type}
												</span>
												<span className="text-sm text-[#28819C] font-semibold">
													{seg.segment_code} - {seg.segment_alias}
												</span>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Validation Status */}
						<div>
							<label className="block text-sm font-medium text-gray-500 mb-1">
								{t("defaultValues.table.validationStatus")}
							</label>
							<span
								className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
									selectedCombination.validation_status?.is_valid
										? "bg-green-100 text-green-800"
										: "bg-red-100 text-red-800"
								}`}
							>
								{selectedCombination.validation_status?.is_valid
									? t("defaultValues.table.valid")
									: t("defaultValues.table.invalid")}
							</span>
							{selectedCombination.validation_status?.error_message && (
								<p className="text-sm text-red-600 mt-2">
									{selectedCombination.validation_status.error_message}
								</p>
							)}
						</div>

						{/* Status */}
						<div>
							<label className="block text-sm font-medium text-gray-500 mb-1">
								{t("defaultValues.table.status")}
							</label>
							<span
								className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
									selectedCombination.is_active
										? "bg-green-100 text-green-800"
										: "bg-gray-100 text-gray-800"
								}`}
							>
								{selectedCombination.is_active
									? t("defaultValues.table.active")
									: t("defaultValues.table.inactive")}
							</span>
						</div>

						{/* Timestamps */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("defaultValues.details.createdAt")}
								</label>
								<span className="text-sm text-gray-700">
									{selectedCombination.created_at
										? new Date(selectedCombination.created_at).toLocaleString(i18n.language)
										: "-"}
								</span>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("defaultValues.details.updatedAt")}
								</label>
								<span className="text-sm text-gray-700">
									{selectedCombination.updated_at
										? new Date(selectedCombination.updated_at).toLocaleString(i18n.language)
										: "-"}
								</span>
							</div>
						</div>

						{/* Close Button */}
						<div className="flex justify-end pt-4">
							<Button
								onClick={handleCloseViewModal}
								title={t("defaultValues.actions.close")}
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
				title={t("defaultValues.modals.deleteTitle")}
				message={t("defaultValues.modals.deleteMessage")}
				confirmText={t("defaultValues.actions.delete")}
				cancelText={t("defaultValues.actions.cancel")}
				type="danger"
			/>
		</div>
	);
};

export default DefaultValuesPage;
