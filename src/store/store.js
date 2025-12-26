import { configureStore } from "@reduxjs/toolkit";
import segmentsReducer from "./segmentsSlice";
import journalsReducer from "./journalsSlice";
import currenciesReducer from "./currenciesSlice";
import journalLinesReducer from "./journalLinesSlice";
import arInvoicesReducer from "./arInvoicesSlice";
import apInvoicesReducer from "./apInvoicesSlice";
import oneTimeSupplierInvoicesReducer from "./oneTimeSupplierInvoicesSlice";
import arPaymentsReducer from "./arPaymentsSlice";
import apPaymentsReducer from "./apPaymentsSlice";
import customersReducer from "./customersSlice";
import suppliersReducer from "./suppliersSlice";
import reportsReducer from "./reportsSlice";
import accountsReducer from "./accountsSlice";
import taxRatesReducer from "./taxRatesSlice";
import invoiceApprovalsReducer from "./invoiceApprovalsSlice";
import approvalStepsReducer from "./approvalStepsSlice";
import catalogItemsReducer from "./catalogItemsSlice";
import jobRolesReducer from "./jobRolesSlice";
import countriesReducer from "./countriesSlice";
import authReducer from "./authSlice";
import workflowTemplatesReducer from "./workflowTemplatesSlice";
import usersReducer from "./usersSlice";
import uomReducer from "./uomSlice";
import requisitionsReducer from "./requisitionsSlice";
import poReducer from "./poSlice";
import grnReducer from "./grnSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		segments: segmentsReducer,
		journals: journalsReducer,
		currencies: currenciesReducer,
		journalLines: journalLinesReducer,
		arInvoices: arInvoicesReducer,
		apInvoices: apInvoicesReducer,
		oneTimeSupplierInvoices: oneTimeSupplierInvoicesReducer,
		arPayments: arPaymentsReducer,
		apPayments: apPaymentsReducer,
		customers: customersReducer,
		suppliers: suppliersReducer,
		reports: reportsReducer,
		accounts: accountsReducer,
		taxRates: taxRatesReducer,
		invoiceApprovals: invoiceApprovalsReducer,
		approvalSteps: approvalStepsReducer,
		catalogItems: catalogItemsReducer,
		jobRoles: jobRolesReducer,
		countries: countriesReducer,
		workflowTemplates: workflowTemplatesReducer,
		users: usersReducer,
		uom: uomReducer,
		requisitions: requisitionsReducer,
		po: poReducer,
		grn: grnReducer,
	},
});

export default store;
