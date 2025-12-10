import React from "react";
import { useTranslation } from "react-i18next";
import Toolbar from "../../../components/shared/Toolbar";

const InvoiceToolbarFilters = ({ onSearch, onFilter, onCreateClick, createButtonText = "New Invoice" }) => {
	const { t } = useTranslation();

	const FILTER_OPTIONS = [
		{ value: "", label: t("apInvoices.toolbar.filterAll") },
		{ value: "paid", label: t("apInvoices.toolbar.filterPaid") },
		{ value: "unpaid", label: t("apInvoices.toolbar.filterUnpaid") },
		{ value: "partial", label: t("apInvoices.toolbar.filterPartial") },
	];

	return (
		<Toolbar
			searchPlaceholder={t("apInvoices.toolbar.searchPlaceholder")}
			onSearchChange={onSearch}
			filterOptions={FILTER_OPTIONS}
			filterLabel={t("apInvoices.toolbar.filterLabel")}
			onFilterChange={onFilter}
			createButtonText={createButtonText}
			onCreateClick={onCreateClick}
		/>
	);
};

export default InvoiceToolbarFilters;
