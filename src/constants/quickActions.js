export const QUICK_ACTIONS = [
  { id: 'create-ar-invoice', label: 'Create AR Invoice', description: 'Generate a customer AR invoice with required billing details.' },
  { id: 'create-ap-invoice', label: 'Create AP Invoice', description: 'Capture supplier invoices and schedule payments.' },
  { id: 'receive-payment', label: 'Receive Payment', description: 'Record incoming customer payments and allocations.' },
  { id: 'make-payment', label: 'Make Payment', description: 'Disburse supplier or expense payments securely.' },
  { id: 'create-vendor-bill', label: 'Create Vendor Bill', description: 'Enter vendor bills for approval and posting.' },
  { id: 'new-payment-request', label: 'New Payment Request', description: 'Initiate a payment request for internal review.' },
  { id: 'new-asset-category', label: 'New Asset Category', description: 'Define and classify a new fixed asset group.' },
  { id: 'register-new-asset', label: 'Register New Asset', description: 'Add an asset record with cost and depreciation info.' },
];

export const getQuickActionById = (id) =>
  QUICK_ACTIONS.find((action) => action.id === id);
