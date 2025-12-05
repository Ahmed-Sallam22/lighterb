import React from "react";
import Toolbar from "../../../components/shared/Toolbar";

const FILTER_OPTIONS = [
	{ value: "", label: "All Status" },
	{ value: "paid", label: "Paid" },
	{ value: "unpaid", label: "Unpaid" },
	{ value: "partial", label: "Partial" },
];

const ToolbarFilters = ({ onSearch, onFilter, onCreateClick }) => {
	return (
		<Toolbar
			searchPlaceholder="Search invoices..."
			onSearchChange={onSearch}
			filterOptions={FILTER_OPTIONS}
			filterLabel="Filter by Payment Status"
			onFilterChange={onFilter}
			createButtonText="New AP Invoice"
			onCreateClick={onCreateClick}
		/>
	);
};

export default ToolbarFilters;
