import { toast } from "react-toastify";

export const useInvoiceHandlers = ({
	navigate,
	quickActionPath,
	setSelectedInvoice,
	setActionType,
	setIsModalOpen,
	submitForApproval,
	performThreeWayMatch, // Optional - only for AP
	refreshInvoices,
	deleteInvoice,
	reverseInvoice,
	postInvoiceToGL,
}) => {
	// Navigation handlers
	const handleCreate = () => {
		navigate(quickActionPath);
	};

	const handleEdit = row => {
		const invoice = row.rawData || row;
		navigate(quickActionPath, { state: { invoice, mode: "edit" } });
	};

	// Search and filter handlers
	const handleSearch = searchValue => {
		console.log("Search:", searchValue);
		// TODO: Implement search logic
	};

	const handleFilter = filterValue => {
		console.log("Filter:", filterValue);
		// TODO: Implement filter logic
	};

	// Delete/Reverse handler
	const handleDelete = row => {
		const invoice = row.rawData || row;
		setSelectedInvoice(invoice);

		// If invoice is posted, use reverse action instead of delete
		if (invoice.is_posted) {
			setActionType("reverse");
		} else {
			setActionType("delete");
		}

		setIsModalOpen(true);
	};

	// Approval handler
	const handleSubmitForApproval = async row => {
		const invoice = row.rawData || row;
		try {
			await submitForApproval(invoice.id);
			toast.success("Invoice submitted for approval successfully");
			refreshInvoices();
		} catch (error) {
			console.error("Failed to submit invoice for approval:", error);
		}
	};

	// Post to GL handler
	const handlePostToGL = row => {
		const invoice = row.rawData || row;
		setSelectedInvoice(invoice);
		setActionType("post");
		setIsModalOpen(true);
	};

	// Three-way match handler (AP only)
	const handleThreeWayMatch = performThreeWayMatch
		? async row => {
				const invoice = row.rawData || row;
				try {
					await performThreeWayMatch(invoice.id);
					toast.success("Three-way match completed successfully");
					refreshInvoices();
				} catch (error) {
					console.error("Failed to perform three-way match:", error);
				}
		  }
		: undefined;

	// Modal handlers
	const handleConfirmAction = async (actionType, selectedInvoice) => {
		try {
			if (actionType === "delete") {
				await deleteInvoice(selectedInvoice.id);
				toast.success("Invoice deleted successfully");
			} else if (actionType === "reverse") {
				await reverseInvoice(selectedInvoice.id);
				toast.success("Invoice reversed successfully");
			} else if (actionType === "post") {
				await postInvoiceToGL(selectedInvoice.id);
				toast.success("Invoice posted to GL successfully");
			}

			setIsModalOpen(false);
			setSelectedInvoice(null);
			setActionType(null);
			refreshInvoices();
		} catch (error) {
			console.error(`Failed to ${actionType} invoice:`, error);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedInvoice(null);
		setActionType(null);
	};

	return {
		handleSearch,
		handleFilter,
		handleCreate,
		handleEdit,
		handleDelete,
		handleSubmitForApproval,
		handlePostToGL,
		handleThreeWayMatch,
		handleConfirmAction,
		handleCloseModal,
	};
};
