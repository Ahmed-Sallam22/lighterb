import { useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Table from "../shared/Table";
import Toolbar from "../shared/Toolbar";
import SlideUpModal from "../shared/SlideUpModal";
import ConfirmModal from "../shared/ConfirmModal";
import SegmentValueForm from "../forms/SegmentValueForm";
import {
	fetchSegmentValues,
	createSegmentValue,
	updateSegmentValue,
	deleteSegmentValue,
} from "../../store/segmentsSlice";
import Button from "../shared/Button";

const SegmentValues = ({ types, values, loading, selectedSegmentType, onSegmentTypeChange }) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [currentValueId, setCurrentValueId] = useState(null);
	const [selectedSegmentTypeLength, setSelectedSegmentTypeLength] = useState(null);
	const [formData, setFormData] = useState({
		segment_type: "",
		code: "",
		alias: "",
		parent_code: null,
		parent: null,
		node_type: "child",
		is_active: true,
	});
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [errors, setErrors] = useState({});

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));

		// When segment type is selected, get its length
		if (field === "segment_type") {
			const selectedType = types.find(type => type.segment_id.toString() === value);
			if (selectedType) {
				setSelectedSegmentTypeLength(selectedType.length);
			} else {
				setSelectedSegmentTypeLength(null);
			}
		}

		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.segment_type) {
			newErrors.segment_type = t("segments.validation.typeRequired");
		}

		if (!formData.code.trim()) {
			newErrors.code = t("segments.validation.codeRequired");
		} else if (selectedSegmentTypeLength && formData.code.length !== selectedSegmentTypeLength) {
			newErrors.code = t("segments.validation.codeLength", { length: selectedSegmentTypeLength });
		}

		if (!formData.alias.trim()) {
			newErrors.alias = t("segments.validation.aliasRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleAddOrUpdate = async () => {
		if (!validateForm()) {
			return;
		}

		const valueData = {
			segment_type: parseInt(formData.segment_type),
			code: formData.code,
			alias: formData.alias,
			node_type: formData.node_type,
			is_active: formData.is_active,
			parent_code: formData.parent_code || null,
			parent: formData.parent || null,
			children: [],
		};

		try {
			if (isEditMode && currentValueId) {
				await dispatch(updateSegmentValue({ id: currentValueId, data: valueData })).unwrap();
				toast.success(t("segments.messages.valueUpdated"));
			} else {
				await dispatch(createSegmentValue(valueData)).unwrap();
				toast.success(t("segments.messages.valueCreated"));
			}
			handleCloseModal();
			dispatch(fetchSegmentValues({ segment_type: selectedSegmentType }));
		} catch (error) {
			console.error("Error saving segment value:", error);
			toast.error(isEditMode ? t("segments.messages.errorUpdateValue") : t("segments.messages.errorCreateValue"));
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setIsEditMode(false);
		setCurrentValueId(null);
		setSelectedSegmentTypeLength(null);
		setFormData({
			segment_type: "",
			code: "",
			alias: "",
			parent_code: null,
			parent: null,
			node_type: "child",
			is_active: true,
		});
		setErrors({});
	};

	const handleEdit = row => {
		setIsEditMode(true);
		setCurrentValueId(row.id);

		// Find the segment type and set its length
		const selectedType = types.find(type => type.segment_id === row.segment_type);
		if (selectedType) {
			setSelectedSegmentTypeLength(selectedType.length);
		}

		setFormData({
			segment_type: row.segment_type.toString(),
			code: row.code,
			alias: row.alias,
			parent_code: row.parent_code,
			parent: row.parent,
			node_type: row.node_type,
			is_active: row.is_active,
		});
		setIsModalOpen(true);
	};

	const handleDeleteClick = row => {
		setItemToDelete(row);
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		if (itemToDelete) {
			try {
				await dispatch(deleteSegmentValue(itemToDelete.id)).unwrap();
				toast.success(t("segments.messages.valueDeleted"));
				setShowDeleteModal(false);
				setItemToDelete(null);
				dispatch(fetchSegmentValues({ segment_type: selectedSegmentType }));
			} catch (error) {
				console.error("Error deleting segment value:", error);
				toast.error(t("segments.messages.errorDeleteValue"));
			}
		}
	};

	const handleSearchChange = value => {
		setSearchQuery(value);
	};

	// Table columns
	const columns = useMemo(
		() => [
			{
				header: t("segments.table.id"),
				accessor: "id",
				width: "80px",
				render: value => <span className="font-semibold text-gray-900">{value}</span>,
			},
			{
				header: t("segments.table.code"),
				accessor: "code",
				width: "120px",
				render: value => <span className="font-semibold text-gray-700">{value}</span>,
			},
			{
				header: t("segments.table.alias"),
				accessor: "alias",
				render: value => <span className="text-gray-900">{value}</span>,
			},
			{
				header: t("segments.table.name"),
				accessor: "name",
				render: value => <span className="text-gray-600 text-sm">{value}</span>,
			},
			{
				header: t("segments.table.type"),
				accessor: "segment_type_name",
				width: "140px",
				render: value => <span className="font-semibold text-[#28819C]">{value}</span>,
			},
			{
				header: t("segments.table.parent"),
				accessor: "parent_code",
				width: "100px",
				render: value => <span className="text-gray-600">{value || "-"}</span>,
			},
			{
				header: t("segments.table.nodeType"),
				accessor: "node_type",
				width: "100px",
				render: value => (
					<span className={`font-medium ${value === "parent" ? "text-blue-600" : "text-green-600"}`}>
						{value === "parent" ? t("segments.form.parentNode") : t("segments.form.childNode")}
					</span>
				),
			},
			{
				header: t("segments.table.level"),
				accessor: "level",
				width: "80px",
				render: value => <span className="text-gray-600">{value}</span>,
			},
			{
				header: t("segments.table.status"),
				accessor: "is_active",
				width: "100px",
				render: value => (
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
							value ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
						}`}
					>
						{value ? t("segments.status.active") : t("segments.status.inactive")}
					</span>
				),
			},
		],
		[t]
	);

	// Segment type options for dropdown
	const segmentTypeOptions = types.map(type => ({
		value: type.segment_id.toString(),
		label: type.segment_name,
	}));

	const nodeTypeOptions = [
		{ value: "child", label: t("segments.form.childNode") },
		{ value: "parent", label: t("segments.form.parentNode") },
	];

	// Filter values based on search query
	const filteredValues = values.filter(value => {
		if (!searchQuery) return true;
		const search = searchQuery.toLowerCase();
		return (
			value.code?.toLowerCase().includes(search) ||
			value.alias?.toLowerCase().includes(search) ||
			value.name?.toLowerCase().includes(search)
		);
	});

	return (
		<div className="w-[95%] mx-auto py-6">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">{t("segments.values.title")}</h2>

			{/* Toolbar */}
			<Toolbar
				searchPlaceholder={t("segments.values.searchPlaceholder")}
				filterOptions={[{ value: "", label: t("segments.values.allTypes") }, ...segmentTypeOptions]}
				createButtonText={t("segments.values.addBtn")}
				onSearchChange={handleSearchChange}
				onFilterChange={onSegmentTypeChange}
				onCreateClick={() => setIsModalOpen(true)}
			/>

			{/* Table */}
			<div className="mt-6">
				{loading ? (
					<div className="text-center py-10">
						<p className="text-gray-500">{t("segments.values.loading")}</p>
					</div>
				) : (
					<Table
						columns={columns}
						data={filteredValues}
						onEdit={handleEdit}
						onDelete={handleDeleteClick}
						editIcon="edit"
						emptyMessage={t("segments.values.empty")}
						showDeleteButton={row => row.can_delete !== false}
					/>
				)}
			</div>

			{/* Add/Edit Modal */}
			<SlideUpModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={isEditMode ? t("segments.modals.editValue") : t("segments.modals.addValue")}
				maxWidth="550px"
			>
				<SegmentValueForm
					formData={formData}
					errors={errors}
					loading={loading}
					isEditMode={isEditMode}
					selectedSegmentTypeLength={selectedSegmentTypeLength}
					segmentTypeOptions={segmentTypeOptions}
					nodeTypeOptions={nodeTypeOptions}
					onInputChange={handleInputChange}
					onSubmit={handleAddOrUpdate}
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
				title={t("segments.modals.deleteValue")}
				message={t("segments.modals.deleteValueMsg", { code: itemToDelete?.code, alias: itemToDelete?.alias })}
				confirmText={t("segments.actions.delete")}
				cancelText={t("segments.actions.cancel")}
			/>
		</div>
	);
};

export default SegmentValues;
