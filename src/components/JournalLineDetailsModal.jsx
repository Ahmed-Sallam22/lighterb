import React from "react";
import SlideUpModal from "../components/shared/SlideUpModal";
import TrendUpIcon from "../assets/icons/TrendUpIcon";
import TrendDownIcon from "../assets/icons/TrendDownIcon";

const JournalLineDetailsModal = ({ isOpen, onClose, selectedLine, t, formatDisplayDate, normalizedAmount }) => {
	if (!selectedLine) return null;

	return (
		<SlideUpModal isOpen={isOpen} onClose={onClose} title={t("journalLines.modal.title")}>
			<div className="space-y-2 text-gray-900">
				<div className="relative overflow-hidden rounded-3xl border border-[#D7EEF6] bg-linear-to-br from-white via-white to-[#F3FBFE] p-4">
					<p className="text-2xl font-bold text-[#147A9C]">
						{t("journalLines.modal.lineTitle")} {selectedLine.id}
					</p>
					<p className="mt-1 text-sm text-[#5E7F8C]">
						{t("journalLines.modal.partOf")} {selectedLine.entry}
					</p>
				</div>

				<div className="space-y-2">
					{/* Entry Details */}
					<section className="rounded-2xl border border-[#DCE8EE] bg-white p-5 shadow-sm">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div>
								<p className="text-lg font-semibold text-gray-900">
									{t("journalLines.modal.entryDetails")}
								</p>
								<p className="text-sm text-gray-500">
									{t("journalLines.modal.entryId")} : {selectedLine.entry}
								</p>
							</div>
							<p className="text-sm font-semibold text-gray-800">
								{t("journalLines.table.date")} : {formatDisplayDate(selectedLine.date)}
							</p>
						</div>

						<div className="mt-5 space-y-3 text-sm text-[#526875]">
							<div>
								<p className="font-semibold text-gray-600">{t("journalLines.modal.memo")}</p>
								<p>{selectedLine.memo || t("journalLines.modal.na")}</p>
							</div>

							<div className="flex flex-wrap items-center gap-2 text-sm">
								<span className="font-semibold text-gray-600">{t("journalLines.table.status")} :</span>
								<span
									className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
										selectedLine.rawStatus === "posted"
											? "bg-green-50 text-green-700 border border-green-200"
											: "bg-gray-50 text-gray-700 border border-gray-200"
									}`}
								>
									{selectedLine.status}
								</span>
							</div>
						</div>
					</section>

					{/* Account Details */}
					<section className="rounded-2xl border border-[#DCE8EE] bg-white p-5 shadow-sm">
						<p className="text-lg font-semibold text-gray-900 mb-4">
							{t("journalLines.modal.accountDetails")}
						</p>

						<div className="grid gap-3 text-sm text-[#526875] sm:grid-cols-2">
							<div>
								<p className="font-semibold text-gray-600">{t("journalLines.modal.code")}</p>
								<p>{selectedLine.code || t("journalLines.modal.na")}</p>
							</div>
							<div>
								<p className="font-semibold text-gray-600">{t("journalLines.modal.name")}</p>
								<p>{selectedLine.account}</p>
							</div>
							<div>
								<p className="font-semibold text-gray-600">{t("journalLines.modal.type")}</p>
								<p className="capitalize">{selectedLine.type}</p>
							</div>
						</div>
					</section>
				</div>

				{/* Totals */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="rounded-2xl border border-[#CDE5EE] bg-white p-5 text-center shadow-sm">
						<div className="flex items-center justify-center gap-2 text-[#1A8CB3] text-lg font-semibold">
							<TrendUpIcon />
							{t("journalLines.modal.totalDebits")}
						</div>
						<p className="mt-3 text-3xl font-bold text-gray-900">{normalizedAmount(selectedLine.debit)}</p>
					</div>

					<div className="rounded-2xl border border-[#CDE5EE] bg-white p-5 text-center shadow-sm">
						<div className="flex items-center justify-center gap-2 text-[#1A8CB3] text-lg font-semibold">
							<TrendDownIcon />
							{t("journalLines.modal.totalCredits")}
						</div>
						<p className="mt-3 text-3xl font-bold text-gray-900">{normalizedAmount(selectedLine.credit)}</p>
					</div>
				</div>
			</div>
		</SlideUpModal>
	);
};

export default JournalLineDetailsModal;
