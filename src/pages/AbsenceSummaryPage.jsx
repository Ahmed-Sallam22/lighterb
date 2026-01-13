import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { HiOutlineUserGroup, HiOutlinePlus, HiOutlineExclamation, HiOutlineCheck } from "react-icons/hi";

import Button from "../components/shared/Button";
import Table from "../components/shared/Table";
import Pagination from "../components/shared/Pagination";
import SlideUpModal from "../components/shared/SlideUpModal";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelTextarea from "../components/shared/FloatingLabelTextarea";

const SUMMARY_CARDS = [
	{ id: "annual", titleKey: "annual", remaining: "12", unitKey: "days" },
	{ id: "sick", titleKey: "sick", remaining: "5", unitKey: "days" },
	{ id: "unlimited", titleKey: "annual", remaining: "Unlimited", unitKey: "days", isUnlimited: true },
];

const ABSENCES = [
	{
		id: 1,
		type: "Annual Leave",
		from: "01-Mar-2025",
		to: "05-Mar-2025",
		status: "rejected",
	},
	{
		id: 2,
		type: "Sick Leave",
		from: "12-Feb-2025",
		to: "12-Feb-2025",
		status: "pending",
	},
	{
		id: 3,
		type: "Annual Leave",
		from: "20-Apr-2025",
		to: "22-Apr-2025",
		status: "approved",
	},
];

const AbsenceSummaryPage = () => {
	const { t } = useTranslation();
	const [page, setPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showConflict, setShowConflict] = useState(false);
	const [formData, setFormData] = useState({
		type: "",
		startDate: "",
		endDate: "",
		reason: "",
	});

	useEffect(() => {
		document.title = `${t("absenceSummary.title")} - LightERP`;
		return () => {
			document.title = "LightERP";
		};
	}, [t]);

	const typeOptions = useMemo(
		() => [
			{ value: "", label: t("absenceSummary.form.type") },
			{ value: "annual", label: t("absenceSummary.types.annual") },
			{ value: "sick", label: t("absenceSummary.types.sick") },
			{ value: "unpaid", label: t("absenceSummary.types.unpaid") },
		],
		[t]
	);

	const statusBadge = status => {
		const map = {
			rejected: { label: t("absenceSummary.status.rejected"), className: "bg-orange-100 text-orange-700" },
			pending: { label: t("absenceSummary.status.pending"), className: "bg-gray-100 text-gray-700" },
			approved: { label: t("absenceSummary.status.approved"), className: "bg-green-100 text-green-700" },
		};
		const info = map[status] || map.pending;
		return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${info.className}`}>{info.label}</span>;
	};

	const columns = [
		{
			header: t("absenceSummary.table.type"),
			accessor: "type",
		},
		{
			header: "Phone",
			accessor: "from",
			render: (value, row) => (
				<span className="text-gray-700">
					{value} → {row.to}
				</span>
			),
		},
		{
			header: "Relationship",
			accessor: "status",
			render: value => statusBadge(value),
		},
	];

	const handleInputChange = e => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		if (name === "startDate" || name === "endDate") {
			setShowConflict(false);
		}
	};

	const handleSubmit = () => {
		if (!formData.type || !formData.startDate || !formData.endDate) {
			return;
		}
		// if start date is after end date, show conflict
		if (new Date(formData.startDate) > new Date(formData.endDate)) {
			setShowConflict(true);
			return;
		}
		// Here you would normally handle form submission, e.g., send data to the server
		// For this example, we'll just close the modal
		setIsModalOpen(false);
		setShowConflict(false);
		// Reset form
		setFormData({
			type: "",
			startDate: "",
			endDate: "",
			reason: "",
		});
	};

	return (
		<div className="min-h-screen bg-[#f1f1f1]">
			<div className="px-6 py-8 space-y-6">
				<div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6">
					<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
						<div className="bg-[#f3f3f3] px-6 py-10 flex items-center justify-center">
							<div className="relative">
								<div className="w-20 h-20 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center">
									<HiOutlineUserGroup className="w-10 h-10 text-gray-500" />
								</div>
								<div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[#1D7A8C] flex items-center justify-center">
									<HiOutlineCheck className="w-4 h-4 text-[#1D7A8C]" />
								</div>
							</div>
						</div>
						<div className="px-6 py-8 text-center">
							<h3 className="text-lg font-semibold text-gray-900">{t("absenceSummary.summaryTitle")}</h3>
							<p className="text-sm text-[#1D7A8C] mt-2">{t("absenceSummary.overview")}</p>
						</div>
					</div>

					<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
						<div className="bg-[#f3f3f3] rounded-xl px-4 py-3 flex items-center justify-end">
							<Button
								onClick={() => setIsModalOpen(true)}
								title={t("absenceSummary.buttons.addAbsence")}
								icon={<HiOutlinePlus className="w-4 h-4" />}
								className="text-sm px-4 py-2 shadow-none"
							/>
						</div>

						<div className="mt-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{SUMMARY_CARDS.map(card => (
									<div key={card.id} className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
										<div className="bg-[#f3f3f3] py-4 text-center">
											<h3 className="text-gray-700 font-semibold text-base md:text-lg">
												{t(`absenceSummary.cards.${card.titleKey}`)}
											</h3>
										</div>
										<div className="px-6 py-6 flex items-center justify-between min-h-[120px]">
											<p className="text-sm text-gray-700">{t("absenceSummary.cards.remaining")}</p>
											<div className="text-center">
												<p className="text-4xl font-semibold text-[#1D7A8C]">{card.remaining}</p>
												{!card.isUnlimited && (
													<p className="text-sm text-gray-600 mt-2">
														{t(`absenceSummary.cards.${card.unitKey}`)}
													</p>
												)}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
					<div className="px-6 py-3 border-b border-gray-100">
						<h4 className="text-[#1D7A8C] font-semibold">{t("absenceSummary.listTitle")}</h4>
					</div>
					<Table
						columns={columns}
						data={ABSENCES}
						emptyMessage={t("absenceSummary.table.empty")}
						className="rounded-none shadow-none border-t border-gray-100"
						showDeleteButton={() => false}
						showEditButton={() => false}
						showViewButton={() => false}
					/>
					<div className="px-6 py-4">
						<Pagination
							currentPage={page}
							totalCount={ABSENCES.length}
							pageSize={5}
							onPageChange={setPage}
							onPageSizeChange={() => {}}
							hasNext={false}
							hasPrevious={false}
							showPageSizeSelector={false}
						/>
					</div>
				</div>
			</div>

			<SlideUpModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setShowConflict(false);
				}}
				title={t("absenceSummary.modal.title")}
				maxWidth="900px"
			>
				<div className="grid grid-cols-1 gap-8">
					<FloatingLabelSelect
						label={t("absenceSummary.form.type")}
						name="type"
						options={typeOptions}
						value={formData.type}
						onChange={handleInputChange}
					/>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FloatingLabelInput
							label={`${t("absenceSummary.form.startDate")} *`}
							name="startDate"
							type="date"
							value={formData.startDate}
							onChange={handleInputChange}
							error={!formData.startDate && t("absenceSummary.form.required")}
						/>
						<FloatingLabelInput
							label={`${t("absenceSummary.form.endDate")} *`}
							name="endDate"
							type="date"
							value={formData.endDate}
							onChange={handleInputChange}
							error={!formData.endDate && t("absenceSummary.form.required")}
						/>
					</div>

					{showConflict && (
						<div className="border border-orange-200 bg-orange-50 rounded-2xl p-4 space-y-4 shadow-sm">
							<div className="flex items-start justify-between gap-3">
								<div className="flex items-start gap-3">
									<div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
										<HiOutlineExclamation className="w-6 h-6" />
									</div>
									<div>
										<p className="text-base font-semibold text-orange-800">
											{t("absenceSummary.conflict.title")}
										</p>
										<p className="text-sm text-orange-700">
											{t("absenceSummary.conflict.message")}
										</p>
									</div>
								</div>
								<button
									type="button"
									className="text-gray-500 hover:text-gray-700"
									onClick={() => setShowConflict(false)}
									aria-label={t("common.close")}
								>
									A-
								</button>
							</div>

							<div className="border border-orange-200 bg-white rounded-2xl p-3">
								<div className="flex items-center gap-2 text-orange-700 text-xs font-semibold mb-1">
									<span className="w-4 h-4 rounded-sm bg-orange-200 inline-flex items-center justify-center text-[10px]">
										!
									</span>
									{t("absenceSummary.conflict.selectedDate")}
								</div>
								<div className="flex items-center flex-wrap gap-3">
									<p className="text-sm font-semibold text-gray-900">Saturday, August 10, 2025</p>
									<span className="text-xs text-gray-600">
										{t("absenceSummary.conflict.timeRangeSample")}
									</span>
								</div>
							</div>
						</div>
					)}

					<FloatingLabelTextarea
						label={t("absenceSummary.form.reason")}
						name="reason"
						value={formData.reason}
						onChange={handleInputChange}
						rows={3}
					/>
				</div>

				<div className="flex items-center justify-end gap-3 pt-6">
					<Button
						onClick={() => {
							setIsModalOpen(false);
							setShowConflict(false);
						}}
						title={t("common.cancel")}
						className="bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-none"
					/>
					<Button onClick={handleSubmit} title={t("absenceSummary.buttons.add")} />
				</div>
			</SlideUpModal>
		</div>
	);
};

export default AbsenceSummaryPage;
