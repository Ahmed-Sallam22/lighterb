import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import FloatingLabelSelect from "../../../components/shared/FloatingLabelSelect";
import FloatingLabelInput from "../../../components/shared/FloatingLabelInput";
import Button from "../../../components/shared/Button";
import { BiPlus } from "react-icons/bi";
import { fetchSuppliers } from "../../../store/suppliersSlice";
import { fetchCustomers } from "../../../store/customersSlice";
import { fetchCurrencies } from "../../../store/currenciesSlice";
import { fetchCountries } from "../../../store/countriesSlice";

const InvoiceToolbarFilters = ({
	onFilterChange,
	onClearFilters,
	onCreateClick,
	createButtonText = "New Invoice",
	filters = {},
	invoiceType = "AP", // "AP", "AR", or "OTS" (One Time Supplier)
}) => {
	const { t } = useTranslation();
	const dispatch = useDispatch();

	const { suppliers } = useSelector(state => state.suppliers);
	const { customers } = useSelector(state => state.customers);
	const { currencies } = useSelector(state => state.currencies);
	const { countries } = useSelector(state => state.countries);

	// Fetch reference data on mount
	useEffect(() => {
		if (invoiceType === "AR") {
			dispatch(fetchCustomers());
		} else {
			dispatch(fetchSuppliers());
		}
		dispatch(fetchCurrencies());
		dispatch(fetchCountries());
	}, [dispatch, invoiceType]);

	// Status options
	const statusOptions = [
		{ value: "", label: t("invoices.filters.allStatuses", "All Statuses") },
		{ value: "DRAFT", label: t("invoices.filters.draft", "Draft") },
		{ value: "PENDING_APPROVAL", label: t("invoices.filters.pending", "Pending Approval") },
		{ value: "APPROVED", label: t("invoices.filters.approved", "Approved") },
		{ value: "REJECTED", label: t("invoices.filters.rejected", "Rejected") },
	];

	// Business partner options (suppliers or customers)
	const businessPartnerOptions =
		invoiceType === "AR"
			? [
					{ value: "", label: t("invoices.filters.allCustomers", "All Customers") },
					...customers.map(c => ({
						value: c.id,
						label: c.name || c.company_name || `Customer #${c.id}`,
					})),
			  ]
			: [
					{ value: "", label: t("invoices.filters.allSuppliers", "All Suppliers") },
					...suppliers.map(s => ({
						value: s.id,
						label: s.name || s.company_name || `Supplier #${s.id}`,
					})),
			  ];

	// Currency options
	const currencyOptions = [
		{ value: "", label: t("invoices.filters.allCurrencies", "All Currencies") },
		...currencies.map(c => ({
			value: c.id,
			label: `${c.code} - ${c.name}`,
		})),
	];

	// Country options
	const countryOptions = [
		{ value: "", label: t("invoices.filters.allCountries", "All Countries") },
		...countries.map(c => ({
			value: c.id,
			label: c.name || c.code,
		})),
	];

	const handleChange = e => {
		const { name, value } = e.target;
		if (onFilterChange) {
			onFilterChange(name, value);
		}
	};

	const businessPartnerField = invoiceType === "AR" ? "customer_id" : "supplier_id";

	return (
		<div className="space-y-4">
			{/* Header with Create Button */}
			<div className="flex justify-end">
				<Button onClick={onCreateClick} title={createButtonText} icon={<BiPlus size={24} />} />
			</div>

			{/* Filters Section */}
			<div className="bg-white rounded-2xl shadow-lg p-6 border border-dashed border-gray-300">
				{/* Row 1: Date From, Date To, Business Partner, Approval Status */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
					<FloatingLabelInput
						label={t("invoices.filters.dateFrom", "Date From")}
						type="date"
						name="date_from"
						value={filters.date_from || ""}
						onChange={handleChange}
					/>
					<FloatingLabelInput
						label={t("invoices.filters.dateTo", "Date To")}
						type="date"
						name="date_to"
						value={filters.date_to || ""}
						onChange={handleChange}
					/>
					<FloatingLabelSelect
						label={
							invoiceType === "AR"
								? t("invoices.filters.customer", "Customer")
								: t("invoices.filters.supplier", "Supplier")
						}
						name={businessPartnerField}
						value={filters[businessPartnerField] || ""}
						onChange={handleChange}
						options={businessPartnerOptions}
					/>
					<FloatingLabelSelect
						label={t("invoices.filters.status", "Status")}
						name="approval_status"
						value={filters.approval_status || ""}
						onChange={handleChange}
						options={statusOptions}
						searchable={false}
					/>
				</div>
				{/* Row 2: Currency, Country, Search, Buttons */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
					<FloatingLabelSelect
						label={t("invoices.filters.currency", "Currency")}
						name="currency_id"
						value={filters.currency_id || ""}
						onChange={handleChange}
						options={currencyOptions}
					/>
					<FloatingLabelSelect
						label={t("invoices.filters.country", "Country")}
						name="country_id"
						value={filters.country_id || ""}
						onChange={handleChange}
						options={countryOptions}
					/>
					{/* Search Input */}
					<FloatingLabelInput
						label={t("invoices.filters.search", "Search")}
						type="text"
						name="search"
						value={filters.search || ""}
						onChange={handleChange}
						placeholder={t("invoices.filters.searchPlaceholder", "Search invoices...")}
					/>
					{/* Buttons */}
					<div className="flex gap-3 justify-end">
						<Button
							onClick={onClearFilters}
							title={t("invoices.filters.reset", "Reset")}
							className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-none"
						/>
						<Button
							onClick={() => onFilterChange && onFilterChange("_apply", Date.now())}
							title={t("invoices.filters.apply", "Apply Filters")}
							className="bg-[#28819C] hover:bg-[#1d6a80] text-white"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default InvoiceToolbarFilters;
