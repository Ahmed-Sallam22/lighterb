import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Card from '../shared/Card';
import FloatingLabelInput from '../shared/FloatingLabelInput';
import FloatingLabelSelect from '../shared/FloatingLabelSelect';
import { fetchCurrencies } from '../../store/currenciesSlice';
import { fetchSuppliers } from '../../store/suppliersSlice';
import { createAPPayment, updateAPPayment } from '../../store/apPaymentsSlice';

const BASE_URL = 'https://lightidea.org:8007/api';

const bankAccounts = [
  { value: 1, label: 'Main Account - AED' },
  { value: 2, label: 'USD Account' },
  { value: 3, label: 'EUR Account' },
];

const paymentMethods = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHECK', label: 'Check' },
  { value: 'CASH', label: 'Cash' },
  { value: 'WIRE', label: 'Wire Transfer' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
];

const MakePaymentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { currencies } = useSelector((state) => state.currencies);
  const { suppliers } = useSelector((state) => state.suppliers);
  const { loading } = useSelector((state) => state.apPayments);

  // Check if we're in edit mode
  const editPayment = location.state?.payment;
  const paymentId = location.state?.paymentId;
  const isEditMode = !!editPayment;

  const [paymentForm, setPaymentForm] = useState({
    supplier: '',
    number: '',
    date: '',
    amount: '',
    currency: '',
    bankAccount: '',
    payment_method: 'BANK_TRANSFER',
    reference: '',
    memo: '',
  });
  const [allocations, setAllocations] = useState([]);
  const [outstandingBills, setOutstandingBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billsError, setBillsError] = useState(null);

  // Fetch currencies and suppliers on mount
  useEffect(() => {
    dispatch(fetchCurrencies());
    dispatch(fetchSuppliers());
  }, [dispatch]);

  // Pre-fill form if in edit mode
  useEffect(() => {
    if (editPayment) {
      setPaymentForm({
        supplier: editPayment.supplier || '',
        number: editPayment.number || '',
        date: editPayment.date || '',
        amount: editPayment.amount || '',
        currency: editPayment.currency || '',
        bankAccount: editPayment.bank_account || '',
        payment_method: editPayment.payment_method || 'BANK_TRANSFER',
        reference: editPayment.reference || '',
        memo: editPayment.memo || '',
      });

      // Pre-fill allocations if they exist
      if (editPayment.allocations && Array.isArray(editPayment.allocations)) {
        setAllocations(editPayment.allocations);
      }
    }
  }, [editPayment]);

  // Fetch outstanding bills when supplier changes
  useEffect(() => {
    const fetchOutstandingBills = async () => {
      if (!paymentForm.supplier) {
        setOutstandingBills([]);
        setBillsError(null);
        setBillsLoading(false);
        return;
      }

      setBillsLoading(true);
      setBillsError(null);

      try {
        const response = await axios.get(`${BASE_URL}/outstanding-invoices/`, {
          params: { supplier: paymentForm.supplier },
        });

        const billsData = Array.isArray(response.data)
          ? response.data
          : response.data?.results || response.data?.data || [];

        setOutstandingBills(billsData);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.detail ||
          error.message ||
          'Failed to load outstanding bills';
        setBillsError(errorMessage);
      } finally {
        setBillsLoading(false);
      }
    };

    fetchOutstandingBills();
  }, [paymentForm.supplier]);

  // Currency options from Redux
  const currencyOptions = currencies.map((currency) => ({
    value: currency.id,
    label: `${currency.code} - ${currency.name}`,
  }));

  // Supplier options from Redux
  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.id,
    label: supplier.name || `Supplier ${supplier.id}`,
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

  const handleToggleAllocation = (bill) => {
    setAllocations((prev) => {
      const existing = prev.find((a) => a.invoice === bill.id);
      if (existing) {
        // Remove allocation
        return prev.filter((a) => a.invoice !== bill.id);
      } else {
        // Add allocation with outstanding amount
        return [
          ...prev,
          {
            invoice: bill.id,
            amount: parseFloat(bill.outstanding).toFixed(2),
            memo: `Payment for Invoice ${bill.number || bill.id}`,
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

  const handleMakePayment = async () => {
    // Validate required fields
    if (!paymentForm.supplier || !paymentForm.date || !paymentForm.amount || !paymentForm.currency) {
      toast.error('Please fill all required fields');
      return;
    }

    // Prepare payment data according to API structure
    const paymentData = {
      supplier: parseInt(paymentForm.supplier),
      number: paymentForm.number || undefined,
      date: paymentForm.date,
      amount: parseFloat(paymentForm.amount).toFixed(2),
      currency: parseInt(paymentForm.currency),
      bank_account: paymentForm.bankAccount ? parseInt(paymentForm.bankAccount) : undefined,
      payment_method: paymentForm.payment_method || 'BANK_TRANSFER',
      reference: paymentForm.reference || '',
      memo: paymentForm.memo || '',
      allocations: allocations.length > 0 ? allocations : undefined,
    };

    try {
      if (isEditMode && paymentId) {
        await dispatch(updateAPPayment({ id: paymentId, data: paymentData })).unwrap();
        toast.success('AP Payment updated successfully');
      } else {
        await dispatch(createAPPayment(paymentData)).unwrap();
        toast.success('AP Payment created successfully');
      }
      navigate(-1);
    } catch (error) {
      toast.error(error || `Failed to ${isEditMode ? 'update' : 'create'} payment`);
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
            label="Supplier"
            name="supplier"
            value={paymentForm.supplier}
            onChange={handleChange}
            options={supplierOptions}
            required
            placeholder="Select supplier"
          />

          <FloatingLabelInput
            label="Payment Number"
            name="number"
            type="text"
            value={paymentForm.number}
            onChange={handleChange}
            placeholder="e.g., AP-PAY-2025-001 (auto-generated if empty)"
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
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            value={paymentForm.amount}
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

          <FloatingLabelSelect
            label="Payment Method"
            name="payment_method"
            value={paymentForm.payment_method}
            onChange={handleChange}
            options={paymentMethods}
            required
            placeholder="Select payment method"
          />

          <FloatingLabelInput
            label="Reference"
            name="reference"
            type="text"
            value={paymentForm.reference}
            onChange={handleChange}
            placeholder="e.g., TRF-20251119-ABC123"
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

      {/* Outstanding Bills */}
      <Card 
        title="Invoice Allocations"
        subtitle={paymentForm.supplier ? 'Outstanding bills for selected supplier' : 'Select a supplier first'}
      >
        {!paymentForm.supplier ? (
          <div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
            <p className="text-lg font-semibold mb-2">Select a supplier to view outstanding bills</p>
            <p className="text-sm mb-6">You can allocate this payment to specific bills after selecting a supplier.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e1edf5] bg-[#f5f8fb] p-4">
            {billsLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-[#567086]">
                <div className="h-10 w-10 border-4 border-[#b6c4cc] border-t-[#0d5f7a] rounded-full animate-spin mb-3"></div>
                <span>Loading outstanding bills...</span>
              </div>
            ) : billsError ? (
              <div className="text-center text-red-600 py-6">{billsError}</div>
            ) : outstandingBills.length === 0 ? (
              <div className="text-center text-[#567086] py-6">
                No outstanding bills for this supplier.
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
                              // Select all bills
                              const allAllocations = outstandingBills.map((bill) => ({
                                invoice: bill.id,
                                amount: parseFloat(bill.outstanding).toFixed(2),
                                memo: `Payment for Invoice ${bill.number || bill.id}`,
                              }));
                              setAllocations(allAllocations);
                            } else {
                              // Deselect all
                              setAllocations([]);
                            }
                          }}
                          checked={allocations.length === outstandingBills.length && outstandingBills.length > 0}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">Bill #</th>
                      <th className="px-4 py-3 text-left">Bill Date</th>
                      <th className="px-4 py-3 text-left">Due Date</th>
                      <th className="px-4 py-3 text-left">Currency</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Outstanding</th>
                      <th className="px-4 py-3 text-right">Allocate Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {outstandingBills.map((bill) => (
                      <tr 
                        key={bill.id} 
                        className={`transition-colors ${
                          isAllocated(bill.id) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-[#f8fbff]'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={isAllocated(bill.id)}
                            onChange={() => handleToggleAllocation(bill)}
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#0d5f7a]">{bill.number || '-'}</td>
                        <td className="px-4 py-3">{formatDate(bill.date)}</td>
                        <td className="px-4 py-3">{formatDate(bill.due_date)}</td>
                        <td className="px-4 py-3">{bill.currency || '-'}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(bill.total)}</td>
                        <td className="px-4 py-3 text-right text-green-700">{formatCurrency(bill.paid)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#b45309]">
                          {formatCurrency(bill.outstanding)}
                        </td>
                        <td className="px-4 py-3">
                          {isAllocated(bill.id) ? (
                            <input
                              type="number"
                              step="0.01"
                              className="w-28 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-[#0d5f7a]"
                              value={getAllocatedAmount(bill.id)}
                              onChange={(e) => handleAllocationChange(bill.id, 'amount', e.target.value)}
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
                    {paymentForm.amount && (
                      <tr>
                        <td colSpan="8" className="px-4 py-3 text-right font-semibold text-gray-700">
                          Payment Amount:
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-700">
                          {formatCurrency(paymentForm.amount)}
                        </td>
                      </tr>
                    )}
                    {paymentForm.amount && getTotalAllocated() > 0 && (
                      <tr>
                        <td colSpan="8" className="px-4 py-3 text-right font-semibold text-gray-700">
                          {getTotalAllocated() > parseFloat(paymentForm.amount || 0) ? 'Over-allocated:' : 'Unallocated:'}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${
                          getTotalAllocated() > parseFloat(paymentForm.amount || 0) ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {formatCurrency(Math.abs(parseFloat(paymentForm.amount || 0) - getTotalAllocated()))}
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
          onClick={handleMakePayment}
          disabled={loading}
          className="px-8 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : isEditMode ? 'Update Payment' : 'Make Payment'}
        </button>
      </div>
    </div>
  );
};

export default MakePaymentForm;
