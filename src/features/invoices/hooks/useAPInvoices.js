import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchAPInvoices,
	deleteAPInvoice,
	submitAPInvoiceForApproval,
	reverseAPInvoice,
	postAPInvoiceToGL,
	threeWayMatchAPInvoice,
} from "../../../store/apInvoicesSlice";

export const useAPInvoices = () => {
	const dispatch = useDispatch();
	const { invoices, loading, error } = useSelector(state => state.apInvoices);

	useEffect(() => {
		dispatch(fetchAPInvoices());
	}, [dispatch]);

	const refreshInvoices = () => {
		dispatch(fetchAPInvoices());
	};

	const deleteInvoice = async id => {
		return await dispatch(deleteAPInvoice(id)).unwrap();
	};

	const reverseInvoice = async id => {
		return await dispatch(reverseAPInvoice(id)).unwrap();
	};

	const postInvoiceToGL = async id => {
		return await dispatch(postAPInvoiceToGL(id)).unwrap();
	};

	const submitForApproval = async id => {
		return await dispatch(submitAPInvoiceForApproval(id)).unwrap();
	};

	const performThreeWayMatch = async id => {
		return await dispatch(threeWayMatchAPInvoice(id)).unwrap();
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
		performThreeWayMatch,
	};
};
