import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from "react-i18next";
import PageHeader from "../components/shared/PageHeader";
import Table from "../components/shared/Table";
import Toolbar from "../components/shared/Toolbar";
import ConfirmModal from "../components/shared/ConfirmModal";
import JournalEntryDetailModal from "../components/JournalEntryDetailModal";
import { fetchJournals, deleteJournal, postJournal, reverseJournal } from "../store/journalsSlice";
import LoadingSpan from "../components/shared/LoadingSpan";
import StatisticsCard from "../components/shared/StatisticsCard";
import JournalEntriesIcon from "../assets/icons/JournalEntriesIcon";
import { twMerge } from "tailwind-merge";
import Button from "../components/shared/Button";
import DecorationPattern from "../ui/DecorationPattern";
import TotalEntriesIcon from "../assets/icons/TotalEntriesIcon";
import PostedIcon from "../assets/icons/PostedIcons";
import DraftIcon from "../assets/icons/DraftIcon";

const JournalEntriesPage = () => {
	const { t, i18n } = useTranslation();
	const isRtl = i18n.dir() === "rtl";
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// Redux state
	const { journals, loading, error } = useSelector(state => state.journals);

	// Local state
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [journalToDelete, setJournalToDelete] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("");

	// View modal state
	const [viewModalOpen, setViewModalOpen] = useState(false);
	const [selectedJournalId, setSelectedJournalId] = useState(null);

	// Fetch journals on component mount
	useEffect(() => {
		dispatch(fetchJournals());
	}, [dispatch]);

	// Show error toast if there's an error
	useEffect(() => {
		if (error) {
			// Display detailed error message
			const errorMessage =
				typeof error === "string"
					? error
					: error?.message || error?.error || error?.detail || "An error occurred";
			toast.error(errorMessage);
		}
	}, [error]);

	// Calculate statistics
	const totalEntries = journals.length;
	const postedEntries = journals.filter(j => j.is_posted || j.posted).length;
	const draftEntries = journals.filter(j => !(j.is_posted || j.posted)).length;

	// Filter and search journals
	const filteredJournals = journals.filter(journal => {
		const matchesSearch =
			searchTerm === "" ||
			journal.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			journal.id?.toString().includes(searchTerm);

		const isPosted = journal.is_posted || journal.posted;
		const matchesFilter =
			filterStatus === "" || (filterStatus === "posted" && isPosted) || (filterStatus === "draft" && !isPosted);

		return matchesSearch && matchesFilter;
	});

	// Transform data for table display
	const journalEntries = filteredJournals.map(journal => {
		// Use total_debit/total_credit from API response
		const totalDebit = parseFloat(journal.total_debit || 0);
		const totalCredit = parseFloat(journal.total_credit || 0);
		const isPosted = journal.is_posted || journal.posted;

		return {
			id: journal.id,
			name: journal.memo || `Journal Entry ${journal.id}`,
			date: journal.date || new Date().toISOString().split("T")[0],
			lines: journal.line_count || 0,
			totalDebit: `${journal.currency_code || "$"}${totalDebit.toFixed(2)}`,
			totalCredit: `${journal.currency_code || "$"}${totalCredit.toFixed(2)}`,
			// Use localized keys for logic, we will translate in render
			status: isPosted ? "posted" : "draft",
			rawData: journal, // Keep original data for actions
		};
	});

	const statCards = [
		{
			title: t("journals.stats.totalEntries"),
			value: totalEntries.toString(),
			icon: <TotalEntriesIcon />,
			iconBg: "bg-[#E1F5FE]",
			valueColor: "text-gray-900",
		},
		{
			title: t("journals.stats.posted"),
			value: postedEntries.toString(),
			icon: <PostedIcon />,
			iconBg: "bg-green-50",
			valueColor: "text-green-600",
		},
		{
			title: t("journals.stats.draft"),
			value: draftEntries.toString(),
			icon: <DraftIcon />,
			iconBg: "bg-gray-50",
			valueColor: "text-gray-600",
		},
	];

	const columns = [
		{
			header: t("journals.table.name"),
			accessor: "name",
		},
		{
			header: t("journals.table.id"),
			accessor: "id",
			width: "140px",
		},
		{
			header: t("journals.table.date"),
			accessor: "date",
			width: "130px",
		},
		{
			header: t("journals.table.lines"),
			accessor: "lines",
			width: "100px",
			render: value => <span className="font-semibold">{value}</span>,
		},
		{
			header: t("journals.table.totalDebit"),
			accessor: "totalDebit",
			width: "140px",
			render: value => <span className="font-semibold text-red-600">{value}</span>,
		},
		{
			header: t("journals.table.totalCredit"),
			accessor: "totalCredit",
			width: "140px",
			render: value => <span className="font-semibold text-green-600">{value}</span>,
		},
		{
			header: t("journals.table.status"),
			accessor: "status",
			width: "120px",
			render: value => {
				const statusColors = {
					posted: "bg-green-100 text-green-800",
					draft: "bg-gray-100 text-gray-800",
				};
				// Translate the value (which is 'posted' or 'draft')
				return (
					<span
						className={`px-3 py-1 rounded-full text-xs font-semibold ${
							statusColors[value] || "bg-gray-100 text-gray-800"
						}`}
					>
						{t(`journals.status.${value}`)}
					</span>
				);
			},
		},
		{
			header: t("journals.table.actions"),
			accessor: "actions",
			width: "200px",
			render: (_, row) => {
				const isPosted = row.rawData?.is_posted || row.rawData?.posted;
				return (
					<div className="flex items-center gap-2">
						<Button
							onClick={e => {
								e.stopPropagation();
								isPosted ? handleReverseJournal(row) : handlePostJournal(row);
							}}
							title={isPosted ? t("journals.actions.reverse") : t("journals.actions.post")}
							className={twMerge(
								"text-xs px-3 py-1",
								isPosted ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"
							)}
						/>
					</div>
				);
			},
		},
	];

	// Handler functions
	const handleView = row => {
		setSelectedJournalId(row.id);
		setViewModalOpen(true);
	};

	const handleCloseViewModal = () => {
		setViewModalOpen(false);
		setSelectedJournalId(null);
	};

	const handleDelete = row => {
		setJournalToDelete(row);
		setConfirmDelete(true);
	};

	const handleConfirmDelete = async () => {
		if (journalToDelete) {
			try {
				await dispatch(deleteJournal(journalToDelete.id)).unwrap();
				toast.success(t("journals.messages.deleteSuccess"));
				setConfirmDelete(false);
				setJournalToDelete(null);
			} catch (err) {
				// Display detailed error message from API response
				const errorMessage = err?.message || err?.error || err?.detail || t("journals.messages.deleteError");
				toast.error(errorMessage);
			}
		}
	};

	const handlePostJournal = async row => {
		const isPosted = row.rawData?.is_posted || row.rawData?.posted;
		if (isPosted) {
			toast.info(t("journals.messages.postInfo"));
			return;
		}

		try {
			await dispatch(postJournal(row.id)).unwrap();
			toast.success(t("journals.messages.postSuccess"));
			dispatch(fetchJournals()); // Refresh the list
		} catch (err) {
			// Display detailed error message from API response
			const errorMessage = err?.message || err?.error || err?.detail || t("journals.messages.postError");
			toast.error(errorMessage);
		}
	};

	const handleReverseJournal = async row => {
		const isPosted = row.rawData?.is_posted || row.rawData?.posted;
		if (!isPosted) {
			toast.info(t("journals.messages.reverseInfo"));
			return;
		}

		try {
			await dispatch(reverseJournal(row.id)).unwrap();
			toast.success(t("journals.messages.reverseSuccess"));
			dispatch(fetchJournals()); // Refresh the list
		} catch (err) {
			// Display detailed error message from API response
			const errorMessage = err?.message || err?.error || err?.detail || t("journals.messages.reverseError");
			toast.error(errorMessage);
		}
	};

	const handleCreateJournal = () => {
		navigate("/journal/create");
	};

	const handleSearchChange = value => {
		setSearchTerm(value);
	};

	const handleFilterChange = value => {
		setFilterStatus(value);
	};

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

			{/* View Journal Entry Modal */}
			<JournalEntryDetailModal
				isOpen={viewModalOpen}
				journalId={selectedJournalId}
				onClose={handleCloseViewModal}
			/>

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={confirmDelete}
				onClose={() => {
					setConfirmDelete(false);
					setJournalToDelete(null);
				}}
				onConfirm={handleConfirmDelete}
				title={t("journals.modals.deleteTitle")}
				message={t("journals.modals.deleteMessage", { name: journalToDelete?.name })}
				confirmText={t("journals.modals.deleteConfirm")}
				cancelText={t("journals.modals.cancel")}
			/>

			{/* Header */}
			<PageHeader title={t("journals.title")} subtitle={t("journals.subtitle")} icon={<JournalEntriesIcon />} />

			<div className="w-[95%] mx-auto py-6 space-y-6">
				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{statCards.map((card, index) => (
						<div key={index}>
							<DecorationPattern />
							<StatisticsCard title={card.title} value={card.value} icon={card.icon} />
						</div>
					))}
				</div>

				<Toolbar
					searchPlaceholder={t("journals.toolbar.searchPlaceholder")}
					filterOptions={[
						{ value: "", label: t("journals.toolbar.filterAll") },
						{ value: "posted", label: t("journals.toolbar.posted") },
						{ value: "draft", label: t("journals.toolbar.draft") },
					]}
					createButtonText={t("journals.toolbar.newJournal")}
					onSearchChange={handleSearchChange}
					onFilterChange={handleFilterChange}
					onCreateClick={handleCreateJournal}
				/>

				{/* Table Section */}
				{loading ? (
					<LoadingSpan text={t("journals.table.loading")} />
				) : (
					<Table
						columns={columns}
						data={journalEntries}
						onDelete={handleDelete}
						onView={handleView}
						className="mb-8"
						emptyMessage={t("journals.table.emptyMessage")}
					/>
				)}
			</div>
		</div>
	);
};

export default JournalEntriesPage;
