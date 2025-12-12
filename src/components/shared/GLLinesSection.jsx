import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { fetchSegmentTypes, fetchSegmentValues } from "../../store/segmentsSlice";
import { fetchCurrencies } from "../../store/currenciesSlice";
import { FaTrash, FaPlus, FaChevronDown } from "react-icons/fa";
import Button from "./Button";

/**
 * GLLinesSection - A reusable component for GL Entry with Lines and Allocations
 *
 * Produces data structure:
 * {
 *   glEntry: {
 *     date: "2025-12-10",
 *     currency_id: 1,
 *     memo: "Payment memo"
 *   },
 *   lines: [
 *     {
 *       amount: "1500.00",
 *       type: "DEBIT" | "CREDIT",
 *       segments: [
 *         { segment_type_id: 1, segment_code: "2110" },
 *         { segment_type_id: 2, segment_code: "MKT-BD" }
 *       ]
 *     }
 *   ],
 *   allocations: [
 *     { invoice_id: 1, amount_allocated: "1000.00" }
 *   ]
 * }
 */
const GLLinesSection = ({
	lines,
	onChange,
	glEntry = {},
	onGlEntryChange,
	showGlEntryHeader = true,
	title = "GL Lines",
	className = "",
}) => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const dispatch = useDispatch();

	// Get segment types and values from Redux store
	const { types: segmentTypes = [], values: segmentValues = [] } = useSelector(state => state.segments);
	const { currencies = [] } = useSelector(state => state.currencies);

	// Fetch segment types, segment values, and currencies on mount
	useEffect(() => {
		dispatch(fetchSegmentTypes());
		dispatch(fetchSegmentValues({ node_type: "child", page_size: 1000 }));
		dispatch(fetchCurrencies({ page_size: 100 }));
	}, [dispatch]);

	console.log(currencies);
	// Type options for DEBIT/CREDIT
	const typeOptions = useMemo(
		() => [
			{ value: "", label: t("glLines.selectType") },
			{ value: "DEBIT", label: t("glLines.debit") },
			{ value: "CREDIT", label: t("glLines.credit") },
		],
		[t]
	);

	// Get segment options filtered by segment type and node_type="child"
	const getSegmentOptions = segmentTypeId => {
		if (!segmentTypeId) return [{ value: "", label: t("glLines.selectFirst") }];

		const filteredSegments = segmentValues.filter(
			segment => segment.segment_type === segmentTypeId && segment.node_type === "child"
		);

		return [
			{ value: "", label: t("glLines.selectSegment") },
			...filteredSegments.map(segment => ({
				value: segment.code,
				label: `${segment.code} - ${segment.name || segment.alias || ""}`,
			})),
		];
	};

	// Add a new line
	const handleAddLine = () => {
		const newLine = {
			id: Date.now(),
			type: "",
			amount: "",
			segments: segmentTypes.map(st => ({
				segment_type_id: st.id,
				segment_code: "",
			})),
		};
		onChange([...lines, newLine]);
	};

	// Remove a line
	const handleRemoveLine = lineId => {
		if (lines.length > 1) {
			onChange(lines.filter(line => line.id !== lineId));
		}
	};

	// Update line field
	const handleLineChange = (lineId, field, value) => {
		onChange(lines.map(line => (line.id === lineId ? { ...line, [field]: value } : line)));
	};

	// Update segment code for a specific segment type
	const handleSegmentChange = (lineId, segmentTypeId, segmentCode) => {
		onChange(
			lines.map(line => {
				if (line.id === lineId) {
					// Check if segment exists
					const existingSegmentIndex = (line.segments || []).findIndex(
						seg => seg.segment_type_id === segmentTypeId
					);
					
					let updatedSegments;
					if (existingSegmentIndex !== -1) {
						// Update existing segment
						updatedSegments = line.segments.map(seg =>
							seg.segment_type_id === segmentTypeId ? { ...seg, segment_code: segmentCode } : seg
						);
					} else {
						// Add new segment (for lines with empty segments array)
						updatedSegments = [
							...(line.segments || []),
							{ segment_type_id: segmentTypeId, segment_code: segmentCode }
						];
					}
					return { ...line, segments: updatedSegments };
				}
				return line;
			})
		);
	};

	// Get segment code value for a specific line and segment type
	const getSegmentValue = (line, segmentTypeId) => {
		const segment = line.segments?.find(seg => seg.segment_type_id === segmentTypeId);
		return segment?.segment_code || "";
	};

	// Handle GL Entry field change
	const handleGlEntryFieldChange = (field, value) => {
		if (onGlEntryChange) {
			onGlEntryChange({ ...glEntry, [field]: value });
		}
	};

	return (
		<div className={`bg-gray-100 rounded-xl p-4 ${className}`} dir={isRtl ? "rtl" : "ltr"}>
			{/* Title */}
			{title && <h3 className="text-base font-semibold text-gray-800 mb-4">{title}</h3>}

			{/* GL Entry Header Fields */}
			{showGlEntryHeader && (
				<div className="bg-white rounded-lg p-4 mb-4">
					<h4 className="text-sm font-medium text-gray-700 mb-3">{t("glLines.glEntryDetails")}</h4>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Date */}
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">{t("glLines.date")}</label>
							<input
								type="date"
								value={glEntry.date || ""}
								onChange={e => handleGlEntryFieldChange("date", e.target.value)}
								className="w-full h-11 px-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0]"
							/>
						</div>

						{/* Currency */}
						<div className="relative">
							<label className="block text-sm font-medium text-gray-600 mb-1">
								{t("glLines.currency")}
							</label>
							<select
								value={glEntry.currency_id || ""}
								onChange={e => handleGlEntryFieldChange("currency_id", e.target.value)}
								className="w-full h-11 px-3 pe-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
							>
								<option value="">{t("glLines.selectCurrency")}</option>
								{currencies.map(currency => (
									<option key={currency.id} value={currency.id}>
										{currency.code} - {currency.name}
									</option>
								))}
							</select>
							<FaChevronDown className="absolute top-[38px] end-3 w-3 h-3 text-gray-400 pointer-events-none" />
						</div>

						{/* Memo */}
						<div>
							<label className="block text-sm font-medium text-gray-600 mb-1">{t("glLines.memo")}</label>
							<input
								type="text"
								value={glEntry.memo || ""}
								onChange={e => handleGlEntryFieldChange("memo", e.target.value)}
								placeholder={t("glLines.memoPlaceholder")}
								className="w-full h-11 px-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0]"
							/>
						</div>
					</div>
				</div>
			)}

			{/* GL Lines Section */}
			<div className="bg-white rounded-lg p-4">
				<h4 className="text-sm font-medium text-gray-700 mb-3">{t("glLines.lines")}</h4>

				{/* Scrollable Table Container */}
				<div className="overflow-x-auto">
					<div className="min-w-[800px]">
						{/* Table Header */}
						<div className="rounded-t-lg">
							<div
								className="grid gap-3 p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg"
								style={{
									gridTemplateColumns: `150px 150px ${segmentTypes
										.map(() => "minmax(180px, 1fr)")
										.join(" ")} 60px`,
								}}
							>
								<div
									className={`text-sm font-medium text-gray-600 ${
										isRtl ? "text-right" : "text-left"
									}`}
								>
									{t("glLines.type")}
								</div>
								<div
									className={`text-sm font-medium text-gray-600 ${
										isRtl ? "text-right" : "text-left"
									}`}
								>
									{t("glLines.amount")}
								</div>
								{segmentTypes.map(st => (
									<div
										key={st.id}
										className={`text-sm font-medium text-gray-600 ${
											isRtl ? "text-right" : "text-left"
										}`}
									>
										{st.name || st.segment_name || `Segment ${st.id}`}
									</div>
								))}
								<div className="text-sm font-medium text-gray-600 text-center">
									{t("glLines.actions")}
								</div>
							</div>
						</div>

						{/* Table Body */}
						<div className="rounded-b-lg">
							{lines.map((line, index) => (
								<div
									key={line.id}
									className={`grid gap-3 p-3 items-start hover:bg-gray-50 transition-colors ${
										index !== lines.length - 1 ? "border-b border-gray-100" : ""
									}`}
									style={{
										gridTemplateColumns: `150px 150px ${segmentTypes
											.map(() => "minmax(180px, 1fr)")
											.join(" ")} 60px`,
										minHeight: "70px",
									}}
								>
									{/* Type Select */}
									<div className="relative">
										<select
											name={`type-${line.id}`}
											value={line.type}
											onChange={e => handleLineChange(line.id, "type", e.target.value)}
											className="w-full h-11 px-3 pe-8 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0] cursor-pointer"
										>
											{typeOptions.map(opt => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
										<FaChevronDown className="absolute top-1/2 end-3 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
									</div>

									{/* Amount Input */}
									<div>
										<input
											type="number"
											name={`amount-${line.id}`}
											value={line.amount}
											onChange={e => handleLineChange(line.id, "amount", e.target.value)}
											placeholder={t("glLines.amount")}
											className="w-full h-11 px-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#48C1F0] focus:border-[#48C1F0]"
										/>
									</div>

									{/* Segment Type Columns */}
									{segmentTypes.map(st => {
										const options = getSegmentOptions(st.id);
										return (
											<div key={`${line.id}-${st.id}`} className="relative">
												<select
													name={`segment-${line.id}-${st.id}`}
													value={getSegmentValue(line, st.id)}
													onChange={e => handleSegmentChange(line.id, st.id, e.target.value)}
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
										);
									})}

									{/* Delete Action */}
									<div className="flex justify-center pt-2">
										<Button
											onClick={() => handleRemoveLine(line.id)}
											disabled={lines.length <= 1}
											icon={<FaTrash className="w-4 h-4" />}
											className={`bg-transparent shadow-none hover:shadow-none p-2 rounded-lg transition-colors ${
												lines.length <= 1
													? "text-gray-300 cursor-not-allowed"
													: "text-red-500 hover:bg-red-50 hover:text-red-600"
											}`}
											title={t("glLines.deleteLine")}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Add Line Button */}
				<Button
					onClick={handleAddLine}
					title={t("glLines.addLine")}
					icon={<FaPlus className="w-3 h-3" />}
					className={`shadow-none hover:shadow-none mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors ${
						isRtl ? "flex-row-reverse" : ""
					}`}
				/>
			</div>
		</div>
	);
};

GLLinesSection.propTypes = {
	lines: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
			type: PropTypes.string,
			amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			segments: PropTypes.arrayOf(
				PropTypes.shape({
					segment_type_id: PropTypes.number.isRequired,
					segment_code: PropTypes.string,
				})
			),
		})
	).isRequired,
	onChange: PropTypes.func.isRequired,
	glEntry: PropTypes.shape({
		date: PropTypes.string,
		currency_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		memo: PropTypes.string,
	}),
	onGlEntryChange: PropTypes.func,
	showGlEntryHeader: PropTypes.bool,
	title: PropTypes.string,
	className: PropTypes.string,
};

export default GLLinesSection;
