import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import SlideUpModal from "./shared/SlideUpModal";
import { fetchJournalById, clearSelectedJournal } from "../store/journalsSlice";
import TrendUpIcon from "../assets/icons/TrendUpIcon";
import TrendDownIcon from "../assets/icons/TrendDownIcon";

const InfoRow = ({ label, value, className = "" }) => (
	<div className={`flex justify-between text-sm text-gray-700 py-1 ${className}`}>
		<span className="font-medium text-gray-600">{label}</span>
		<span>{value ?? "-"}</span>
	</div>
);

const StatusBadge = ({ posted, t }) => {
	const statusKey = posted ? "posted" : "draft";
	const colors = posted
		? "bg-green-100 text-green-800 border-green-200"
		: "bg-gray-100 text-gray-800 border-gray-200";

	return (
		<span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${colors}`}>
			{t(`journals.status.${statusKey}`)}
		</span>
	);
};

const JournalEntryDetailModal = ({ isOpen, journalId, onClose }) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { selectedJournal, loading } = useSelector(state => state.journals);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!isOpen || !journalId) return;

		const fetchData = async () => {
			setError(null);
			try {
				await dispatch(fetchJournalById(journalId)).unwrap();
			} catch (err) {
				const message = err?.message || err?.error || err?.detail || t("journalDetail.errors.loadFailed");
				setError(message);
			}
		};

		fetchData();
	}, [journalId, isOpen, dispatch, t]);

	// Reset state when modal closes
	useEffect(() => {
		if (!isOpen) {
			dispatch(clearSelectedJournal());
			setError(null);
		}
	}, [isOpen, dispatch]);

	const formatCurrency = (value, currencyCode = "") => {
		if (value === null || value === undefined) return "-";
		return `${currencyCode} ${parseFloat(value).toLocaleString()}`;
	};

	const journal = selectedJournal;

	return (
		<SlideUpModal
			isOpen={isOpen}
			onClose={onClose}
			title={`${t("journalDetail.title")} #${journalId || ""}`}
			maxWidth="1100px"
		>
			<div className="space-y-6 pb-6">
				{loading && (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0d5f7a]"></div>
						<span className="ml-3 text-gray-500">{t("journalDetail.loading")}</span>
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
						<p className="text-red-600 text-sm">{error}</p>
					</div>
				)}

				{!loading && !error && journal && (
					<>
						{/* Header Card */}
						<div className="relative overflow-hidden rounded-3xl border border-[#D7EEF6] bg-linear-to-br from-white via-white to-[#F3FBFE] p-5">
							<div className="flex flex-wrap items-start justify-between gap-4">
								<div>
									<p className="text-2xl font-bold text-[#147A9C]">
										{journal.memo || t("journalDetail.untitledEntry")}
									</p>
									<p className="mt-1 text-sm text-[#5E7F8C]">
										{t("journalDetail.entryId")}: {journal.id}
									</p>
								</div>
								<StatusBadge posted={journal.posted} t={t} />
							</div>
						</div>

						{/* Summary Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{/* Entry Info Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-[#0d5f7a] mb-3 flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									{t("journalDetail.sections.entryInfo")}
								</h3>
								<InfoRow label={t("journalDetail.fields.date")} value={journal.date} />
								<InfoRow
									label={t("journalDetail.fields.currency")}
									value={`${journal.currency_code} - ${journal.currency_name}`}
								/>
								<InfoRow
									label={t("journalDetail.fields.balanced")}
									value={journal.is_balanced ? t("common.yes") : t("common.no")}
								/>
							</div>

							{/* Debit Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
									<TrendUpIcon className="w-4 h-4" />
									{t("journalDetail.sections.totalDebit")}
								</h3>
								<p className="text-3xl font-bold text-gray-900">
									{formatCurrency(journal.total_debit, journal.currency_code)}
								</p>
							</div>

							{/* Credit Card */}
							<div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
								<h3 className="text-sm font-semibold text-green-600 mb-3 flex items-center gap-2">
									<TrendDownIcon className="w-4 h-4" />
									{t("journalDetail.sections.totalCredit")}
								</h3>
								<p className="text-3xl font-bold text-gray-900">
									{formatCurrency(journal.total_credit, journal.currency_code)}
								</p>
							</div>
						</div>

						{/* Balance Difference */}
						{journal.balance_difference && parseFloat(journal.balance_difference) !== 0 && (
							<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
								<p className="text-yellow-800 text-sm font-medium">
									{t("journalDetail.balanceDifference")}:{" "}
									{formatCurrency(journal.balance_difference, journal.currency_code)}
								</p>
							</div>
						)}

						{/* Journal Lines */}
						<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
							<div className="px-5 py-4 border-b border-gray-200">
								<h3 className="text-lg font-semibold text-[#0d5f7a] flex items-center gap-2">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 10h16M4 14h16M4 18h16"
										/>
									</svg>
									{t("journalDetail.sections.lines")} ({journal.lines?.length || 0})
								</h3>
							</div>

							{journal.lines && journal.lines.length > 0 ? (
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("journalDetail.lineTable.id")}
												</th>
												<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("journalDetail.lineTable.type")}
												</th>
												<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("journalDetail.lineTable.segments")}
												</th>
												<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
													{t("journalDetail.lineTable.amount")}
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											{journal.lines.map(line => (
												<tr key={line.id} className="hover:bg-gray-50 transition-colors">
													<td className="px-4 py-3 text-gray-900 font-medium">{line.id}</td>
													<td className="px-4 py-3">
														<span
															className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
																line.type === "DEBIT"
																	? "bg-red-100 text-red-800"
																	: "bg-green-100 text-green-800"
															}`}
														>
															{line.type}
														</span>
													</td>
													<td className="px-4 py-3">
														{line.segment_details && line.segment_details.length > 0 ? (
															<div className="space-y-1">
																{line.segment_details.map((segment, idx) => (
																	<div key={idx} className="text-xs">
																		<span className="font-medium text-gray-700">
																			{segment.segment_type_name}:
																		</span>{" "}
																		<span className="text-gray-600">
																			{segment.segment_code} -{" "}
																			{segment.segment_alias}
																		</span>
																	</div>
																))}
															</div>
														) : (
															<span className="text-gray-400">-</span>
														)}
													</td>
													<td className="px-4 py-3 text-right font-semibold">
														<span
															className={
																line.type === "DEBIT"
																	? "text-red-600"
																	: "text-green-600"
															}
														>
															{formatCurrency(line.amount, journal.currency_code)}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<div className="px-5 py-8 text-center text-gray-500">{t("journalDetail.noLines")}</div>
							)}
						</div>
					</>
				)}
			</div>
		</SlideUpModal>
	);
};

export default JournalEntryDetailModal;
