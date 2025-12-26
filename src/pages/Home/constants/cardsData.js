export const getCardsData = t => ({
	Dashboard: [
		{ title: t("home.cards.setup.title"), description: t("home.cards.setup.description"), key: "Setup" },
		{
			title: t("home.cards.journalEntries.title"),
			description: t("home.cards.journalEntries.description"),
			key: "Journal Entries",
		},
		{
			title: t("home.cards.accountsReceivable.title"),
			description: t("home.cards.accountsReceivable.description"),
			key: "Accounts Receivable",
		},
		{
			title: t("home.cards.accountsPayable.title"),
			description: t("home.cards.accountsPayable.description"),
			key: "Accounts Payable",
		},
		{
			title: t("home.cards.reports.title"),
			description: t("home.cards.reports.description"),
			key: "Reports",
			isDisabled: true,
		},
		{
			title: t("home.cards.currencies.title"),
			description: t("home.cards.currencies.description"),
			key: "Currencies",
		},
		{
			title: t("home.cards.countries.title"),
			description: t("home.cards.countries.description"),
			key: "Countries",
		},
		{
			title: t("home.cards.fxConfiguration.title"),
			description: t("home.cards.fxConfiguration.description"),
			key: "FX Configuration",
			isDisabled: true,
		},
		{
			title: t("home.cards.taxRates.title"),
			description: t("home.cards.taxRates.description"),
			key: "Tax Rates",
		},
		{
			title: t("home.cards.corporateTax.title"),
			description: t("home.cards.corporateTax.description"),
			key: "Corporate Tax",
			isDisabled: true,
		},
		{
			title: t("home.cards.customers.title"),
			description: t("home.cards.customers.description"),
			key: "Customers",
		},
		{
			title: t("home.cards.suppliers.title"),
			description: t("home.cards.suppliers.description"),
			key: "Suppliers",
		},
		{
			title: t("home.cards.invoiceApprovals.title"),
			description: t("home.cards.invoiceApprovals.description"),
			key: "Invoice Approvals",
		},
		{
			title: t("oneTimeSupplierInvoices.title"),
			description: t("oneTimeSupplierInvoices.subtitle"),
			key: "One-Time Supplier Invoices",
		},
	],
	Assets: [
		{
			title: t("home.cards.assetRegister.title"),
			description: t("home.cards.assetRegister.description"),
			key: "Asset Register",
		},
		{
			title: t("home.cards.assetCategories.title"),
			description: t("home.cards.assetCategories.description"),
			key: "Asset Categories",
		},
		{
			title: t("home.cards.assetLocations.title"),
			description: t("home.cards.assetLocations.description"),
			key: "Asset Locations",
		},
		{
			title: t("home.cards.depreciation.title"),
			description: t("home.cards.depreciation.description"),
			key: "Depreciation",
		},
	],
	// Procurement: [
	// 	{
	// 		title: t("home.cards.procurementDashboard.title"),
	// 		description: t("home.cards.procurementDashboard.description"),
	// 		key: "Procurement Dashboard",
	// 	},
	// 	{
	// 		title: t("home.cards.procurement.title"),
	// 		description: t("home.cards.procurement.description"),
	// 		key: "Procurement",
	// 	},
	// ],
	Accounts: [
		{
			title: t("home.cards.chartOfAccounts.title"),
			description: t("home.cards.chartOfAccounts.description"),
			key: "Chart of Accounts",
		},
		{
			title: t("home.cards.generalLedger.title"),
			description: t("home.cards.generalLedger.description"),
			key: "General Ledger",
		},
		{
			title: t("home.cards.trialBalance.title"),
			description: t("home.cards.trialBalance.description"),
			key: "Trial Balance",
		},
		{
			title: t("home.cards.bankAccounts.title"),
			description: t("home.cards.bankAccounts.description"),
			key: "Bank Accounts",
		},
		{
			title: t("home.cards.reconciliation.title"),
			description: t("home.cards.reconciliation.description"),
			key: "Reconciliation",
		},
		{ title: t("home.cards.budget.title"), description: t("home.cards.budget.description"), key: "Budget" },
		{
			title: t("home.cards.costCenters.title"),
			description: t("home.cards.costCenters.description"),
			key: "Cost Centers",
		},
		{
			title: t("home.cards.financialReports.title"),
			description: t("home.cards.financialReports.description"),
			key: "Financial Reports",
		},
	],
	
});
