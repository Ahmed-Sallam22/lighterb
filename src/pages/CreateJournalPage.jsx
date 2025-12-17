import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaTimesCircle, FaTrash } from "react-icons/fa";
import PageHeader from "../components/shared/PageHeader";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Card from "../components/shared/Card";
import { createJournal, updateJournal } from "../store/journalsSlice";
import { fetchCurrencies } from "../store/currenciesSlice";
import { fetchAccounts } from "../store/accountsSlice";
import { fetchSegmentTypes, fetchSegmentValues } from "../store/segmentsSlice";
import HeroPattern from "../ui/HeroPatterns";
import CreateJournalHeaderIcon from "../assets/icons/CreateJournalHeaderIcon";
import Button from "../components/shared/Button";

const CreateJournalPage = () => {
	const { t } = useTranslation(); // ADD THIS LINE
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const { currencies } = useSelector(state => state.currencies);
	const { accounts } = useSelector(state => state.accounts);
	const { types: segmentTypes = [], values: segmentValues = [] } = useSelector(state => state.segments);

	// Check if we're in edit mode (journal data passed via navigation state)
	const editJournal = location.state?.journal;
	const isEditMode = !!editJournal;

	// Generate currency options from Redux state
	const currencyOptions = currencies.map(currency => ({
		value: currency.id.toString(),
		label: `${currency.code} - ${currency.name}`,
	}));

	// Generate account options from Redux state
	const accountOptions = accounts.map(account => ({
		value: account.id.toString(),
		label: `${account.account_number || account.id} - ${account.account_name || account.name || "Account"}`,
	}));

	const [formData, setFormData] = useState({
		name: "",
		date: "",
		reference: "",
		description: "",
		currency: "1", // USD is currency ID 1
		status: "draft",
	});

	const [lines, setLines] = useState([]);
	const [segmentFormState, setSegmentFormState] = useState({}); // Track segment form for each line

	const [errors, setErrors] = useState({
		date: "",
		currency: "",
		description: "",
	});

	// Fetch currencies, accounts, segment types, and segment values on component mount
	useEffect(() => {
		dispatch(fetchCurrencies());
		dispatch(fetchAccounts());
		dispatch(fetchSegmentTypes());
		dispatch(fetchSegmentValues());
	}, [dispatch]);

	// Pre-fill form data when in edit mode
	useEffect(() => {
		if (editJournal) {
			setFormData({
				name: editJournal.memo || "",
				date: editJournal.date || "",
				reference: editJournal.reference || "",
				description: editJournal.memo || "",
				currency: editJournal.currency || "USD",
				status: editJournal.is_posted ? "posted" : "draft",
			});

			// If journal has lines, populate them
			if (editJournal.lines && editJournal.lines.length > 0) {
				// Map API lines to form lines structure
				const mappedLines = editJournal.lines.map((line, index) => ({
					id: index + 1,
					account: line.account || "",
					debit: line.debit || "0.00",
					credit: line.credit || "0.00",
					segments: line.segments || [],
				}));
				setLines(mappedLines);
			}
		}
	}, [editJournal]);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleAddLine = () => {
		const newLine = {
			id: Date.now(), // Use timestamp as unique ID
			account: "",
			debit: "0.00",
			credit: "0.00",
			segments: [],
		};
		setLines([...lines, newLine]);
	};

	const handleRemoveLine = lineId => {
		if (lines.length > 1) {
			setLines(lines.filter(line => line.id !== lineId));
		}
	};

	const handleLineChange = (lineId, field, value) => {
		setLines(lines.map(line => (line.id === lineId ? { ...line, [field]: value } : line)));
	};

	const handleSegmentFormChange = (lineId, field, value) => {
		const currentSegmentForm = segmentFormState[lineId] || { segment_type: "", segment: "" };

		const updatedForm = {
			...currentSegmentForm,
			[field]: value,
			// Reset segment value when segment type changes
			...(field === "segment_type" ? { segment: "" } : {}),
		};

		setSegmentFormState(prev => ({
			...prev,
			[lineId]: updatedForm,
		}));

		// Auto-add segment when both segment_type and segment are selected
		if (field === "segment" && value && updatedForm.segment_type) {
			// Both are now selected, auto-add the segment
			const segmentType = segmentTypes.find(st => st.segment_id === parseInt(updatedForm.segment_type));
			const segmentValue = segmentValues.find(sv => sv.id === parseInt(value));

			const newSegment = {
				id: Date.now(),
				segment_type: parseInt(updatedForm.segment_type),
				segment: parseInt(value),
				// Store display names for UI
				segment_type_name:
					segmentType?.segment_name || segmentType?.segment_type || `Type ${updatedForm.segment_type}`,
				segment_value_name: segmentValue?.alias || segmentValue?.name || `Value ${value}`,
			};

			setLines(
				lines.map(line => {
					if (line.id === lineId) {
						return {
							...line,
							segments: [...(line.segments || []), newSegment],
						};
					}
					return line;
				})
			);

			// Reset segment form for this line
			setSegmentFormState(prev => ({
				...prev,
				[lineId]: { segment_type: "", segment: "" },
			}));

			toast.success(t("createJournal.messages.segmentAdded"));
		}
	};

	const handleRemoveSegmentFromLine = (lineId, segmentId) => {
		setLines(
			lines.map(line => {
				if (line.id === lineId) {
					return {
						...line,
						segments: line.segments.filter(seg => seg.id !== segmentId),
					};
				}
				return line;
			})
		);
		toast.success(t("createJournal.messages.segmentRemoved"));
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.date) {
			newErrors.date = t("createJournal.validation.dateRequired");
		}

		if (!formData.currency) {
			newErrors.currency = t("createJournal.validation.currencyRequired");
		}

		if (!formData.description || formData.description.trim() === "") {
			newErrors.description = t("createJournal.validation.descriptionRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const calculateTotals = () => {
		const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
		const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
		return { totalDebit, totalCredit };
	};

	const handleSubmit = async e => {
		e.preventDefault();

		// Validate form first
		if (!validateForm()) {
			return;
		}

		const { totalDebit, totalCredit } = calculateTotals();

		if (totalDebit !== totalCredit) {
			toast.error(t("createJournal.validation.debitCreditMustMatch"));
			return;
		}

		// Prepare journal data for API
		const journalData = {
			date: formData.date,
			currency: parseInt(formData.currency) || 1, // Convert currency to integer ID
			memo: formData.description,
			lines: lines.map(line => ({
				account: parseInt(line.account),
				debit: parseFloat(line.debit),
				credit: parseFloat(line.credit),
				segments: (line.segments || []).map(seg => ({
					segment_type: seg.segment_type || seg.id, // segment_type ID
					segment: seg.segment || seg.id, // segment ID
				})),
			})),
		};

		try {
			if (isEditMode) {
				// Update existing journal
				await dispatch(
					updateJournal({
						id: editJournal.id,
						data: journalData,
					})
				).unwrap();
				toast.success(t("createJournal.messages.updateSuccess"));
			} else {
				// Create new journal
				await dispatch(createJournal(journalData)).unwrap();
				toast.success(t("createJournal.messages.createSuccess"));
			}

			// Navigate back to journal entries page
			navigate("/journal/entries");
		} catch (err) {
			// Display detailed error message from API response
			const errorMessage = err?.message || err?.error || err?.detail || t("createJournal.messages.createError");

			// If there are field-specific errors, display them
			if (err && typeof err === "object" && !err.message && !err.error && !err.detail) {
				const errorMessages = [];
				Object.keys(err).forEach(key => {
					if (Array.isArray(err[key])) {
						errorMessages.push(`${key}: ${err[key].join(", ")}`);
					} else if (typeof err[key] === "string") {
						errorMessages.push(`${key}: ${err[key]}`);
					} else if (typeof err[key] === "object") {
						// Handle nested errors (e.g., lines[0].account: ["error"])
						errorMessages.push(`${key}: ${JSON.stringify(err[key])}`);
					}
				});

				if (errorMessages.length > 0) {
					toast.error(errorMessages.join(" | "), { autoClose: 5000 });
					return;
				}
			}

			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		navigate("/journal/entries");
	};

	const { totalDebit, totalCredit } = calculateTotals();
	const isBalanced = totalDebit === totalCredit && totalDebit > 0;

	return (
		<div className="min-h-screen bg-gray-50">
			<ToastContainer
				position="top-right"
				autoClose={3000}
				hideProgressBar={false}
				newestOnTop
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
			/>

			<PageHeader
				title={isEditMode ? t("createJournal.title.edit") : t("createJournal.title.new")}
				subtitle={isEditMode ? t("createJournal.subtitle.edit") : t("createJournal.subtitle.new")}
				icon={<CreateJournalHeaderIcon />}
			/>

			<div className=" mx-auto py-6">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Hero Card */}
					<div className="relative  rounded-[36px] border border-[#D7E8EF] bg-linear-to-br from-[#F4FBFE] via-white to-[#EAF5FB] p-8 shadow-xl">
						<HeroPattern />
						<div className="relative space-y-6 ">
							<div>
								<h2 className="text-3xl font-bold text-[#1F6F8B]">
									{isEditMode
										? t("createJournal.hero.title.edit")
										: t("createJournal.hero.title.new")}
								</h2>
								<p className="mt-3 text-base text-[#2F6E8A]">
									{isEditMode
										? t("createJournal.hero.description.edit")
										: t("createJournal.hero.description.new")}
								</p>
							</div>

							<div className="grid gap-4 md:grid-cols-[1fr_1fr_1.2fr]">
								<div className="text-left">
									<FloatingLabelInput
										label={t("createJournal.form.date")}
										type="date"
										value={formData.date}
										onChange={e => handleInputChange("date", e.target.value)}
										required
										error={errors.date}
									/>
								</div>

								<div className="text-left">
									<FloatingLabelSelect
										label={t("createJournal.form.currency")}
										value={formData.currency}
										onChange={e => handleInputChange("currency", e.target.value)}
										options={currencyOptions}
										required
										error={errors.currency}
									/>
								</div>

								<div className="text-left">
									<FloatingLabelInput
										label={t("createJournal.form.description")}
										type="text"
										value={formData.description}
										onChange={e => handleInputChange("description", e.target.value)}
										placeholder={t("createJournal.form.descriptionPlaceholder")}
										required
										error={errors.description}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* GL Distribution Lines */}
					<Card
						title={t("createJournal.glLines.title")}
						subtitle={t("createJournal.glLines.subtitle")}
						actionSlot={
							<Button
								onClick={handleAddLine}
								title={t("createJournal.glLines.newLine")}
								className="bg-transparent shadow-none hover:shadow-none inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#48C1F0] text-[#48C1F0] text-sm font-semibold hover:bg-[#48C1F0]/10 transition-colors"
							/>
						}
					>
						{lines.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
								<p className="text-lg font-semibold mb-2">{t("createJournal.glLines.emptyTitle")}</p>
								<p className="text-sm mb-6">{t("createJournal.glLines.emptyDescription")}</p>
								<Button
									onClick={handleAddLine}
									title={t("createJournal.glLines.newFirstLine")}
									className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
								/>
							</div>
						) : (
							<div className="">
								<table className="w-full border-collapse">
									<thead>
										<tr className="border-b border-gray-200 bg-gray-50">
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												{t("createJournal.glLines.table.account")}
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
												{t("createJournal.glLines.table.debit")}
											</th>
											<th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
												{t("createJournal.glLines.table.credit")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												{t("createJournal.glLines.table.segmentsType")}
											</th>
											<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
												{t("createJournal.glLines.table.segmentsValue")}
											</th>
											<th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
												{t("createJournal.glLines.table.actions")}
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{lines.map(line => (
											<tr key={line.id} className="hover:bg-gray-50 transition-colors">
												<td className="px-4 py-3">
													<FloatingLabelSelect
														label={t("createJournal.glLines.table.account")}
														value={line.account}
														onChange={e =>
															handleLineChange(line.id, "account", e.target.value)
														}
														options={[
															{
																value: "",
																label: t(
																	"createJournal.glLines.placeholders.selectAccount"
																),
															},
															...accountOptions,
														]}
													/>
												</td>
												<td className="px-4 py-3">
													<FloatingLabelInput
														label={t("createJournal.glLines.table.debit")}
														type="number"
														step="0.01"
														value={line.debit}
														onChange={e =>
															handleLineChange(line.id, "debit", e.target.value)
														}
														placeholder={t("createJournal.glLines.placeholders.debit")}
													/>
												</td>
												<td className="px-4 py-3">
													<FloatingLabelInput
														label={t("createJournal.glLines.table.credit")}
														type="number"
														step="0.01"
														value={line.credit}
														onChange={e =>
															handleLineChange(line.id, "credit", e.target.value)
														}
														placeholder={t("createJournal.glLines.placeholders.credit")}
													/>
												</td>
												<td className="px-4 py-3">
													<div className="flex flex-col gap-2">
														{/* Display existing segments */}
														{line.segments && line.segments.length > 0 && (
															<div className="flex flex-wrap gap-1 mb-2">
																{line.segments.map(segment => (
																	<span
																		key={segment.id}
																		className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group relative"
																	>
																		{segment.segment_type_name ||
																			segment.segment_type}
																		<Button
																			onClick={() =>
																				handleRemoveSegmentFromLine(
																					line.id,
																					segment.id
																				)
																			}
																			className="bg-transparent shadow-none hover:shadow-none p-0 ml-1 text-blue-600 hover:text-red-600"
																			title={t(
																				"createJournal.glLines.segments.removeSegment"
																			)}
																		>
																			×
																		</Button>
																	</span>
																))}
															</div>
														)}

														<FloatingLabelSelect
															label={t("createJournal.glLines.table.segmentsType")}
															value={segmentFormState[line.id]?.segment_type || ""}
															onChange={e =>
																handleSegmentFormChange(
																	line.id,
																	"segment_type",
																	e.target.value
																)
															}
															options={[
																{
																	value: "",
																	label: t(
																		"createJournal.glLines.placeholders.selectSegmentType"
																	),
																},
																...(segmentTypes?.map(type => ({
																	value: type.segment_id.toString(),
																	label: `${type.segment_name} (${type.segment_type})`,
																})) || []),
															]}
														/>

														{/* Optional manual add button (segments auto-add when both dropdowns are selected) */}
														<div className="text-xs text-gray-500 italic mt-1">
															{t("createJournal.glLines.segments.autoAddNote")}
														</div>
													</div>
												</td>
												<td className="px-4 py-3">
													<div className="flex flex-col gap-2">
														{/* Display existing segment values */}
														{line.segments && line.segments.length > 0 && (
															<div className="flex flex-wrap gap-1 mb-2">
																{line.segments.map(segment => (
																	<span
																		key={segment.id}
																		className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 group relative"
																	>
																		{segment.segment_value_name ||
																			segment.alias ||
																			segment.name}
																		<Button
																			onClick={() =>
																				handleRemoveSegmentFromLine(
																					line.id,
																					segment.id
																				)
																			}
																			className="bg-transparent shadow-none hover:shadow-none p-0 ml-1 text-green-600 hover:text-red-600"
																			title={t(
																				"createJournal.glLines.segments.removeSegment"
																			)}
																		>
																			×
																		</Button>
																	</span>
																))}
															</div>
														)}

														<FloatingLabelSelect
															label={t("createJournal.glLines.table.segmentsValue")}
															value={segmentFormState[line.id]?.segment || ""}
															onChange={e =>
																handleSegmentFormChange(
																	line.id,
																	"segment",
																	e.target.value
																)
															}
															disabled={!segmentFormState[line.id]?.segment_type}
															options={[
																{
																	value: "",
																	label: t(
																		"createJournal.glLines.placeholders.selectSegmentValue"
																	),
																},
																...(segmentValues
																	?.filter(value => {
																		const selectedTypeId =
																			segmentFormState[line.id]?.segment_type;
																		if (!selectedTypeId) return false;
																		return (
																			value.segment_type ===
																			parseInt(selectedTypeId)
																		);
																	})
																	.map(value => ({
																		value: value.id.toString(),
																		label: `${value.alias} (${value.code})`,
																	})) || []),
															]}
														/>
													</div>
												</td>
												<td className="px-4 py-3 text-center">
													<Button
														onClick={() => handleRemoveLine(line.id)}
														disabled={lines.length === 1}
														icon={<FaTrash className="w-5 h-5" />}
														className={`bg-transparent shadow-none hover:shadow-none p-2 rounded-lg transition-colors ${
															lines.length === 1
																? "text-gray-300 cursor-not-allowed"
																: "text-red-600 hover:bg-red-50"
														}`}
														title={t("createJournal.glLines.deleteLine")}
													/>
												</td>
											</tr>
										))}
									</tbody>
									<tfoot className="border-t-2 border-gray-300 bg-gray-50">
										<tr className="font-semibold">
											<td className="px-4 py-3 text-right text-gray-700">
												{t("createJournal.glLines.totals")}
											</td>
											<td className="px-4 py-3 text-right text-lg text-[#28819C]">
												{totalDebit.toFixed(2)}
											</td>
											<td className="px-4 py-3 text-right text-lg text-[#28819C]">
												{totalCredit.toFixed(2)}
											</td>
											<td colSpan="2" className="px-4 py-3">
												{isBalanced ? (
													<span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
														<FaCheckCircle className="w-5 h-5" />
														{t("createJournal.glLines.balanced")}
													</span>
												) : (
													<span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
														<FaTimesCircle className="w-5 h-5" />
														{t("createJournal.glLines.notBalanced")}
														{Math.abs(totalDebit - totalCredit).toFixed(2)}
														{t("createJournal.glLines.difference")}
													</span>
												)}
											</td>
										</tr>
									</tfoot>
								</table>
							</div>
						)}
					</Card>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-4">
						<Button
							onClick={handleCancel}
							title={t("createJournal.actions.cancel")}
							className="bg-transparent shadow-none hover:shadow-none px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
						/>
						<Button
							type="submit"
							disabled={!isBalanced}
							title={isEditMode ? t("createJournal.actions.update") : t("createJournal.actions.create")}
							className={`px-6 py-2 rounded-lg font-medium transition-colors ${
								isBalanced
									? "bg-[#28819C] text-white hover:bg-[#206a82]"
									: "bg-gray-300 text-gray-500 cursor-not-allowed"
							}`}
						/>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CreateJournalPage;
