import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { usePageTitle } from "../hooks/usePageTitle";
import { HiOutlineAcademicCap } from "react-icons/hi";
import { parseApiError } from "../utils/errorHandler";

import PageHeader from "../components/shared/PageHeader";
import Button from "../components/shared/Button";
import SlideUpModal from "../components/shared/SlideUpModal";
import CustomInput from "../components/shared/CustomInput";
import CustomDropdown from "../components/shared/CustomDropdown";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import ConfirmModal from "../components/shared/ConfirmModal";
import CompetenceDetailsIcon from "../assets/icons/CompetencedetailsIcon";
import JudjeIcon from "../assets/icons/JudjeIcon";

import {
	fetchCompetencies,
	fetchCompetencyById,
	createCompetency,
	updateCompetency,
	deleteCompetency,
	fetchCompetencyCategories,
	setPage,
} from "../store/competenciesSlice";

const FORM_INITIAL = {
	code: "",
	name: "",
	description: "",
	competency_category_id: "",
};

const CompetenciesPage = () => {
	const { t } = useTranslation();
	usePageTitle(t("competencies.title"));
	const dispatch = useDispatch();

	// Redux state
	const {
		competencies,
		competencyCategories,
		loading,
		count,
		page: currentPage,
		hasNext,
		hasPrevious,
		creating,
		updating,
	} = useSelector(state => state.competencies);

	// Local state
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCompetency, setEditingCompetency] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [formData, setFormData] = useState(FORM_INITIAL);
	const [formErrors, setFormErrors] = useState({});
	const [localPageSize, setLocalPageSize] = useState(25);

	// Fetch initial data
	useEffect(() => {
		dispatch(fetchCompetencyCategories());
	}, [dispatch]);

	// Fetch competencies when page changes
	useEffect(() => {
		const params = { page: currentPage, page_size: localPageSize };
		dispatch(fetchCompetencies(params));
	}, [dispatch, currentPage, localPageSize]);

	const categoryOptions = useMemo(
		() => [
			{ value: "", label: t("competencies.fields.selectCategory") },
			...(competencyCategories || []).map(cat => ({
				value: cat.id,
				label: cat.name,
			})),
		],
		[competencyCategories, t]
	);

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
			const params = { page: 1, page_size: newPageSize };
			dispatch(fetchCompetencies(params));
		},
		[dispatch]
	);

	const handleCreate = () => {
		setEditingCompetency(null);
		setFormData(FORM_INITIAL);
		setFormErrors({});
		setIsModalOpen(true);
	};

	const handleEdit = async item => {
		try {
			setEditingCompetency(item);
			const competencyData = await dispatch(fetchCompetencyById(item.id)).unwrap();
			setFormData({
				code: competencyData.code || "",
				name: competencyData.name || "",
				description: competencyData.description || "",
				competency_category_id: competencyData.competency_category_id || "",
			});
			setFormErrors({});
			setIsModalOpen(true);
		} catch (error) {
			toast.error(parseApiError(error, t, "errors.generic"));
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setEditingCompetency(null);
		setFormData(FORM_INITIAL);
		setFormErrors({});
	};

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (formErrors[name]) {
			setFormErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const validateForm = () => {
		const errors = {};
		if (!formData.code?.trim()) {
			errors.code = t("competencies.fields.codeRequired");
		}
		if (!formData.name?.trim()) {
			errors.name = t("competencies.fields.nameRequired");
		}
		if (!formData.competency_category_id) {
			errors.competency_category_id = t("competencies.fields.categoryRequired");
		}
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		try {
			const payload = {
				code: formData.code.trim(),
				name: formData.name.trim(),
				competency_category_id: parseInt(formData.competency_category_id),
			};
			if (formData.description?.trim()) {
				payload.description = formData.description.trim();
			}

			if (editingCompetency) {
				await dispatch(updateCompetency({ id: editingCompetency.id, data: payload })).unwrap();
				toast.success(t("competencies.messages.updated"));
			} else {
				await dispatch(createCompetency(payload)).unwrap();
				toast.success(t("competencies.messages.created"));
			}
			const params = { page: currentPage, page_size: localPageSize };
			dispatch(fetchCompetencies(params));
			handleCloseModal();
		} catch (error) {
			toast.error(parseApiError(error, t, "competencies.messages.saveError"));
		}
	};

	const handleDeleteClick = item => {
		setItemToDelete(item);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		try {
			await dispatch(deleteCompetency(itemToDelete.id)).unwrap();
			toast.success(t("competencies.messages.deleted"));
			const params = { page: currentPage, page_size: localPageSize };
			dispatch(fetchCompetencies(params));
			setIsDeleteModalOpen(false);
			setItemToDelete(null);
		} catch (error) {
			toast.error(parseApiError(error, t, "competencies.messages.deleteError"));
		}
	};

	const handleCancelDelete = () => {
		setIsDeleteModalOpen(false);
		setItemToDelete(null);
	};

	const renderStatus = value => (
		<span
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
				value === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
			}`}
		>
			<span
				className={`w-2 h-2 rounded-full mr-1.5 ${value === "active" ? "bg-green-500" : "bg-gray-400"}`}
			></span>
			{value === "active" ? t("common.active") : t("common.inactive")}
		</span>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer position="top-right" autoClose={3000} />

			<PageHeader icon={<JudjeIcon />} title={t("competencies.title")} subtitle={t("competencies.subtitle")} />

			<div className="px-6 py-8">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("competencies.sectionTitle")}</h2>
						<Button
							onClick={handleCreate}
							title={t("competencies.buttons.addCompetencies")}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>

					<Table
						columns={[
							{
								header: t("competencies.table.code"),
								accessor: "code",
								render: value => value || "-",
							},
							{
								header: t("competencies.table.name"),
								accessor: "name",
								render: value => value || "-",
							},
							{
								header: t("competencies.table.category"),
								accessor: "competency_category_name",
								render: value => value || "-",
							},
							{
								header: t("competencies.table.description"),
								accessor: "description",
								render: value => value || "-",
							},
							{
								header: t("competencies.table.status"),
								accessor: "status",
								render: renderStatus,
							},
						]}
						data={competencies}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						emptyMessage={t("competencies.table.empty")}
						loading={loading}
					/>

					<div className="mt-6">
						<Pagination
							currentPage={currentPage}
							totalCount={count}
							pageSize={localPageSize}
							onPageChange={handlePageChange}
							onPageSizeChange={handlePageSizeChange}
							hasNext={hasNext}
							hasPrevious={hasPrevious}
						/>
					</div>
				</div>
			</div>

			{/* Create/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={editingCompetency ? t("competencies.modal.editTitle") : t("competencies.modal.createTitle")}
				maxWidth="600px"
			>
				<form onSubmit={handleSubmit} className="space-y-4 p-4">
					<CustomInput
						label={t("competencies.fields.code")}
						name="code"
						value={formData.code}
						onChange={handleInputChange}
						error={formErrors.code}
						required
						bgColor="bg-[#fff]"
					/>

					<CustomInput
						label={t("competencies.fields.name")}
						name="name"
						value={formData.name}
						onChange={handleInputChange}
						error={formErrors.name}
						required
						bgColor="bg-[#fff]"
					/>

					<CustomDropdown
						label={t("competencies.fields.category")}
						name="competency_category_id"
						value={formData.competency_category_id}
						onChange={handleInputChange}
						options={categoryOptions}
						error={formErrors.competency_category_id}
						required
						bgColor="bg-[#fff]"
						showBorder={true}
					/>

					<CustomInput
						label={t("competencies.fields.description")}
						name="description"
						value={formData.description}
						onChange={handleInputChange}
						error={formErrors.description}
						bgColor="bg-[#fff]"
						multiline
						rows={3}
					/>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							onClick={handleCloseModal}
							title={t("common.cancel")}
							className="bg-gray-200 hover:bg-gray-300 text-gray-800"
						/>
						<Button
							type="submit"
							disabled={creating || updating}
							title={
								creating || updating
									? t("common.saving")
									: editingCompetency
										? t("common.update")
										: t("common.create")
							}
							className="bg-[#1D7A8C] hover:bg-[#156576] text-white"
						/>
					</div>
				</form>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={isDeleteModalOpen}
				onClose={handleCancelDelete}
				onConfirm={handleConfirmDelete}
				title={t("competencies.deleteModal.title")}
				message={t("competencies.deleteModal.message", {
					name: itemToDelete?.name,
				})}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
			/>
		</div>
	);
};

export default CompetenciesPage;
