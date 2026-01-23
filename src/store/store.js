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
import locationsReducer from "./locationsSlice";
import enterprisesReducer from "./enterprisesSlice";
import businessGroupsReducer from "./businessGroupsSlice";
import departmentsReducer from "./departmentsSlice";
import organizationsReducer from "./organizationsSlice";
import gradesReducer from "./gradesSlice";
import positionsReducer from "./positionsSlice";
import defaultCombinationsReducer from "./defaultCombinationsSlice";
import fiscalPeriodsReducer from "./fiscalPeriodsSlice";
import glPeriodsReducer from "./glPeriodsSlice";
import apPeriodsReducer from "./apPeriodsSlice";
import arPeriodsReducer from "./arPeriodsSlice";
import banksReducer from "./banksSlice";
import branchesReducer from "./branchesSlice";
import bankAccountsReducer from "./bankAccountsSlice";
import paymentTypesReducer from "./paymentTypesSlice";
import bankStatementsReducer from "./bankStatementsSlice";
import statementLinesReducer from "./statementLinesSlice";
import matchesReducer from "./matchesSlice";
import jobsReducer from "./jobsSlice";
import employeesReducer from "./employeesSlice";
import lookupsReducer from "./lookupsSlice";
import addressesReducer from "./addressesSlice";
import personTypesReducer from "./personTypesSlice";
import competenciesReducer from "./competenciesSlice";

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
		locations: locationsReducer,
		enterprises: enterprisesReducer,
		businessGroups: businessGroupsReducer,
		departments: departmentsReducer,
		organizations: organizationsReducer,
		grades: gradesReducer,
		positions: positionsReducer,
		defaultCombinations: defaultCombinationsReducer,
		fiscalPeriods: fiscalPeriodsReducer,
		glPeriods: glPeriodsReducer,
		apPeriods: apPeriodsReducer,
		arPeriods: arPeriodsReducer,
		banks: banksReducer,
		branches: branchesReducer,
		bankAccounts: bankAccountsReducer,
		paymentTypes: paymentTypesReducer,
		bankStatements: bankStatementsReducer,
		statementLines: statementLinesReducer,
		matches: matchesReducer,
		jobs: jobsReducer,
		employees: employeesReducer,
		lookups: lookupsReducer,
		addresses: addressesReducer,
		personTypes: personTypesReducer,
		competencies: competenciesReducer,
	},
});

export default store;
