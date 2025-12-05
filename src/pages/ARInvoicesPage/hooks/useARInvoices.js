import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchARInvoices,
	deleteARInvoice,
	submitARInvoiceForApproval,
	reverseARInvoice,
	postARInvoiceToGL,
} from "../../../store/arInvoicesSlice";

export const useARInvoices = () => {
	const dispatch = useDispatch();
	const { invoices, loading, error } = useSelector(state => state.arInvoices);

	useEffect(() => {
		dispatch(fetchARInvoices());
	}, [dispatch]);

	const refreshInvoices = () => {
		dispatch(fetchARInvoices());
	};

	const deleteInvoice = async id => {
		return await dispatch(deleteARInvoice(id)).unwrap();
	};

	const reverseInvoice = async id => {
		return await dispatch(reverseARInvoice(id)).unwrap();
	};

	const postInvoiceToGL = async id => {
		return await dispatch(postARInvoiceToGL(id)).unwrap();
	};

	const submitForApproval = async id => {
		return await dispatch(submitARInvoiceForApproval(id)).unwrap();
	};

	return {
		invoices,
		loading,
		error,
		refreshInvoices,
		deleteInvoice,
		reverseInvoice,
		postInvoiceToGL,
		submitForApproval,
	};
};
