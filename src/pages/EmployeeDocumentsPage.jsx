import React, { useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
	HiOutlineDocumentText,
	HiOutlineEye,
	HiOutlineDownload,
	HiOutlinePencilAlt,
	HiOutlinePlus,
	HiOutlineX,
} from "react-icons/hi";

import PageHeader from "../components/shared/PageHeader";
import Button from "../components/shared/Button";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import Toggle from "../components/shared/Toggle";
import Pagination from "../components/shared/Pagination";
import Table from "../components/shared/Table";
import { IoMdCloudUpload } from "react-icons/io";
import NationalIDIcon from "../assets/NationalID.svg?react";
import PassportIcon from "../assets/Passport.svg?react";
import EmploymentContractIcon from "../assets/EmploymentContract.svg?react";
import UniversityDegreeIcon from "../assets/UniversityDegree.svg?react";
import InsurancePolicyIcon from "../assets/InsurancePolicy.svg?react";

function FileUploadComponent() {
	const { t } = useTranslation();
	const [dragActive, setDragActive] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const inputRef = useRef(null);

	const handleDrag = e => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = e => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			handleFiles(Array.from(e.dataTransfer.files));
		}
	};

	const handleChange = e => {
		e.preventDefault();
		if (e.target.files && e.target.files.length > 0) {
			handleFiles(Array.from(e.target.files));
		}
	};

	const handleFiles = files => {
		const allowedTypes = ["image/svg+xml", "image/png", "image/jpeg", "application/pdf"];
		const maxSize = 5 * 1024 * 1024; // 5MB

		const validFiles = files.filter(file => {
			if (!allowedTypes.includes(file.type)) {
				alert(`${file.name}: Please upload SVG, PNG, JPG or PDF files only`);
				return false;
			}

			if (file.size > maxSize) {
				alert(`${file.name}: File size must be less than 5MB`);
				return false;
			}

			return true;
		});

		setSelectedFiles(prev => [
			...prev,
			...validFiles.map((file, index) => ({
				id: Date.now() + index,
				file,
				name: file.name,
				size: file.size,
			})),
		]);
	};

	const removeFile = id => {
		setSelectedFiles(prev => prev.filter(f => f.id !== id));
	};

	const handleButtonClick = () => {
		inputRef.current?.click();
	};

	const formatFileSize = bytes => {
		if (bytes < 1024) return bytes + " B";
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
		return (bytes / (1024 * 1024)).toFixed(2) + " MB";
	};

	return (
		<div>
			<h3 className="text-base font-semibold text-gray-900 mb-4">
				{t("employeeDocuments.modals.sections.uploadFile")}
			</h3>

			<div
				className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
					dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50"
				}`}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
			>
				<div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
					<IoMdCloudUpload className="w-6 h-6 text-blue-500" />
				</div>

				<p className="text-sm font-medium text-gray-700 mb-1">
					{t("employeeDocuments.modals.upload.instructions")}
				</p>

				<p className="text-xs text-gray-500 mb-4">{t("employeeDocuments.modals.upload.formats")}</p>

				<input
					ref={inputRef}
					type="file"
					className="hidden"
					accept=".svg,.png,.jpg,.jpeg,.pdf"
					onChange={handleChange}
					multiple
				/>

				<button
					onClick={handleButtonClick}
					className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
				>
					{t("employeeDocuments.modals.upload.browse")}
				</button>
			</div>

			{selectedFiles.length > 0 && (
				<div className="mt-4 space-y-2">
					{selectedFiles.map(fileObj => (
						<div
							key={fileObj.id}
							className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
						>
							<div className="flex items-center gap-3 flex-1 min-w-0">
								<div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
									<HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-gray-900 truncate">{fileObj.name}</p>
									<p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
								</div>
							</div>
							<button
								onClick={() => removeFile(fileObj.id)}
								className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors"
								title="Remove file"
							>
								<HiOutlineX className="w-5 h-5" />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

const EmployeeDocumentsPage = () => {
	const { t } = useTranslation();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [selectedDoc, setSelectedDoc] = useState(null);
	const [page, setPage] = useState(2);
	const pageSize = 5;

	// Documents state management
	const [documents, setDocuments] = useState([
		{
			id: 1,
			type: "National ID",
			category: "Identification",
			format: "PDF",
			size: "2.4 MB",
			uploadedDate: "Jan 15, 2023",
			expiryDate: "Jan 15, 2028",
			status: "active",
			color: "bg-blue-100 text-blue-700",
			iconColor: "bg-blue-50 text-blue-600",
		},
		{
			id: 2,
			type: "Passport",
			category: "Identification",
			format: "JPG",
			size: "1.8 MB",
			uploadedDate: "Mar 10, 2020",
			expiryDate: "Nov 01, 2024",
			status: "expiring",
			color: "bg-orange-100 text-orange-700",
			iconColor: "bg-orange-50 text-orange-600",
		},
		{
			id: 3,
			type: "Employment Contract",
			category: "Legal",
			format: "PDF",
			size: "3.3 MB",
			uploadedDate: "Jan 01, 2022",
			expiryDate: "Dec 31, 2023",
			status: "expired",
			color: "bg-red-100 text-red-700",
			iconColor: "bg-red-50 text-red-600",
			actionRequired: true,
		},
		{
			id: 4,
			type: "University Degree",
			category: "Education",
			format: "PDF",
			size: "5.1 MB",
			uploadedDate: "Feb 20, 2023",
			expiryDate: "No expiry",
			status: "verified",
			color: "bg-green-100 text-green-700",
			iconColor: "bg-purple-50 text-purple-600",
		},
		{
			id: 5,
			type: "Insurance Policy",
			category: "Insurance",
			format: "PDF",
			size: "1.2 MB",
			uploadedDate: "Today",
			expiryDate: "Dec 31, 2025",
			status: "processing",
			color: "bg-gray-100 text-gray-700",
			iconColor: "bg-gray-50 text-gray-500",
		},
	]);

	useEffect(() => {
		document.title = `${t("employeeDocuments.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	const docTypeOptions = useMemo(
		() => [
			{ value: "", label: t("employeeDocuments.modals.fields.documentType") },
			...Array.from(new Set(documents.map(doc => doc.type))).map(type => ({ value: type, label: type })),
		],
		[t, documents]
	);

	const categoryOptions = useMemo(
		() => [
			{ value: "", label: t("employeeDocuments.modals.fields.documentCategory") },
			...Array.from(new Set(documents.map(doc => doc.category))).map(category => ({
				value: category,
				label: category,
			})),
		],
		[t, documents]
	);

	const handleOpenEdit = doc => {
		setSelectedDoc(doc);
		setIsEditModalOpen(true);
	};

	const handleOpenUpload = () => {
		setSelectedDoc(null);
		setIsUploadModalOpen(true);
	};

	const renderStatus = status => {
		const statusMap = {
			active: { className: "bg-green-100 text-green-700", label: t("employeeDocuments.status.active") },
			expiring: { className: "bg-amber-100 text-amber-700", label: t("employeeDocuments.status.expiring") },
			expired: { className: "bg-red-100 text-red-700", label: t("employeeDocuments.status.expired") },
			verified: { className: "bg-green-100 text-green-700", label: t("employeeDocuments.status.verified") },
			processing: {
				className: "bg-gray-100 text-gray-600",
				label: t("employeeDocuments.status.processing"),
			},
		};
		const statusInfo = statusMap[status] || statusMap.processing;
		return (
			<span
				className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-2 ${statusInfo.className}`}
			>
				<span className="w-2 h-2 rounded-full bg-current/60" />
				{statusInfo.label}
			</span>
		);
	};

	const DOCUMENT_TYPE_ICONS = {
		"National ID": NationalIDIcon,
		Passport: PassportIcon,
		"Employment Contract": EmploymentContractIcon,
		"University Degree": UniversityDegreeIcon,
		"Insurance Policy": InsurancePolicyIcon,
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<PageHeader
				icon={<HiOutlineDocumentText className="w-8 h-8 text-white mr-3" />}
				title={t("employeeDocuments.title")}
				subtitle={t("employeeDocuments.subtitle")}
			/>

			<div className="px-6 py-8">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-[#1D7A8C]">{t("employeeDocuments.gridTitle")}</h2>
					<div className="flex items-center gap-3">
						<Button
							onClick={() => handleOpenEdit(documents[0])}
							title={t("employeeDocuments.buttons.editProfile")}
							icon={<HiOutlinePencilAlt className="w-5 h-5" />}
							className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
						/>
						<Button
							onClick={handleOpenUpload}
							title={t("employeeDocuments.buttons.uploadDocument")}
							icon={<HiOutlinePlus className="w-5 h-5" />}
							className="px-4"
						/>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-lg p-4">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide">
										{t("employeeDocuments.table.documentType")}
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide">
										{t("employeeDocuments.table.uploadedDate")}
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide">
										{t("employeeDocuments.table.expiryDate")}
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide">
										{t("employeeDocuments.table.status")}
									</th>
									<th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 tracking-wide">
										{t("employeeDocuments.table.actions")}
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{documents.map(doc => {
									const IconComponent = DOCUMENT_TYPE_ICONS[doc.type] || HiOutlineDocumentText;
									const isExpired = doc.status === "expired";
									const isExpiring = doc.status === "expiring";

									return (
										<tr
											key={doc.id}
											className={`hover:bg-gray-50 ${isExpired ? "bg-red-50/60" : ""}`}
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<span
														className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold ${doc.iconColor}`}
													>
														<IconComponent className="w-5 h-5" />
													</span>
													<div className="text-left">
														<p className="font-semibold text-gray-900">{doc.type}</p>
														<p className="text-xs text-gray-500">
															{doc.format} • {doc.size}
														</p>
														{doc.actionRequired && (
															<p className="text-xs text-red-500 font-medium">
																{t("employeeDocuments.badges.actionRequired")}
															</p>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 text-gray-700 whitespace-nowrap">
												{doc.uploadedDate}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={
														isExpired
															? "text-red-600 font-semibold"
															: isExpiring
															? "text-orange-500 font-semibold"
															: "text-gray-700"
													}
												>
													{doc.expiryDate}
												</span>
											</td>
											<td className="px-6 py-4">{renderStatus(doc.status)}</td>
											<td className="px-6 py-4">
												<div className="flex items-center justify-end gap-3">
													<button
														title={t("employeeDocuments.actions.view")}
														className="text-gray-500 hover:text-[#1D7A8C]"
													>
														<HiOutlineEye className="w-5 h-5" />
													</button>
													{isExpired && (
														<button
															onClick={handleOpenUpload}
															className="px-3 py-1 rounded-md bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200"
														>
															{t("employeeDocuments.actions.renewNow")}
														</button>
													)}
													{!isExpired && (
														<button
															title={t("employeeDocuments.actions.download")}
															className="text-gray-500 hover:text-[#1D7A8C]"
															onClick={() => {
																// Handle download logic here
																console.log("Downloading document:", doc.id, doc.type);
															}}
														>
															<HiOutlineDownload className="w-5 h-5" />
														</button>
													)}
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					<div className="mt-6">
						<Pagination
							currentPage={page}
							totalCount={25}
							pageSize={pageSize}
							onPageChange={setPage}
							onPageSizeChange={() => {}}
							hasNext
							hasPrevious
							showPageSizeSelector={false}
						/>
					</div>
				</div>
			</div>

			<SlideUpModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				title={t("employeeDocuments.modals.editProfile")}
				maxWidth="900px"
			>
				<div className="space-y-6">
					{/* Document Information Section */}
					<div>
						<h3 className="text-base font-semibold text-gray-900 mb-4">
							{t("employeeDocuments.modals.sections.documentInformation")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("employeeDocuments.modals.fields.documentType")}
								name="documentType"
								options={docTypeOptions}
								value={selectedDoc?.type || ""}
								onChange={() => {}}
							/>
							<FloatingLabelSelect
								label={t("employeeDocuments.modals.fields.documentCategory")}
								name="documentCategory"
								options={categoryOptions}
								value={selectedDoc?.category || ""}
								onChange={() => {}}
							/>

							<div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold text-gray-700">
										{t("employeeDocuments.modals.fields.isMandatory")}
									</span>
									<Toggle checked label="" onChange={() => {}} />
								</div>
							</div>
							<div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold text-gray-700">
										{t("employeeDocuments.modals.fields.requiresExpiry")}
									</span>
									<Toggle checked label="" onChange={() => {}} />
								</div>
							</div>
						</div>
					</div>

					{/* Dates Section */}
					<div>
						<h3 className="text-base font-semibold text-gray-900 mb-4">
							{t("employeeDocuments.modals.sections.dates")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("employeeDocuments.modals.fields.uploadedDate")}
								name="uploadedDate"
								type="date"
								value=""
								onChange={() => {}}
							/>
							<FloatingLabelInput
								label={t("employeeDocuments.modals.fields.expiryDate")}
								name="expiryDate"
								type="date"
								value=""
								onChange={() => {}}
							/>
						</div>
					</div>

					{/* Status Management Section */}
					<div>
						<h3 className="text-base font-semibold text-gray-900 mb-4">
							{t("employeeDocuments.modals.sections.statusManagement")}
						</h3>
						<div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-semibold text-gray-700">
									{t("employeeDocuments.modals.fields.status")}
								</span>
								<Toggle checked label="" onChange={() => {}} />
							</div>
						</div>
					</div>

					{/* Visibility & Validation Rules Section */}
					<div>
						<h3 className="text-base font-semibold text-gray-900 mb-4">
							{t("employeeDocuments.modals.sections.visibilityValidation")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold text-gray-700">
										{t("employeeDocuments.modals.fields.visibleToEmployee")}
									</span>
									<Toggle checked label="" onChange={() => {}} />
								</div>
							</div>
							<div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold text-gray-700">
										{t("employeeDocuments.modals.fields.requiresApproval")}
									</span>
									<Toggle checked label="" onChange={() => {}} />
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 pt-6">
					<Button
						onClick={() => setIsEditModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
					<Button title={t("common.update")} />
				</div>
			</SlideUpModal>

			<SlideUpModal
				isOpen={isUploadModalOpen}
				onClose={() => setIsUploadModalOpen(false)}
				title={t("employeeDocuments.modals.uploadDocument")}
				maxWidth="900px"
			>
				<div className="space-y-6">
					{/* Document Details Section */}
					<div>
						<h3 className="text-base font-semibold text-gray-900 mb-4">
							{t("employeeDocuments.modals.sections.documentDetails")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelSelect
								label={t("employeeDocuments.modals.fields.documentType")}
								name="uploadDocumentType"
								options={docTypeOptions}
								value=""
								onChange={() => {}}
							/>
							<FloatingLabelSelect
								label={t("employeeDocuments.modals.fields.documentCategory")}
								name="uploadDocumentCategory"
								options={categoryOptions}
								value=""
								onChange={() => {}}
							/>

							<div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 md:col-span-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-semibold text-gray-700">
										{t("employeeDocuments.modals.fields.isMandatory")}
									</span>
									<Toggle checked label="" onChange={() => {}} />
								</div>
							</div>
						</div>
					</div>

					{/* Upload File Section */}
					<FileUploadComponent />

					{/* Dates Section */}
					<div>
						<h3 className="text-base font-semibold text-gray-900 mb-4">
							{t("employeeDocuments.modals.sections.dates")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<FloatingLabelInput
								label={t("employeeDocuments.modals.fields.uploadedDate")}
								name="uploadUploadedDate"
								type="date"
								value=""
								onChange={() => {}}
							/>
							<FloatingLabelInput
								label={t("employeeDocuments.modals.fields.expiryDate")}
								name="uploadExpiryDate"
								type="date"
								value=""
								onChange={() => {}}
							/>
						</div>
					</div>

					{/* Status Section */}
					<div>
						<h3 className="text-base font-semibold text-gray-900 mb-4">
							{t("employeeDocuments.modals.sections.status")}
						</h3>
						<div className="bg-white rounded-2xl border border-gray-200 px-4 py-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-semibold text-gray-700">
									{t("employeeDocuments.modals.fields.status")}
								</span>
								<Toggle checked label="" onChange={() => {}} />
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center justify-end gap-3 pt-6">
					<Button
						onClick={() => setIsUploadModalOpen(false)}
						title={t("common.cancel")}
						className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
					<Button title={t("employeeDocuments.buttons.upload")} />
				</div>
			</SlideUpModal>
		</div>
	);
};

export default EmployeeDocumentsPage;
