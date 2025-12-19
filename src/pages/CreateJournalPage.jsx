import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import PageHeader from "../components/shared/PageHeader";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Card from "../components/shared/Card";
import GLLinesSection from "../components/shared/GLLinesSection";
import { createJournal, updateJournal } from "../store/journalsSlice";
import { fetchCurrencies } from "../store/currenciesSlice";
import HeroPattern from "../ui/HeroPatterns";
import CreateJournalHeaderIcon from "../assets/icons/CreateJournalHeaderIcon";
import Button from "../components/shared/Button";

const CreateJournalPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const { currencies } = useSelector(state => state.currencies);

	// Check if we're in edit mode (journal data passed via navigation state)
	const editJournal = location.state?.journal;
	const isEditMode = !!editJournal;

	// Generate currency options from Redux state
	const currencyOptions = currencies.map(currency => ({
		value: currency.id.toString(),
		label: `${currency.code} - ${currency.name}`,
	}));

	const [formData, setFormData] = useState({
		name: "",
		date: "",
		reference: "",
		description: "",
		currency: "1",
		status: "draft",
	});

	// Lines format for GLLinesSection: { id, type: "DEBIT"|"CREDIT", amount, segments: [{ segment_type_id, segment_code }] }
	const [lines, setLines] = useState([
		{
			id: Date.now(),
			type: "",
			amount: "",
			segments: [],
		},
	]);

	const [errors, setErrors] = useState({
		date: "",
		currency: "",
		description: "",
	});

	// Fetch currencies on component mount
	useEffect(() => {
		dispatch(fetchCurrencies());
	}, [dispatch]);

	// Pre-fill form data when in edit mode
	useEffect(() => {
		if (editJournal) {
			setFormData({
				name: editJournal.memo || "",
				date: editJournal.date || "",
				reference: editJournal.reference || "",
				description: editJournal.memo || "",
				currency: editJournal.currency_id?.toString() || editJournal.currency?.toString() || "1",
				status: editJournal.is_posted ? "posted" : "draft",
			});

			// If journal has lines, populate them in GLLinesSection format
			if (editJournal.lines && editJournal.lines.length > 0) {
				const mappedLines = editJournal.lines.map((line, index) => ({
					id: index + 1,
					type: line.type || (parseFloat(line.debit) > 0 ? "DEBIT" : "CREDIT"),
					amount: line.amount || (parseFloat(line.debit) > 0 ? line.debit : line.credit) || "",
					segments: (line.segments || []).map(seg => ({
						segment_type_id: seg.segment_type_id || seg.segment_type,
						segment_code: seg.segment_code || "",
					})),
				}));
				setLines(mappedLines);
			}
		}
	}, [editJournal]);

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: "" }));
		}
	};

	const handleLinesChange = newLines => {
		setLines(newLines);
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

	// Calculate totals from lines with type and amount
	const calculateTotals = () => {
		const totalDebit = lines
			.filter(line => line.type === "DEBIT")
			.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
		const totalCredit = lines
			.filter(line => line.type === "CREDIT")
			.reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
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

		if (totalDebit === 0) {
			toast.error(t("createJournal.validation.noLines"));
			return;
		}

		// Prepare journal data for API - lines are already in correct format from GLLinesSection
		const journalLines = lines
			.filter(line => line.type && parseFloat(line.amount) > 0)
			.map(line => ({
				amount: parseFloat(line.amount).toFixed(2),
				type: line.type,
				segments: (line.segments || [])
					.filter(seg => seg.segment_code)
					.map(seg => ({
						segment_type_id: seg.segment_type_id,
						segment_code: seg.segment_code,
					})),
			}));

		const journalData = {
			date: formData.date,
			currency_id: parseInt(formData.currency) || 1,
			memo: formData.description,
			status: formData.status || "draft",
			lines: journalLines,
		};

		try {
			if (isEditMode) {
				await dispatch(
					updateJournal({
						id: editJournal.id,
						data: journalData,
					})
				).unwrap();
				toast.success(t("createJournal.messages.updateSuccess"));
			} else {
				await dispatch(createJournal(journalData)).unwrap();
				toast.success(t("createJournal.messages.createSuccess"));
			}

			navigate("/journal/entries");
		} catch (err) {
			const errorMessage = err?.message || err?.error || err?.detail || t("createJournal.messages.createError");

			if (err && typeof err === "object" && !err.message && !err.error && !err.detail) {
				const errorMessages = [];
				Object.keys(err).forEach(key => {
					if (Array.isArray(err[key])) {
						errorMessages.push(`${key}: ${err[key].join(", ")}`);
					} else if (typeof err[key] === "string") {
						errorMessages.push(`${key}: ${err[key]}`);
					} else if (typeof err[key] === "object") {
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
				title={isEditMode ? t("createJournal.title.edit") : t("createJournal.title.new")}
				subtitle={isEditMode ? t("createJournal.subtitle.edit") : t("createJournal.subtitle.new")}
				icon={<CreateJournalHeaderIcon />}
			/>

			<div className="mx-auto py-6">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Hero Card */}
					<div className="relative rounded-[36px] border border-[#D7E8EF] bg-linear-to-br from-[#F4FBFE] via-white to-[#EAF5FB] p-8 shadow-xl">
						<HeroPattern />
						<div className="relative space-y-6">
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

					{/* GL Distribution Lines using GLLinesSection */}
					<Card title={t("createJournal.glLines.title")} subtitle={t("createJournal.glLines.subtitle")}>
						<GLLinesSection lines={lines} onChange={handleLinesChange} showGlEntryHeader={false} title="" />

						{/* Totals Summary */}
						<div className="mt-4 p-4 bg-gray-50 rounded-lg border-t-2 border-gray-300">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div className="flex items-center gap-6">
									<div>
										<span className="text-sm text-gray-600">
											{t("createJournal.glLines.totalDebit")}:
										</span>
										<span className="ms-2 text-lg font-semibold text-[#28819C]">
											{totalDebit.toFixed(2)}
										</span>
									</div>
									<div>
										<span className="text-sm text-gray-600">
											{t("createJournal.glLines.totalCredit")}:
										</span>
										<span className="ms-2 text-lg font-semibold text-[#28819C]">
											{totalCredit.toFixed(2)}
										</span>
									</div>
								</div>
								<div>
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
								</div>
							</div>
						</div>
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
