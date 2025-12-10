import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import FloatingLabelInput from "../components/shared/FloatingLabelInput";
import FloatingLabelSelect from "../components/shared/FloatingLabelSelect";
import Table from "../components/shared/Table";
import SlideUpModal from "../components/shared/SlideUpModal";
import { fetchJournalLines } from "../store/journalLinesSlice";
import LoadingSpan from "../components/shared/LoadingSpan";
import StatisticsCard from "../components/shared/StatisticsCard";
import Button from "../components/shared/Button";
import DecorationPattern from "../ui/DecorationPattern";
import JournalLinesIcon from "../assets/icons/JournalLinesIcon";
import TotalLinesIcon from "../assets/icons/TotalLinesIcon";
import TotalDebitsIcon from "../assets/icons/TotalDebitsIcon";
import TotalCreditsIcon from "../assets/icons/TotalCreditsIcon";
import PostedIcon from "../assets/icons/PostedIcons";
import DraftIcon from "../assets/icons/DraftIcon";
import TrendUpIcon from "../assets/icons/TrendUpIcon";
import TrendDownIcon from "../assets/icons/TrendDownIcon";
import JournalLineDetailsModal from "../components/JournalLineDetailsModal";

const JournalLinesPage = () => {
	const { t, i18n } = useTranslation();
	const dispatch = useDispatch();
	const { lines, loading, error, statistics } = useSelector(state => state.journalLines);

	const [filters, setFilters] = useState({
		code: "",
		name: "",
		dateFrom: "",
		dateTo: "",
		status: "",
	});

	const [selectedLine, setSelectedLine] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Fetch journal lines on mount
	useEffect(() => {
		dispatch(fetchJournalLines());
	}, [dispatch]);

	// Display error toast
	useEffect(() => {
		if (error) {
			toast.error(error, { autoClose: 5000 });
		}
	}, [error]);

	// Transform API data for table display
	const journalLines = lines.map(line => {
		const isDebit = Number(line.debit) > 0;
		// Map backend values to translation keys for logic
		const typeKey = isDebit ? "debit" : "credit";
		const statusKey = line.entry?.posted ? "posted" : "draft";

		return {
			id: line.id,
			account: line.account?.name || "-",
			code: line.account?.code || "-",
			memo: line.entry?.memo || "-",
			date: line.entry?.date || "-",
			entry: line.entry?.id || "-",
			type: t(`journalLines.type.${typeKey}`),
			rawType: typeKey, // Keep for logic/colors
			debit: Number(line.debit) > 0 ? `$${Number(line.debit).toFixed(2)}` : "-",
			credit: Number(line.credit) > 0 ? `$${Number(line.credit).toFixed(2)}` : "-",
			status: t(`journalLines.status.${statusKey}`),
			rawStatus: statusKey, // Keep for logic/colors
			rawData: line, // Keep original data for modal
		};
	});

	const columns = [
		{
			header: t("journalLines.table.account"),
			accessor: "account",
		},
		{
			header: t("journalLines.table.id"),
			accessor: "id",
			width: "120px",
		},
		{
			header: t("journalLines.table.date"),
			accessor: "date",
			width: "130px",
		},
		{
			header: t("journalLines.table.entry"),
			accessor: "entry",
			width: "130px",
		},
		{
			header: t("journalLines.table.type"),
			accessor: "type",
			width: "100px",
			render: (value, row) => {
				const typeColors = {
					debit: "text-red-600 font-semibold",
					credit: "text-green-600 font-semibold",
				};
				// Use rawType for color mapping
				return <span className={typeColors[row.rawType] || ""}>{value}</span>;
			},
		},
		{
			header: t("journalLines.table.debit"),
			accessor: "debit",
			width: "130px",
			render: value => <span className="font-semibold">{value}</span>,
		},
		{
			header: t("journalLines.table.credit"),
			accessor: "credit",
			width: "130px",
			render: value => <span className="font-semibold">{value}</span>,
		},
		{
			header: t("journalLines.table.status"),
			accessor: "status",
			width: "120px",
			render: (value, row) => {
				const statusColors = {
					posted: "bg-green-100 text-green-800",
					draft: "bg-gray-100 text-gray-800",
				};
				// Use rawStatus for color mapping
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							statusColors[row.rawStatus] || "bg-gray-100 text-gray-800"
						}`}
					>
						{value}
					</span>
				);
			},
		},
	];

	const statusOptions = [
		{ value: "", label: t("journalLines.filters.allStatuses") },
		{ value: "posted", label: t("journalLines.filters.posted") },
		{ value: "draft", label: t("journalLines.filters.draft") },
	];

	const formatDisplayDate = value => {
		if (!value) return t("journalLines.modal.na");
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return value;
		}
		// Use i18n language for date formatting
		return date.toLocaleDateString(i18n.language, {
			month: "short",
			day: "2-digit",
			year: "numeric",
		});
	};

	const normalizedAmount = amount => (amount && amount !== "-" ? amount : "$0.00");

	const statCards = [
		{
			title: t("journalLines.stats.totalLines"),
			value: statistics?.totalLines || 0,
			icon: <TotalLinesIcon />,
			iconBg: "bg-[#E1F5FE]",
			valueColor: "text-gray-900",
		},
		{
			title: t("journalLines.stats.totalDebits"),
			value: `$${(statistics?.totalDebits || 0).toFixed(2)}`,
			icon: <TotalDebitsIcon />,
			iconBg: "bg-red-50",
			valueColor: "text-red-600",
		},
		{
			title: t("journalLines.stats.totalCredits"),
			value: `$${(statistics?.totalCredits || 0).toFixed(2)}`,
			icon: <TotalCreditsIcon />,
			iconBg: "bg-green-50",
			valueColor: "text-green-600",
		},
		{
			title: t("journalLines.stats.posted"),
			value: statistics?.postedLines || 0,
			icon: <PostedIcon />,
			iconBg: "bg-green-50",
			valueColor: "text-gray-900",
		},
		{
			title: t("journalLines.stats.draft"),
			value: statistics?.draftLines || 0,
			icon: <DraftIcon />,
			iconBg: "bg-gray-50",
			valueColor: "text-gray-900",
		},
	];

	const handleFilterChange = (name, value) => {
		setFilters(prev => ({
			...prev,
			[name]: value,
		}));
	};

	const handleApplyFilters = () => {
		const filterParams = {
			account_code: filters.code,
			account_name: filters.name,
			date_from: filters.dateFrom,
			date_to: filters.dateTo,
			posted: filters.status === "posted" ? "true" : filters.status === "draft" ? "false" : "",
		};
		dispatch(fetchJournalLines(filterParams));
	};

	const handleClearFilters = () => {
		setFilters({
			code: "",
			name: "",
			dateFrom: "",
			dateTo: "",
			status: "",
		});
		// Fetch all lines without filters
		dispatch(fetchJournalLines());
	};

	const handleView = row => {
		setSelectedLine(row);
		setIsModalOpen(true);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<PageHeader
				title={t("journalLines.title")}
				subtitle={t("journalLines.subtitle")}
				icon={<JournalLinesIcon />}
			/>

			<div className="w-[95%] mx-auto py-6 space-y-6">
				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
					{statCards.map(card => (
						<div key={card.title} className="relative overflow-hidden">
							<DecorationPattern />
							<StatisticsCard
								title={card.title}
								value={card.value}
								icon={card.icon}
								titleClassName="text-[#28819C]"
								valueClassName={card.valueColor}
								iconClassName={card.iconBg}
							/>
						</div>
					))}
				</div>

				{/* Filters Section */}
				<div className=" rounded-xl  p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-6">{t("journalLines.filters.title")}</h3>

					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-6">
						{/* Code Filter */}
						<FloatingLabelInput
							id="code"
							label={t("journalLines.filters.code")}
							value={filters.code}
							onChange={e => handleFilterChange("code", e.target.value)}
							placeholder={t("journalLines.filters.codePlaceholder")}
						/>

						{/* Name Filter */}
						<FloatingLabelInput
							id="name"
							label={t("journalLines.filters.name")}
							value={filters.name}
							onChange={e => handleFilterChange("name", e.target.value)}
							placeholder={t("journalLines.filters.namePlaceholder")}
						/>

						{/* Date From */}
						<FloatingLabelInput
							id="dateFrom"
							label={t("journalLines.filters.dateFrom")}
							type="date"
							value={filters.dateFrom}
							onChange={e => handleFilterChange("dateFrom", e.target.value)}
						/>

						{/* Date To */}
						<FloatingLabelInput
							id="dateTo"
							label={t("journalLines.filters.dateTo")}
							type="date"
							value={filters.dateTo}
							onChange={e => handleFilterChange("dateTo", e.target.value)}
						/>

						{/* Status Filter */}
						<FloatingLabelSelect
							id="status"
							label={t("journalLines.filters.status")}
							value={filters.status}
							onChange={e => handleFilterChange("status", e.target.value)}
							options={statusOptions}
						/>
					</div>

					{/* Filter Buttons */}
					<div className="flex justify-end gap-4">
						<Button
							onClick={handleClearFilters}
							title={t("journalLines.filters.clearAll")}
							className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
						/>
						<Button onClick={handleApplyFilters} title={t("journalLines.filters.applyFilters")} />
					</div>
				</div>

				{/* Table Section */}
				{loading ? (
					<LoadingSpan />
				) : (
					<Table
						columns={columns}
						data={journalLines}
						onEdit={handleView}
						editIcon="view"
						className="mb-8"
						emptyMessage={t("journalLines.table.emptyMessage")}
					/>
				)}
			</div>

			<JournalLineDetailsModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				selectedLine={selectedLine}
				t={t}
				formatDisplayDate={formatDisplayDate}
				normalizedAmount={normalizedAmount}
			/>
		</div>
	);
};

export default JournalLinesPage;
