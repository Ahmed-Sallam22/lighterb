export const QUICK_ACTIONS = [
	{
		id: "create-requisition",
		labelKey: "home.quickActionsList.createRequisition.label",
		descriptionKey: "home.quickActionsList.createRequisition.description",
	},
	{
		id: "create-ar-invoice",
		labelKey: "home.quickActionsList.createArInvoice.label",
		descriptionKey: "home.quickActionsList.createArInvoice.description",
	},
	{
		id: "create-ap-invoice",
		labelKey: "home.quickActionsList.createApInvoice.label",
		descriptionKey: "home.quickActionsList.createApInvoice.description",
	},
	{
		id: "receive-payment",
		labelKey: "home.quickActionsList.receivePayment.label",
		descriptionKey: "home.quickActionsList.receivePayment.description",
	},
	{
		id: "make-payment",
		labelKey: "home.quickActionsList.makePayment.label",
		descriptionKey: "home.quickActionsList.makePayment.description",
	},
	{
		id: "create-one-time-supplier-invoice",
		labelKey: "home.quickActionsList.createOneTimeSupplierInvoice.label",
		descriptionKey: "home.quickActionsList.createOneTimeSupplierInvoice.description",
	},
	{
		id: "create-approval-workflow",
		labelKey: "home.quickActionsList.createApprovalWorkflow.label",
		descriptionKey: "home.quickActionsList.createApprovalWorkflow.description",
	},
	// {
	// 	id: 'create-vendor-bill',
	// 	labelKey: 'home.quickActionsList.createVendorBill.label',
	// 	descriptionKey: 'home.quickActionsList.createVendorBill.description',
	// },
	// {
	// 	id: 'new-payment-request',
	// 	labelKey: 'home.quickActionsList.newPaymentRequest.label',
	// 	descriptionKey: 'home.quickActionsList.newPaymentRequest.description',
	// },
	// {
	// 	id: 'new-asset-category',
	// 	labelKey: 'home.quickActionsList.newAssetCategory.label',
	// 	descriptionKey: 'home.quickActionsList.newAssetCategory.description',
	// },
	// {
	// 	id: 'register-new-asset',
	// 	labelKey: 'home.quickActionsList.registerNewAsset.label',
	// 	descriptionKey: 'home.quickActionsList.registerNewAsset.description',
	// },
];

export const getQuickActionById = id => QUICK_ACTIONS.find(action => action.id === id);
