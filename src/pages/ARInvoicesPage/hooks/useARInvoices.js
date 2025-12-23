import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchARInvoices,
	deleteARInvoice,
	submitARInvoiceForApproval,
	reverseARInvoice,
	postARInvoiceToGL,
	setPage,
} from "../../../store/arInvoicesSlice";

export const useARInvoices = () => {
	const dispatch = useDispatch();
	const { invoices, loading, error, count, page, pageSize, hasNext, hasPrevious } = useSelector(
		state => state.arInvoices
	);

	const [localPageSize, setLocalPageSize] = useState(pageSize);
	const [filters, setFilters] = useState({
		customer_id: "",
		currency_id: "",
		country_id: "",
		approval_status: "",
		date_from: "",
		date_to: "",
		search: "",
	});

	useEffect(() => {
		const params = {
			page,
			page_size: localPageSize,
		};
		// Add non-empty filters to params
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== "" && value !== undefined && value !== null) {
				params[key] = value;
			}
		});
		dispatch(fetchARInvoices(params));
	}, [dispatch, page, localPageSize, filters]);

	const refreshInvoices = useCallback(() => {
		const params = {
			page,
			page_size: localPageSize,
		};
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== "" && value !== undefined && value !== null) {
				params[key] = value;
			}
		});
		dispatch(fetchARInvoices(params));
	}, [dispatch, page, localPageSize, filters]);

	const handlePageChange = useCallback(
		newPage => {
			dispatch(setPage(newPage));
		},
		[dispatch]
	);

	const handlePageSizeChange = useCallback(
		newPageSize => {
			setLocalPageSize(newPageSize);
			dispatch(setPage(1)); // Reset to first page when page size changes
		},
		[dispatch]
	);

	const handleFilterChange = useCallback(
		(name, value) => {
			setFilters(prev => ({ ...prev, [name]: value }));
			dispatch(setPage(1)); // Reset to first page when filter changes
		},
		[dispatch]
	);

	const handleClearFilters = useCallback(() => {
		setFilters({
			customer_id: "",
			currency_id: "",
			country_id: "",
			approval_status: "",
			date_from: "",
			date_to: "",
			search: "",
		});
		dispatch(setPage(1));
	}, [dispatch]);

	const deleteInvoice = async id => {
		const result = await dispatch(deleteARInvoice(id)).unwrap();
		refreshInvoices();
		return result;
	};

	const reverseInvoice = async id => {
		const result = await dispatch(reverseARInvoice(id)).unwrap();
		refreshInvoices();
		return result;
	};

	const postInvoiceToGL = async id => {
		const result = await dispatch(postARInvoiceToGL(id)).unwrap();
		refreshInvoices();
		return result;
	};

	const submitForApproval = async id => {
		const result = await dispatch(submitARInvoiceForApproval(id)).unwrap();
		refreshInvoices();
		return result;
	};

	return {
		invoices,
		loading,
		error,
		// Pagination
		count,
		page,
		pageSize: localPageSize,
		hasNext,
		hasPrevious,
		onPageChange: handlePageChange,
		onPageSizeChange: handlePageSizeChange,
		// Filters
		filters,
		onFilterChange: handleFilterChange,
		onClearFilters: handleClearFilters,
		// Actions
		refreshInvoices,
		deleteInvoice,
		reverseInvoice,
		postInvoiceToGL,
		submitForApproval,
	};
};
