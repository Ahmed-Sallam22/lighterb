import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchAPInvoices,
	deleteAPInvoice,
	submitAPInvoiceForApproval,
	reverseAPInvoice,
	postAPInvoiceToGL,
	threeWayMatchAPInvoice,
	setPage,
} from "../../../store/apInvoicesSlice";

export const useAPInvoices = () => {
	const dispatch = useDispatch();
	const { invoices, loading, error, count, page, pageSize, hasNext, hasPrevious } = useSelector(
		state => state.apInvoices
	);

	const [localPageSize, setLocalPageSize] = useState(pageSize);

	useEffect(() => {
		dispatch(fetchAPInvoices({ page, page_size: localPageSize }));
	}, [dispatch, page, localPageSize]);

	const refreshInvoices = useCallback(() => {
		dispatch(fetchAPInvoices({ page, page_size: localPageSize }));
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
		const result = await dispatch(deleteAPInvoice(id)).unwrap();
		refreshInvoices();
		return result;
	};

	const reverseInvoice = async id => {
		const result = await dispatch(reverseAPInvoice(id)).unwrap();
		refreshInvoices();
		return result;
	};

	const postInvoiceToGL = async id => {
		const result = await dispatch(postAPInvoiceToGL(id)).unwrap();
		refreshInvoices();
		return result;
	};

	const submitForApproval = async id => {
		const result = await dispatch(submitAPInvoiceForApproval(id)).unwrap();
		refreshInvoices();
		return result;
	};

	const performThreeWayMatch = async id => {
		const result = await dispatch(threeWayMatchAPInvoice(id)).unwrap();
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
		performThreeWayMatch,
	};
};
