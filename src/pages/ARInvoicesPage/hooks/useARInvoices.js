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

	useEffect(() => {
		dispatch(fetchARInvoices({ page, page_size: localPageSize }));
	}, [dispatch, page, localPageSize]);

	const refreshInvoices = useCallback(() => {
		dispatch(fetchARInvoices({ page, page_size: localPageSize }));
	}, [dispatch, page, localPageSize]);

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
		// Actions
		refreshInvoices,
		deleteInvoice,
		reverseInvoice,
		postInvoiceToGL,
		submitForApproval,
	};
};
