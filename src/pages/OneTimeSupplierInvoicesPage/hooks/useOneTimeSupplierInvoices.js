import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchOneTimeSupplierInvoices,
	deleteOneTimeSupplierInvoice,
	setPage,
} from "../../../store/oneTimeSupplierInvoicesSlice";

export const useOneTimeSupplierInvoices = () => {
	const dispatch = useDispatch();
	const { invoices, loading, error, count, page, pageSize, hasNext, hasPrevious } = useSelector(
		state => state.oneTimeSupplierInvoices
	);

	const [localPageSize, setLocalPageSize] = useState(pageSize);

	useEffect(() => {
		dispatch(fetchOneTimeSupplierInvoices({ page, page_size: localPageSize }));
	}, [dispatch, page, localPageSize]);

	const refreshInvoices = useCallback(() => {
		dispatch(fetchOneTimeSupplierInvoices({ page, page_size: localPageSize }));
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
		const result = await dispatch(deleteOneTimeSupplierInvoice(id)).unwrap();
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
	};
};
