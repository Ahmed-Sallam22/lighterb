import { configureStore } from '@reduxjs/toolkit';
import segmentsReducer from './segmentsSlice';
import journalsReducer from './journalsSlice';
import currenciesReducer from './currenciesSlice';
import journalLinesReducer from './journalLinesSlice';
import exchangeRatesReducer from './exchangeRatesSlice';
import arInvoicesReducer from './arInvoicesSlice';
import apInvoicesReducer from './apInvoicesSlice';
import arPaymentsReducer from './arPaymentsSlice';
import apPaymentsReducer from './apPaymentsSlice';
import customersReducer from './customersSlice';
import suppliersReducer from './suppliersSlice';
import reportsReducer from './reportsSlice';
import accountsReducer from './accountsSlice';
import taxRatesReducer from './taxRatesSlice';
import invoiceApprovalsReducer from './invoiceApprovalsSlice';
import approvalStepsReducer from './approvalStepsSlice';
import catalogItemsReducer from './catalogItemsSlice';
import jobRolesReducer from './jobRolesSlice';

export const store = configureStore({
  reducer: {
    segments: segmentsReducer,
    journals: journalsReducer,
    currencies: currenciesReducer,
    journalLines: journalLinesReducer,
    exchangeRates: exchangeRatesReducer,
    arInvoices: arInvoicesReducer,
    apInvoices: apInvoicesReducer,
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
  },
});

export default store;
