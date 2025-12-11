import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { BiPlus } from "react-icons/bi";
import Button from "../shared/Button";
import SlideUpModal from "../shared/SlideUpModal";
import ConfirmModal from "../shared/ConfirmModal";
import LoadingSpan from "../shared/LoadingSpan";
import SegmentTypeForm from "../forms/SegmentTypeForm";
import { fetchSegmentTypes, createSegmentType, updateSegmentType, deleteSegmentType } from "../../store/segmentsSlice";
import SegmentTypeCard from "./SegmentTypeCard";

const INITIAL_SEGMENT_FORM = {
	segment_name: "",
	length: "",
	display_order: "",
	description: "",
	is_required: false,
	has_hierarchy: false,
	is_active: true,
};

const SegmentTypes = ({ types, loading }) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [currentSegmentId, setCurrentSegmentId] = useState(null);
	const [formData, setFormData] = useState(INITIAL_SEGMENT_FORM);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [errors, setErrors] = useState({});

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.segment_name.trim()) {
			newErrors.segment_name = t("segments.validation.nameRequired");
		}

		if (!formData.length) {
			newErrors.length = t("segments.validation.lengthRequired");
		}

		if (!formData.display_order) {
			newErrors.display_order = t("segments.validation.orderRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAddOrUpdateSegment = async () => {
		if (!validateForm()) {
			return;
		}

		const segmentData = {
			segment_name: formData.segment_name,
			length: parseInt(formData.length),
			display_order: parseInt(formData.display_order),
			description: formData.description || null,
			is_required: formData.is_required,
			has_hierarchy: formData.has_hierarchy,
			is_active: formData.is_active,
		};

		try {
			if (isEditMode && currentSegmentId) {
				await dispatch(updateSegmentType({ id: currentSegmentId, data: segmentData })).unwrap();
				toast.success(t("segments.messages.typeUpdated"));
			} else {
				await dispatch(createSegmentType(segmentData)).unwrap();
				toast.success(t("segments.messages.typeCreated"));
			}
			handleCloseModal();
			dispatch(fetchSegmentTypes());
		} catch (error) {
			console.error("Error saving segment:", error);
			toast.error(isEditMode ? t("segments.messages.errorUpdateType") : t("segments.messages.errorCreateType"));
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsEditMode(false);
		setCurrentSegmentId(null);
		setFormData(INITIAL_SEGMENT_FORM);
		setErrors({});
	};

	const handleEditSegment = segment => {
		setIsEditMode(true);
		setCurrentSegmentId(segment.id);
		setFormData({
			segment_name: segment.segment_name,
			length: segment.length?.toString() || "",
			display_order: segment.display_order?.toString() || "",
			description: segment.description || "",
			is_required: segment.is_required,
			has_hierarchy: segment.has_hierarchy,
			is_active: segment.is_active,
		});
		setIsModalOpen(true);
	};

	const handleDeleteClick = segment => {
		setItemToDelete(segment);
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		if (itemToDelete) {
			try {
				await dispatch(deleteSegmentType(itemToDelete.id)).unwrap();
				toast.success(t("segments.messages.typeDeleted"));
				setShowDeleteModal(false);
				setItemToDelete(null);
				dispatch(fetchSegmentTypes());
			} catch (error) {
				console.error("Error deleting segment:", error);
				toast.error(t("segments.messages.errorDeleteType"));
			}
		}
	};

	const toggleRequired = async segment => {
		try {
			await dispatch(
				updateSegmentType({
					id: segment.id,
					data: { ...segment, is_required: !segment.is_required },
				})
			).unwrap();
			toast.success(t("segments.messages.typeUpdated"));
			dispatch(fetchSegmentTypes());
		} catch (error) {
			console.error("Error updating segment:", error);
			toast.error(t("segments.messages.errorUpdateType"));
		}
	};

	const toggleHierarchy = async segment => {
		try {
			await dispatch(
				updateSegmentType({
					id: segment.id,
					data: { ...segment, has_hierarchy: !segment.has_hierarchy },
				})
			).unwrap();
			toast.success(t("segments.messages.typeUpdated"));
			dispatch(fetchSegmentTypes());
		} catch (error) {
			console.error("Error updating segment:", error);
			toast.error(t("segments.messages.errorUpdateType"));
		}
	};

	return (
		<div className="w-[95%] mx-auto py-6">
			{/* Header with Add Button */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-900">{t("segments.types.title")}</h2>
				<Button
					onClick={() => setIsModalOpen(true)}
					disabled={loading}
					title={t("segments.types.addBtn")}
					icon={<BiPlus size={25} />}
				/>
			</div>

			{/* Segments Grid */}
			{loading ? (
				<LoadingSpan text={t("segments.types.loading")} />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{types.map(segment => (
						<SegmentTypeCard
							key={segment.id}
							segment={segment}
							isRtl={isRtl}
							onEdit={handleEditSegment}
							onDelete={handleDeleteClick}
							onToggleRequired={toggleRequired}
							onToggleHierarchy={toggleHierarchy}
						/>
					))}
				</div>
			)}

			{/* Add/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={isEditMode ? t("segments.modals.editType") : t("segments.modals.addType")}
				className="w-full"
				maxWidth="550px"
			>
				<SegmentTypeForm
					formData={formData}
					errors={errors}
					loading={loading}
					isEditMode={isEditMode}
					onInputChange={handleInputChange}
					onSubmit={handleAddOrUpdateSegment}
					onCancel={handleCloseModal}
				/>
			</SlideUpModal>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={showDeleteModal}
				onClose={() => {
					setShowDeleteModal(false);
					setItemToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("segments.modals.deleteType")}
				message={t("segments.modals.deleteTypeMsg", { name: itemToDelete?.segment_name })}
				confirmText={t("segments.actions.delete")}
				cancelText={t("segments.actions.cancel")}
			/>
		</div>
	);
};

export default SegmentTypes;
