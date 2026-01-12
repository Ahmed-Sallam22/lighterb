import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";

import PageHeader from "../components/shared/PageHeader";
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

import {
	fetchPaymentTypes,
	fetchPaymentTypeById,
	createPaymentType,
	updatePaymentType,
	deletePaymentType,
	activatePaymentType,
	deactivatePaymentType,
	setPage,
} from "../store/paymentTypesSlice";

import { BiPlus } from "react-icons/bi";
import { MdPayment } from "react-icons/md";

// Payment Type Header Icon
const PaymentTypeHeaderIcon = () => <MdPayment className="w-8 h-8 text-white" />;

const INITIAL_FORM_STATE = {
	payment_method_code: "",
	payment_method_name: "",
	description: "",
	enable_reconcile: true,
	is_active: true,
};

const PaymentTypesPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	// Redux state
	const { paymentTypes, loading, count, page, hasNext, hasPrevious, actionLoading } = useSelector(
		state => state.paymentTypes
	);

	// Local state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isViewModalOpen, setIsViewModalOpen] = useState(false);
	const [viewingPaymentType, setViewingPaymentType] = useState(null);
	const [editingPaymentType, setEditingPaymentType] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [paymentTypeToDelete, setPaymentTypeToDelete] = useState(null);
	const [localPageSize, setLocalPageSize] = useState(20);
	const [formData, setFormData] = useState(INITIAL_FORM_STATE);
	const [errors, setErrors] = useState({});
	const [fetchingDetails, setFetchingDetails] = useState(false);

	// Filters
	const [filters, setFilters] = useState({
		is_active: "",
	});

	// Fetch data on mount and when filters/pagination change
	useEffect(() => {
		dispatch(
			fetchPaymentTypes({
				page,
				page_size: localPageSize,
				is_active: filters.is_active !== "" ? filters.is_active : undefined,
			})
		);
	}, [dispatch, page, localPageSize, filters]);

	// Active status options
	const activeOptions = useMemo(
		() => [
			{ value: "", label: t("paymentTypes.filters.allStatus") },
			{ value: "true", label: t("paymentTypes.filters.active") },
			{ value: "false", label: t("paymentTypes.filters.inactive") },
		],
		[t]
	);

	// Handle filter change
	const handleFilterChange = useCallback(
		(field, value) => {
			setFilters(prev => ({ ...prev, [field]: value }));
			dispatch(setPage(1));
		},
		[dispatch]
	);

	// Pagination handlers
	const handlePageChange = useCallback(
		newPage => {
			dispatch(setPage(newPage));
		},
		[dispatch]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(setPage(1));
		},
		[dispatch]
	);

	// Toggle active status
	const handleToggleActive = async (paymentType, newValue) => {
		try {
			if (newValue) {
				await dispatch(activatePaymentType(paymentType.id)).unwrap();
				toast.success(t("paymentTypes.messages.activated", { name: paymentType.payment_method_name }));
			} else {
				await dispatch(deactivatePaymentType(paymentType.id)).unwrap();
				toast.success(t("paymentTypes.messages.deactivated", { name: paymentType.payment_method_name }));
			}
		} catch (err) {
			const errorMessage = err?.message || t("paymentTypes.messages.updateActiveError");
			toast.error(errorMessage);
		}
	};

	// Toggle reconcile status
	const handleToggleReconcile = async (paymentType, newValue) => {
		try {
			await dispatch(
				updatePaymentType({
					id: paymentType.id,
					data: { ...paymentType, enable_reconcile: newValue },
				})
			).unwrap();
			toast.success(t("paymentTypes.messages.updateSuccess"));
		} catch (err) {
			const errorMessage = err?.message || t("paymentTypes.messages.updateError");
			toast.error(errorMessage);
		}
	};

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t("paymentTypes.table.methodName"),
				accessor: "payment_method_name",
				render: value => <span className="font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t("paymentTypes.table.methodCode"),
				accessor: "payment_method_code",
				width: "150px",
				render: value => <span className="font-mono text-gray-700">{value}</span>,
			},
			{
				header: t("paymentTypes.table.enableReconcile"),
				accessor: "enable_reconcile",
				width: "150px",
				render: (value, row) => (
					<Toggle checked={!!value} onChange={checked => handleToggleReconcile(row, checked)} />
				),
			},
			{
				header: t("paymentTypes.table.active"),
				accessor: "is_active",
				width: "120px",
				render: (value, row) => (
					<Toggle checked={!!value} onChange={checked => handleToggleActive(row, checked)} />
				),
			},
		],
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[t]
	);

	// Form validation
	const validateForm = () => {
		const newErrors = {};

		if (!formData.payment_method_code.trim()) {
			newErrors.payment_method_code = t("paymentTypes.validation.codeRequired");
		}
		if (!formData.payment_method_name.trim()) {
			newErrors.payment_method_name = t("paymentTypes.validation.nameRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	// Handle form input change
	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	// Open create modal
	const handleCreate = () => {
		setEditingPaymentType(null);
		setFormData(INITIAL_FORM_STATE);
		setErrors({});
		setIsModalOpen(true);
	};

	// Open view modal
	const handleView = async row => {
		const paymentType = row.rawData || row;
		setFetchingDetails(true);
		try {
			const result = await dispatch(fetchPaymentTypeById(paymentType.id)).unwrap();
			setViewingPaymentType(result);
			setIsViewModalOpen(true);
		} catch (err) {
			const errorMessage = err?.message || t("paymentTypes.messages.fetchError");
			toast.error(errorMessage);
		} finally {
			setFetchingDetails(false);
		}
	};

	// Close view modal
	const handleCloseViewModal = () => {
		setIsViewModalOpen(false);
		setViewingPaymentType(null);
	};

	// Open edit modal
	const handleEdit = async row => {
		const paymentType = row.rawData || row;
		setFetchingDetails(true);
		try {
			const result = await dispatch(fetchPaymentTypeById(paymentType.id)).unwrap();
			setEditingPaymentType(result);
			setFormData({
				payment_method_code: result.payment_method_code || "",
				payment_method_name: result.payment_method_name || "",
				description: result.description || "",
				enable_reconcile: result.enable_reconcile !== undefined ? result.enable_reconcile : true,
				is_active: result.is_active !== undefined ? result.is_active : true,
			});
			setErrors({});
			setIsModalOpen(true);
		} catch (err) {
			const errorMessage = err?.message || t("paymentTypes.messages.fetchError");
			toast.error(errorMessage);
		} finally {
			setFetchingDetails(false);
		}
	};

	// Handle form submit
	const handleSubmit = async () => {
		if (!validateForm()) return;

		const paymentTypeData = {
			payment_method_code: formData.payment_method_code.trim().toUpperCase(),
			payment_method_name: formData.payment_method_name.trim(),
			description: formData.description.trim() || null,
			enable_reconcile: formData.enable_reconcile,
			is_active: formData.is_active,
		};

		try {
			if (editingPaymentType) {
				await dispatch(updatePaymentType({ id: editingPaymentType.id, data: paymentTypeData })).unwrap();
				toast.success(t("paymentTypes.messages.updateSuccess"));
			} else {
				await dispatch(createPaymentType(paymentTypeData)).unwrap();
				toast.success(t("paymentTypes.messages.createSuccess"));
			}
			handleCloseModal();
			dispatch(fetchPaymentTypes({ page, page_size: localPageSize, ...filters }));
		} catch (err) {
			const errorMessage = err?.message || err?.error || t("paymentTypes.messages.saveError");
			if (err && typeof err === "object" && !err.message && !err.error) {
				const errorMessages = [];
				Object.keys(err).forEach(key => {
					if (Array.isArray(err[key])) {
						errorMessages.push(`${key}: ${err[key].join(", ")}`);
					} else if (typeof err[key] === "string") {
						errorMessages.push(`${key}: ${err[key]}`);
					}
				});
				if (errorMessages.length > 0) {
					toast.error(errorMessages.join(" | "));
					return;
				}
			}
			toast.error(errorMessage);
		}
	};

	// Close modal
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingPaymentType(null);
		setFormData(INITIAL_FORM_STATE);
		setErrors({});
	};

	// Handle delete click
	const handleDelete = row => {
		const paymentType = row.rawData || row;
		setPaymentTypeToDelete(paymentType);
		setConfirmDelete(true);
	};

	// Confirm delete
	const handleConfirmDelete = async () => {
		try {
			await dispatch(deletePaymentType(paymentTypeToDelete.id)).unwrap();
			toast.success(t("paymentTypes.messages.deleteSuccess"));
			setConfirmDelete(false);
			setPaymentTypeToDelete(null);
		} catch (err) {
			const errorMessage = err?.message || t("paymentTypes.messages.deleteError");
			toast.error(errorMessage);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Loading overlay for fetching details */}
			{fetchingDetails && (
				<div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
					<LoadingSpan />
				</div>
			)}

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
				title={t("paymentTypes.title")}
				subtitle={t("paymentTypes.subtitle")}
				icon={<PaymentTypeHeaderIcon />}
			/>

			<div className="w-[95%] mx-auto px-6 py-8">
				{/* Header with Title, Filters, and Add Button */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
					<h2 className="text-2xl font-bold text-gray-900">{t("paymentTypes.pageTitle")}</h2>

					<div className="flex flex-wrap items-center gap-4">
						{/* Status Filter */}
						<div className="w-40">
							<FloatingLabelSelect
								label={t("paymentTypes.filters.status")}
								value={filters.is_active}
								onChange={e => handleFilterChange("is_active", e.target.value)}
								options={activeOptions}
							/>
						</div>

						<Button
							onClick={handleCreate}
							title={t("paymentTypes.addPaymentType")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
							icon={<BiPlus className="text-xl" />}
						/>
					</div>
				</div>

				{/* Table */}
				{loading ? (
					<LoadingSpan />
				) : (
					<>
						<Table
							columns={columns}
							data={paymentTypes}
							onView={handleView}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>

						{/* Pagination */}
						<Pagination
							currentPage={page}
							totalCount={count}
							pageSize={localPageSize}
							hasNext={hasNext}
							hasPrevious={hasPrevious}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
						/>
					</>
				)}
			</div>

			{/* Add/Edit Payment Type Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingPaymentType ? t("paymentTypes.modal.titleEdit") : t("paymentTypes.modal.titleAdd")}
				maxWidth="600px"
			>
				<div className="space-y-6 p-2">
					{/* Basic Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={t("paymentTypes.form.methodCode")}
							name="payment_method_code"
							value={formData.payment_method_code}
							onChange={e => handleInputChange("payment_method_code", e.target.value)}
							error={errors.payment_method_code}
							required
						/>
						<FloatingLabelInput
							label={t("paymentTypes.form.methodName")}
							name="payment_method_name"
							value={formData.payment_method_name}
							onChange={e => handleInputChange("payment_method_name", e.target.value)}
							error={errors.payment_method_name}
							required
						/>
					</div>

					{/* Description */}
					<FloatingLabelTextarea
						label={t("paymentTypes.form.description")}
						name="description"
						value={formData.description}
						onChange={e => handleInputChange("description", e.target.value)}
						rows={3}
					/>

					{/* Toggles */}
					<div className="flex flex-wrap items-center gap-6">
						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-gray-700">
								{t("paymentTypes.form.enableReconcile")}
							</span>
							<Toggle
								checked={formData.enable_reconcile}
								onChange={checked => handleInputChange("enable_reconcile", checked)}
							/>
						</div>

						<div className="flex items-center gap-3">
							<span className="text-sm font-medium text-gray-700">{t("paymentTypes.form.active")}</span>
							<Toggle
								checked={formData.is_active}
								onChange={checked => handleInputChange("is_active", checked)}
							/>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
						<Button
							onClick={handleCloseModal}
							title={t("paymentTypes.modal.cancel")}
							className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
						/>
						<Button
							onClick={handleSubmit}
							disabled={actionLoading}
							title={actionLoading ? t("paymentTypes.modal.saving") : t("paymentTypes.modal.save")}
							className="bg-[#28819C] hover:bg-[#206b85] text-white"
						/>
					</div>
				</div>
			</SlideUpModal>

			{/* View Payment Type Modal */}
			<SlideUpModal
				isOpen={isViewModalOpen}
				onClose={handleCloseViewModal}
				title={t("paymentTypes.viewModal.title")}
				maxWidth="600px"
			>
				{viewingPaymentType && (
					<div className="space-y-4 p-2">
						{/* Method Code & Name */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("paymentTypes.form.methodCode")}
								</label>
								<p className="text-gray-900 font-mono">{viewingPaymentType.payment_method_code}</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("paymentTypes.form.methodName")}
								</label>
								<p className="text-gray-900 font-semibold">{viewingPaymentType.payment_method_name}</p>
							</div>
						</div>

						{/* Description */}
						<div>
							<label className="block text-sm font-medium text-gray-500 mb-1">
								{t("paymentTypes.form.description")}
							</label>
							<p className="text-gray-900">{viewingPaymentType.description || "-"}</p>
						</div>

						{/* Status Badges */}
						<div className="flex flex-wrap gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("paymentTypes.form.enableReconcile")}
								</label>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
										viewingPaymentType.enable_reconcile
											? "bg-green-100 text-green-800"
											: "bg-gray-100 text-gray-800"
									}`}
								>
									{viewingPaymentType.enable_reconcile
										? t("paymentTypes.filters.active")
										: t("paymentTypes.filters.inactive")}
								</span>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("paymentTypes.form.active")}
								</label>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
										viewingPaymentType.is_active
											? "bg-green-100 text-green-800"
											: "bg-red-100 text-red-800"
									}`}
								>
									{viewingPaymentType.is_active
										? t("paymentTypes.filters.active")
										: t("paymentTypes.filters.inactive")}
								</span>
							</div>
						</div>

						{/* Timestamps */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("paymentTypes.viewModal.createdAt")}
								</label>
								<p className="text-gray-900 text-sm">
									{viewingPaymentType.created_at
										? new Date(viewingPaymentType.created_at).toLocaleString()
										: "-"}
								</p>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-500 mb-1">
									{t("paymentTypes.viewModal.updatedAt")}
								</label>
								<p className="text-gray-900 text-sm">
									{viewingPaymentType.updated_at
										? new Date(viewingPaymentType.updated_at).toLocaleString()
										: "-"}
								</p>
							</div>
						</div>

						{/* Close Button */}
						<div className="flex justify-end pt-4 border-t border-gray-200">
							<Button
								onClick={handleCloseViewModal}
								title={t("paymentTypes.viewModal.close")}
								className="bg-[#28819C] hover:bg-[#206b85] text-white"
							/>
						</div>
					</div>
				)}
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDelete}
				onClose={() => {
					setConfirmDelete(false);
					setPaymentTypeToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("paymentTypes.deleteConfirm.title")}
				message={t("paymentTypes.deleteConfirm.message", {
					name: paymentTypeToDelete?.payment_method_name,
				})}
				confirmText={t("paymentTypes.deleteConfirm.confirm")}
				cancelText={t("paymentTypes.deleteConfirm.cancel")}
			/>
		</div>
	);
};

export default PaymentTypesPage;
