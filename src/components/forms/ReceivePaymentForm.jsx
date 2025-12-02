import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Card from '../shared/Card';
import FloatingLabelInput from '../shared/FloatingLabelInput';
import FloatingLabelSelect from '../shared/FloatingLabelSelect';
import { fetchCurrencies } from '../../store/currenciesSlice';
import { fetchCustomers } from '../../store/customersSlice';
import { createARPayment, updateARPayment } from '../../store/arPaymentsSlice';

const BASE_URL = 'https://lightidea.org:8007/api';

const bankAccounts = [
  { value: 1, label: 'Main Account - AED' },
  { value: 2, label: 'USD Account' },
  { value: 3, label: 'EUR Account' },
];

const ReceivePaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currencies } = useSelector((state) => state.currencies);
  const { customers } = useSelector((state) => state.customers);
  const { loading } = useSelector((state) => state.arPayments);

  // Check if we're in edit mode
  const editPayment = location.state?.payment;
  const paymentId = location.state?.paymentId;
  const isEditMode = !!editPayment;

  const [paymentForm, setPaymentForm] = useState({
    customer: '',
    reference: '',
    date: '',
    total_amount: '',
    currency: '',
    bankAccount: '',
    memo: '',
  });
  const [allocations, setAllocations] = useState([]);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);

  // Fetch currencies and customers on mount
  useEffect(() => {
    dispatch(fetchCurrencies());
    dispatch(fetchCustomers());
  }, [dispatch]);

  // Pre-fill form if in edit mode
  useEffect(() => {
    if (editPayment) {
      setPaymentForm({
        customer: editPayment.customer || '',
        reference: editPayment.reference || '',
        date: editPayment.date || '',
        total_amount: editPayment.total_amount || '',
        currency: editPayment.currency || '',
        bankAccount: editPayment.bank_account || '',
        memo: editPayment.memo || '',
      });

      // Pre-fill allocations if they exist
      if (editPayment.allocations && Array.isArray(editPayment.allocations)) {
        setAllocations(editPayment.allocations);
      }
    }
  }, [editPayment]);

  // Fetch outstanding invoices when customer changes
  useEffect(() => {
    const fetchOutstandingInvoices = async () => {
      if (!paymentForm.customer) {
        setOutstandingInvoices([]);
        setInvoicesError(null);
        setInvoicesLoading(false);
        return;
      }

      setInvoicesLoading(true);
      setInvoicesError(null);

      try {
        const response = await axios.get(`${BASE_URL}/outstanding-invoices/`, {
          params: { customer: paymentForm.customer },
        });

        const invoicesData = Array.isArray(response.data)
          ? response.data
          : response.data?.results || response.data?.data || [];

        setOutstandingInvoices(invoicesData);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to load outstanding invoices';
        setInvoicesError(errorMessage);
      } finally {
        setInvoicesLoading(false);
      }
    };

    fetchOutstandingInvoices();
  }, [paymentForm.customer]);

  // Currency options from Redux
  const currencyOptions = currencies.map((currency) => ({
    value: currency.id,
    label: `${currency.code} - ${currency.name}`,
  }));

  // Customer options from Redux
  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name || `Customer ${customer.id}`,
  }));
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAllocationChange = (invoiceId, field, value) => {
    setAllocations((prev) => {
      const existing = prev.find((a) => a.invoice === invoiceId);
      if (existing) {
        return prev.map((a) =>
          a.invoice === invoiceId ? { ...a, [field]: value } : a
        );
      } else {
        return [...prev, { invoice: invoiceId, [field]: value }];
      }
    });
  };

  const handleToggleAllocation = (invoice) => {
    setAllocations((prev) => {
      const existing = prev.find((a) => a.invoice === invoice.id);
      if (existing) {
        // Remove allocation
        return prev.filter((a) => a.invoice !== invoice.id);
      } else {
        // Add allocation with outstanding amount
        return [
          ...prev,
          {
            invoice: invoice.id,
            amount: parseFloat(invoice.outstanding).toFixed(2),
            memo: `Payment for Invoice ${invoice.number || invoice.id}`,
          },
        ];
      }
    });
  };

  const isAllocated = (invoiceId) => {
    return allocations.some((a) => a.invoice === invoiceId);
  };

  const getAllocatedAmount = (invoiceId) => {
    const allocation = allocations.find((a) => a.invoice === invoiceId);
    return allocation?.amount || '';
  };

  const getTotalAllocated = () => {
    return allocations.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleReceivePayment = async () => {
    // Validate required fields
    if (!paymentForm.customer || !paymentForm.date || !paymentForm.total_amount || !paymentForm.currency) {
      toast.error('Please fill all required fields');
      return;
    }

    // Prepare payment data according to API structure
    const paymentData = {
      customer: parseInt(paymentForm.customer),
      reference: paymentForm.reference || undefined,
      date: paymentForm.date,
      total_amount: parseFloat(paymentForm.total_amount).toFixed(2),
      currency: parseInt(paymentForm.currency),
      bank_account: paymentForm.bankAccount ? parseInt(paymentForm.bankAccount) : undefined,
      memo: paymentForm.memo || '',
      allocations: allocations.length > 0 ? allocations : undefined,
    };

    try {
      if (isEditMode && paymentId) {
        await dispatch(updateARPayment({ id: paymentId, data: paymentData })).unwrap();
        toast.success('AR Payment updated successfully');
      } else {
        await dispatch(createARPayment(paymentData)).unwrap();
        toast.success('AR Payment received successfully');
      }
      navigate(-1);
    } catch (error) {
      toast.error(error || `Failed to ${isEditMode ? 'update' : 'receive'} payment`);
    }
  };

  const formatCurrency = (value) => {
    const numericValue = Number(value ?? 0);
    if (Number.isNaN(numericValue)) {
      return '0.00';
    }
    return numericValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto mt-5 pb-10 space-y-5">
      {/* Payment Details */}
      <Card title="Payment Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FloatingLabelSelect
            label="Customer"
            name="customer"
            value={paymentForm.customer}
            onChange={handleChange}
            options={customerOptions}
            required
            placeholder="Select customer"
          />

          <FloatingLabelInput
            label="Payment Reference"
            name="reference"
            type="text"
            value={paymentForm.reference}
            onChange={handleChange}
            placeholder="e.g., AR-PAY-2025-007 (auto-generated if empty)"
          />

          <FloatingLabelInput
            label="Payment Date"
            name="date"
            type="date"
            value={paymentForm.date}
            onChange={handleChange}
            required
            placeholder="dd/mm/yyyy"
          />

          <FloatingLabelInput
            label="Total Amount"
            name="total_amount"
            type="number"
            step="0.01"
            value={paymentForm.total_amount}
            onChange={handleChange}
            required
            placeholder="0.00"
          />

          <FloatingLabelSelect
            label="Currency"
            name="currency"
            value={paymentForm.currency}
            onChange={handleChange}
            options={currencyOptions}
            required
            placeholder="Select Currency"
          />

          <FloatingLabelSelect
            label="Bank Account"
            name="bankAccount"
            value={paymentForm.bankAccount}
            onChange={handleChange}
            options={bankAccounts}
            
            placeholder="Select bank account"
          />

          <div className="sm:col-span-2">
            <FloatingLabelInput
              label="Memo"
              name="memo"
              type="text"
              value={paymentForm.memo}
              onChange={handleChange}
              placeholder="Payment notes or description"
            />
          </div>
        </div>
      </Card>

      {/* Outstanding Invoices */}
      <Card 
        title="Invoice Allocations"
        subtitle={paymentForm.customer ? 'Outstanding invoices for selected customer' : 'Select a customer first'}
      >
        {!paymentForm.customer ? (
          <div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
            <p className="text-lg font-semibold mb-2">Select a customer to view outstanding invoices</p>
            <p className="text-sm mb-6">You can allocate this payment to specific invoices once they load.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e1edf5] bg-[#f5f8fb] p-4">
            {invoicesLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#567086]">
                <div className="h-10 w-10 border-4 border-[#b6c4cc] border-t-[#0d5f7a] rounded-full animate-spin mb-3"></div>
                <span>Loading outstanding invoices...</span>
              </div>
            ) : invoicesError ? (
              <div className="text-center text-red-600 py-6">{invoicesError}</div>
            ) : outstandingInvoices.length === 0 ? (
              <div className="text-center text-[#567086] py-6">
                No outstanding invoices for this customer.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-[#d7e3ec] bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-[#f5f8fb] text-xs font-semibold uppercase tracking-wide text-[#567086]">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Select all invoices
                              const allAllocations = outstandingInvoices.map((invoice) => ({
                                invoice: invoice.id,
                                amount: parseFloat(invoice.outstanding).toFixed(2),
                                memo: `Payment for Invoice ${invoice.number || invoice.id}`,
                              }));
                              setAllocations(allAllocations);
                            } else {
                              // Deselect all
                              setAllocations([]);
                            }
                          }}
                          checked={allocations.length === outstandingInvoices.length && outstandingInvoices.length > 0}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">Invoice #</th>
                      <th className="px-4 py-3 text-left">Invoice Date</th>
                      <th className="px-4 py-3 text-left">Due Date</th>
                      <th className="px-4 py-3 text-left">Currency</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Outstanding</th>
                      <th className="px-4 py-3 text-right">Allocate Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {outstandingInvoices.map((invoice) => (
                      <tr 
                        key={invoice.id} 
                        className={`transition-colors ${
                          isAllocated(invoice.id) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-[#f8fbff]'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={isAllocated(invoice.id)}
                            onChange={() => handleToggleAllocation(invoice)}
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#0d5f7a]">{invoice.number || '-'}</td>
                        <td className="px-4 py-3">{formatDate(invoice.date)}</td>
                        <td className="px-4 py-3">{formatDate(invoice.due_date)}</td>
                        <td className="px-4 py-3">{invoice.currency || '-'}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(invoice.total)}</td>
                        <td className="px-4 py-3 text-right text-green-700">{formatCurrency(invoice.paid)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#b45309]">
                          {formatCurrency(invoice.outstanding)}
                        </td>
                        <td className="px-4 py-3">
                          {isAllocated(invoice.id) ? (
                            <input
                              type="number"
                              step="0.01"
                              className="w-28 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-[#0d5f7a]"
                              value={getAllocatedAmount(invoice.id)}
                              onChange={(e) => handleAllocationChange(invoice.id, 'amount', e.target.value)}
                              placeholder="0.00"
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="8" className="px-4 py-3 text-right font-semibold text-gray-700">
                        Total Allocated:
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#0d5f7a]">
                        {formatCurrency(getTotalAllocated())}
                      </td>
                    </tr>
                    {paymentForm.total_amount && (
                      <tr>
                        <td colSpan="8" className="px-4 py-3 text-right font-semibold text-gray-700">
                          Payment Amount:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-700">
                          {formatCurrency(paymentForm.total_amount)}
                        </td>
                      </tr>
                    )}
                    {paymentForm.total_amount && getTotalAllocated() > 0 && (
                      <tr>
                        <td colSpan="8" className="px-4 py-3 text-right font-semibold text-gray-700">
                          {getTotalAllocated() > parseFloat(paymentForm.total_amount || 0) ? 'Over-allocated:' : 'Unallocated (Advance):'}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${
                          getTotalAllocated() > parseFloat(paymentForm.total_amount || 0) ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(Math.abs(parseFloat(paymentForm.total_amount || 0) - getTotalAllocated()))}
                        </td>
                      </tr>
                    )}
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

       {/* <Card
        title="GL Distribution Lines"
        subtitle="Posting"
        actionSlot={
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#48C1F0] text-[#48C1F0] text-sm font-semibold hover:bg-[#48C1F0]/10 transition-colors"
          >
            + New Line
          </button>
        }
      >
        <div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
          <p className="text-lg font-semibold mb-2">No GL distribution lines added yet</p>
          <p className="text-sm mb-6">GL distribution lines are required to post this invoice.</p>
          <button
            type="button"
            className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
          >
            + New First Line
          </button>
        </div>
      </Card> */}
      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 rounded-full border border-[#7A9098] text-[#7A9098] font-semibold hover:bg-[#f1f5f8] transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleReceivePayment}
          disabled={loading}
          className="px-8 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : isEditMode ? 'Update Payment' : 'Record Payment'}
        </button>
      </div>
    </div>
  );
};

export default ReceivePaymentForm;
