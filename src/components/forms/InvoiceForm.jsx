import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Card from '../shared/Card';
import FloatingLabelInput from '../shared/FloatingLabelInput';
import FloatingLabelSelect from '../shared/FloatingLabelSelect';
import { createARInvoice } from '../../store/arInvoicesSlice';
import { createAPInvoice } from '../../store/apInvoicesSlice';
import { fetchCurrencies } from '../../store/currenciesSlice';
import { fetchCustomers } from '../../store/customersSlice';
import { fetchSuppliers } from '../../store/suppliersSlice';
import { fetchTaxRates } from '../../store/taxRatesSlice';
import { fetchSegmentTypes, fetchSegmentValues } from '../../store/segmentsSlice';

const countries = [
  { value: 'AE', label: 'United Arab Emirates (AE)' },
  { value: 'US', label: 'United States (US)' },
  { value: 'GB', label: 'United Kingdom (GB)' },
  { value: 'SA', label: 'Saudi Arabia (SA)' },
];

const paymentTermsOptions = [
  { value: 'NET30', label: 'Net 30 Days' },
  { value: 'NET60', label: 'Net 60 Days' },
  { value: 'NET90', label: 'Net 90 Days' },
  { value: 'IMMEDIATE', label: 'Immediate' },
  { value: 'COD', label: 'Cash on Delivery' },
];

const goodsReceiptOptions = [
  { value: 'manual', label: 'Manual Entry' },
  { value: 'gr-1219', label: 'GR-1219 • Warehouse A' },
  { value: 'gr-1411', label: 'GR-1411 • Abu Dhabi Port' },
];

const InvoiceForm = ({ isAPInvoice = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currencies } = useSelector((state) => state.currencies);
  const { customers } = useSelector((state) => state.customers);
  const { suppliers } = useSelector((state) => state.suppliers);
  const { taxRates } = useSelector((state) => state.taxRates);
  const { types: segmentTypes = [], values: segmentValues = [] } = useSelector((state) => state.segments);
  const { loading: invoiceLoading } = useSelector((state) => 
    isAPInvoice ? state.apInvoices : state.arInvoices
  );

  const [invoiceForm, setInvoiceForm] = useState({
    customer: '',
    supplier: '',
    number: '',
    date: '',
    due_date: '',
    currency: '',
    country: 'AE',
    memo: '',
    payment_terms: 'NET30',
    po_reference: '',
    vendor_invoice_number: '',
  });

  const [items, setItems] = useState([]);
  const [glLines, setGLLines] = useState([]);
  const [segmentFormState, setSegmentFormState] = useState({}); // Track segment form for each GL line

  const [goodsReceipt, setGoodsReceipt] = useState('');

  // Fetch required data on mount
  useEffect(() => {
    dispatch(fetchCurrencies());
    dispatch(fetchCustomers());
    dispatch(fetchSuppliers());
    dispatch(fetchTaxRates());
    if (!isAPInvoice) {
      dispatch(fetchSegmentTypes());
      dispatch(fetchSegmentValues());
    }
  }, [dispatch, isAPInvoice]);

  // Tax Rate options from Redux
  const taxRateOptions = (taxRates || []).map((tax) => ({
    value: tax.id,
    label: `${tax.name || 'Tax'} - ${tax.rate}% (${tax.country || 'N/A'})`,
    rate: tax.rate,
    country: tax.country,
    category: tax.category,
  }));

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

  // Supplier options from Redux
  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.id,
    label: supplier.name || `Supplier ${supplier.id}`,
  }));

  // Calculate invoice totals
  const invoiceSubtotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    return sum + (qty * price);
  }, 0);

  const invoiceTaxAmount = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    const rate = parseFloat(item.tax_rate) || 0;
    const itemSubtotal = qty * price;
    return sum + (itemSubtotal * (rate / 100));
  }, 0);

  const invoiceTotalAmount = invoiceSubtotal + invoiceTaxAmount;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED' }).format(value);

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unit_price: '0.00',
      tax_rate_id: '',  // Will store selected tax rate ID
      tax_rate: null,    // Will store actual rate value
      tax_country: '',
      tax_category: '',
    };
    setItems((prev) => [...prev, newItem]);
    toast.success('Item added');
  };

  const handleItemChange = (itemId, field, value) => {
    setItems((prev) => prev.map((item) => {
      if (item.id === itemId) {
        // If changing tax rate selection
        if (field === 'tax_rate_id') {
          const selectedTaxRate = taxRateOptions.find(tr => tr.value === parseInt(value));
          if (selectedTaxRate) {
            return {
              ...item,
              tax_rate_id: value,
              tax_rate: selectedTaxRate.rate,
              tax_country: selectedTaxRate.country || 'AE',
              tax_category: selectedTaxRate.category || 'STANDARD',
            };
          } else if (value === 'EXEMPT') {
            // Special case for tax exempt
            return {
              ...item,
              tax_rate_id: 'EXEMPT',
              tax_rate: null,
              tax_country: invoiceForm.country || 'AE',
              tax_category: 'EXEMPT',
            };
          }
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.success('Item removed');
  };

  const handleAddGLLine = () => {
    const newGLLine = {
      id: Date.now(),
      line_type: 'DEBIT',
      amount: '0.00',
      description: '',
      segments: [],
    };
    setGLLines((prev) => [...prev, newGLLine]);
  };

  const handleGLLineChange = (lineId, field, value) => {
    setGLLines((prev) => prev.map((line) => 
      line.id === lineId ? { ...line, [field]: value } : line
    ));
  };

  const handleSegmentFormChange = (lineId, field, value) => {
    const currentSegmentForm = segmentFormState[lineId] || { segment_type: '', segment: '' };
    
    const updatedForm = {
      ...currentSegmentForm,
      [field]: value,
      // Reset segment value when segment type changes
      ...(field === 'segment_type' ? { segment: '' } : {})
    };

    setSegmentFormState(prev => ({
      ...prev,
      [lineId]: updatedForm
    }));

    // Auto-add segment when both segment_type and segment are selected
    if (field === 'segment' && value && updatedForm.segment_type) {
      const segmentType = segmentTypes.find(st => st.segment_id === parseInt(updatedForm.segment_type));
      const segmentValue = segmentValues.find(sv => sv.id === parseInt(value));

      const newSegment = {
        id: Date.now(),
        segment_type: parseInt(updatedForm.segment_type),
        segment: parseInt(value),
        // Store display names for UI
        segment_type_name: segmentType?.segment_name || segmentType?.segment_type || `Type ${updatedForm.segment_type}`,
        segment_value_name: segmentValue?.alias || segmentValue?.name || `Value ${value}`,
      };

      setGLLines(prev => prev.map(line => {
        if (line.id === lineId) {
          return {
            ...line,
            segments: [...(line.segments || []), newSegment]
          };
        }
        return line;
      }));

      // Reset segment form for this line
      setSegmentFormState(prev => ({
        ...prev,
        [lineId]: { segment_type: '', segment: '' }
      }));

      toast.success('Segment added automatically');
    }
  };

  const handleRemoveSegmentFromLine = (lineId, segmentId) => {
    setGLLines(prev => prev.map(line => {
      if (line.id === lineId) {
        return {
          ...line,
          segments: line.segments.filter(seg => seg.id !== segmentId)
        };
      }
      return line;
    }));
    toast.success('Segment removed');
  };

  const handleRemoveGLLine = (lineId) => {
    setGLLines((prev) => prev.filter((line) => line.id !== lineId));
    toast.success('GL line removed');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async () => {
    // Validate required fields
    const entityField = isAPInvoice ? 'supplier' : 'customer';
    if (!invoiceForm[entityField] || !invoiceForm.date || !invoiceForm.due_date || 
        !invoiceForm.currency || !invoiceForm.country) {
      toast.error('Please fill all required fields');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // For AR invoices, validate GL lines
    if (!isAPInvoice) {
      if (glLines.length === 0) {
        toast.error('Please add at least one GL distribution line for AR invoices');
        return;
      }

      // Calculate GL lines totals
      const totalDebit = glLines
        .filter(line => line.line_type === 'DEBIT')
        .reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
      const totalCredit = glLines
        .filter(line => line.line_type === 'CREDIT')
        .reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);

      // Check if debits and credits are balanced
      if (Math.abs(totalDebit - totalCredit) >= 0.01) {
        toast.error('GL distribution lines are not balanced. Debits must equal Credits.');
        return;
      }

      // Validate that GL total matches invoice total
      const invoiceTotal = invoiceTotalAmount;
      const glTotal = totalDebit; // or totalCredit, they should be equal

      if (Math.abs(invoiceTotal - glTotal) >= 0.01) {
        toast.error(
          `Invoice total (${formatCurrency(invoiceTotal)}) must match GL distribution total (${formatCurrency(glTotal)})`
        );
        return;
      }
    }

    // Prepare items for API (remove temporary fields)
    const formattedItems = items.map(item => {
      const itemData = {
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price).toFixed(2),
      };

      // Handle tax fields for AR invoices
      if (!isAPInvoice) {
        if (item.tax_rate === null || item.tax_category === 'EXEMPT') {
          // Tax exempt case
          itemData.tax_rate = null;
        } else {
          itemData.tax_rate = item.tax_rate;
        }
        itemData.tax_country = item.tax_country || invoiceForm.country;
        itemData.tax_category = item.tax_category || 'STANDARD';
      } else {
        // For AP invoices, include tax_rate if present
        if (item.tax_rate !== null && item.tax_rate !== undefined) {
          itemData.tax_rate = item.tax_rate;
        }
      }

      return itemData;
    });

    // Prepare invoice data according to API structure
    const invoiceData = {
      [entityField]: parseInt(invoiceForm[entityField]),
      number: invoiceForm.number || undefined,
      date: invoiceForm.date,
      due_date: invoiceForm.due_date,
      currency: parseInt(invoiceForm.currency),
      country: invoiceForm.country,
      items: formattedItems,
    };

    // Add AP-specific fields
    if (isAPInvoice) {
      invoiceData.subtotal = invoiceSubtotal.toFixed(2);
      invoiceData.tax_amount = invoiceTaxAmount.toFixed(2);
      invoiceData.total_amount = invoiceTotalAmount.toFixed(2);
      invoiceData.memo = invoiceForm.memo || undefined;
      invoiceData.payment_terms = invoiceForm.payment_terms || undefined;
      invoiceData.po_reference = invoiceForm.po_reference || undefined;
      invoiceData.vendor_invoice_number = invoiceForm.vendor_invoice_number || undefined;
    } else {
      // Add AR-specific fields (GL lines)
      if (glLines.length > 0) {
        invoiceData.gl_lines = glLines.map(line => ({
          line_type: line.line_type,
          amount: parseFloat(line.amount).toFixed(2),
          description: line.description,
          segments: (line.segments || []).map(seg => ({
            segment_type: seg.segment_type,
            segment: seg.segment,
          })),
        }));
      }
    }

    try {
      if (isAPInvoice) {
        await dispatch(createAPInvoice(invoiceData)).unwrap();
        toast.success('AP Invoice created successfully');
      } else {
        await dispatch(createARInvoice(invoiceData)).unwrap();
        toast.success('AR Invoice created successfully');
      }
      navigate(-1);
    } catch (error) {
      toast.error(error || 'Failed to create invoice');
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-5 pb-10 space-y-5">
      {/* Goods Receipt Link (AP Invoice Only) */}
      {isAPInvoice && (
        <Card title="Link to Goods Receipt (Optional)" subtitle="Select Goods Receipt Needing Invoice">
          <div className="grid grid-cols-1 gap-6">
            <FloatingLabelSelect
              label="Goods Receipt"
              name="goodsReceipt"
              value={goodsReceipt}
              onChange={(e) => setGoodsReceipt(e.target.value)}
              options={goodsReceiptOptions}
              placeholder="Select goods receipt"
            />
            <p className="text-xs text-[#7A9098]">
              Found goods receipts needing invoices. Select one to auto-populate invoice details.
            </p>
          </div>
        </Card>
      )}

      {/* Invoice Details */}
      <Card title="Invoice Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FloatingLabelSelect
            label={isAPInvoice ? 'Supplier' : 'Customer'}
            name={isAPInvoice ? 'supplier' : 'customer'}
            value={isAPInvoice ? invoiceForm.supplier : invoiceForm.customer}
            onChange={handleInvoiceChange}
            options={isAPInvoice ? supplierOptions : customerOptions}
            required
            placeholder={`Select ${isAPInvoice ? 'supplier' : 'customer'}`}
          />

          <FloatingLabelInput
            label="Invoice Number"
            name="number"
            type="text"
            value={invoiceForm.number}
            onChange={handleInvoiceChange}
            placeholder={`e.g., ${isAPInvoice ? 'AP-INV-2025-001' : 'AR-INV-2025-001'} (auto-generated if empty)`}
          />

          <FloatingLabelInput
            label="Invoice Date"
            name="date"
            type="date"
            value={invoiceForm.date}
            onChange={handleInvoiceChange}
            required
            placeholder="dd/mm/yyyy"
          />

          <FloatingLabelInput
            label="Due Date"
            name="due_date"
            type="date"
            value={invoiceForm.due_date}
            onChange={handleInvoiceChange}
            required
            placeholder="dd/mm/yyyy"
          />

          <FloatingLabelSelect
            label="Currency"
            name="currency"
            value={invoiceForm.currency}
            onChange={handleInvoiceChange}
            options={currencyOptions}
            required
            placeholder="Select currency"
          />

          <FloatingLabelSelect
            label="Country"
            name="country"
            value={invoiceForm.country}
            onChange={handleInvoiceChange}
            options={countries}
            required
            placeholder="Select country"
          />

          {isAPInvoice && (
            <>
              <FloatingLabelSelect
                label="Payment Terms"
                name="payment_terms"
                value={invoiceForm.payment_terms}
                onChange={handleInvoiceChange}
                options={paymentTermsOptions}
                placeholder="Select payment terms"
              />

              <FloatingLabelInput
                label="PO Reference"
                name="po_reference"
                type="text"
                value={invoiceForm.po_reference}
                onChange={handleInvoiceChange}
                placeholder="e.g., PO-2025-456"
              />

              <FloatingLabelInput
                label="Vendor Invoice Number"
                name="vendor_invoice_number"
                type="text"
                value={invoiceForm.vendor_invoice_number}
                onChange={handleInvoiceChange}
                placeholder="e.g., VENDOR-INV-789"
              />

              <div className="sm:col-span-2">
                <FloatingLabelInput
                  label="Memo"
                  name="memo"
                  type="text"
                  value={invoiceForm.memo}
                  onChange={handleInvoiceChange}
                  placeholder="Invoice notes or description"
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Line Items */}
      <Card
        title="Line Items"
        subtitle={`${items.length} item${items.length !== 1 ? 's' : ''} added`}
        actionSlot={
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#48C1F0] text-[#48C1F0] text-sm font-semibold hover:bg-[#48C1F0]/10 transition-colors"
          >
            + New Item
          </button>
        }
      >
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
            <p className="text-lg font-semibold mb-2">No items added yet</p>
            <p className="text-sm mb-6">Add items to build your invoice.</p>
            <button
              type="button"
              onClick={handleAddItem}
              className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
            >
              + Add First Item
            </button>
          </div>
        ) : (
          <div className="">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Unit Price
                  </th>
                  {!isAPInvoice && (
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tax Rate
                    </th>
                  )}
           
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <FloatingLabelInput
                          label="Description"
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <FloatingLabelInput
                          label="Quantity"
                          type="number"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                          placeholder="1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <FloatingLabelInput
                          label="Unit Price"
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(item.id, 'unit_price', e.target.value)}
                          placeholder="0.00"
                        />
                      </td>
                      {!isAPInvoice && (
                        <td className="px-4 py-3">
                          <FloatingLabelSelect
                            label="Tax Rate"
                            value={item.tax_rate_id || ''}
                            onChange={(e) => handleItemChange(item.id, 'tax_rate_id', e.target.value)}
                            options={[
                              { value: '', label: 'Select Tax Rate' },
                              { value: 'EXEMPT', label: 'Tax Exempt (0%)' },
                              ...taxRateOptions
                            ]}
                          />
                        </td>
                      )}
                
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete item"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
          
            </table>
          </div>
        )}
      </Card>

      {/* GL Distribution Lines (AR Invoice Only) */}
      {!isAPInvoice && (
        <Card
          title="GL Distribution Lines"
          subtitle="Posting"
          actionSlot={
            <button
              type="button"
              onClick={handleAddGLLine}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#48C1F0] text-[#48C1F0] text-sm font-semibold hover:bg-[#48C1F0]/10 transition-colors"
            >
              + New Line
            </button>
          }
        >
          {glLines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#b6c4cc] bg-[#f5f8fb] p-6 text-center text-[#567086]">
              <p className="text-lg font-semibold mb-2">No GL distribution lines added yet</p>
              <p className="text-sm mb-6">GL distribution lines are required to post this AR invoice. Debits and credits must balance.</p>
              <button
                type="button"
                onClick={handleAddGLLine}
                className="px-4 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform"
              >
                + Add First Line
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Line Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Segments Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Segments Value
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {glLines.map((line) => (
                    <tr key={line.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <FloatingLabelSelect
                          label="Line Type"
                          value={line.line_type}
                          onChange={(e) => handleGLLineChange(line.id, 'line_type', e.target.value)}
                          options={[
                            { value: 'DEBIT', label: 'DEBIT' },
                            { value: 'CREDIT', label: 'CREDIT' }
                          ]}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <FloatingLabelInput
                          label="Description"
                          type="text"
                          value={line.description}
                          onChange={(e) => handleGLLineChange(line.id, 'description', e.target.value)}
                          placeholder="Line description"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <FloatingLabelInput
                          label="Amount"
                          type="number"
                          step="0.01"
                          value={line.amount}
                          onChange={(e) => handleGLLineChange(line.id, 'amount', e.target.value)}
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {/* Display existing segments */}
                          {line.segments && line.segments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {line.segments.map((segment) => (
                                <span
                                  key={segment.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 group relative"
                                >
                                  {segment.segment_type_name || segment.segment_type}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSegmentFromLine(line.id, segment.id)}
                                    className="ml-1 text-blue-600 hover:text-red-600"
                                    title="Remove segment"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <FloatingLabelSelect
                            label="Segment Type"
                            value={segmentFormState[line.id]?.segment_type || ''}
                            onChange={(e) => handleSegmentFormChange(line.id, 'segment_type', e.target.value)}
                            options={[
                              { value: '', label: 'Select Segment Type' },
                              ...(segmentTypes?.map((type) => ({
                                value: type.segment_id.toString(),
                                label: `${type.segment_name} (${type.segment_type})`
                              })) || [])
                            ]}
                          />
                          
                          <div className="text-xs text-gray-500 italic mt-1">
                            Auto-adds when both selected
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          {/* Display existing segment values */}
                          {line.segments && line.segments.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {line.segments.map((segment) => (
                                <span
                                  key={segment.id}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 group relative"
                                >
                                  {segment.segment_value_name || segment.alias || segment.name}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSegmentFromLine(line.id, segment.id)}
                                    className="ml-1 text-green-600 hover:text-red-600"
                                    title="Remove segment"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <FloatingLabelSelect
                            label="Segment Value"
                            value={segmentFormState[line.id]?.segment || ''}
                            onChange={(e) => handleSegmentFormChange(line.id, 'segment', e.target.value)}
                            disabled={!segmentFormState[line.id]?.segment_type}
                            options={[
                              { value: '', label: 'Select Segment Value' },
                              ...(segmentValues
                                ?.filter((value) => {
                                  const selectedTypeId = segmentFormState[line.id]?.segment_type;
                                  if (!selectedTypeId) return false;
                                  return value.segment_type === parseInt(selectedTypeId);
                                })
                                .map((value) => ({
                                  value: value.id.toString(),
                                  label: `${value.alias} (${value.code})`
                                })) || [])
                            ]}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveGLLine(line.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete line"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-300 bg-gray-50">
                  <tr className="font-semibold">
                    <td colSpan="2" className="px-4 py-3 text-right text-gray-700">Total Debits:</td>
                    <td className="px-4 py-3 text-right text-lg text-red-700">
                      {formatCurrency(
                        glLines
                          .filter(line => line.line_type === 'DEBIT')
                          .reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0)
                      )}
                    </td>
                    <td colSpan="3"></td>
                  </tr>
                  <tr className="font-semibold">
                    <td colSpan="2" className="px-4 py-3 text-right text-gray-700">Total Credits:</td>
                    <td className="px-4 py-3 text-right text-lg text-green-700">
                      {formatCurrency(
                        glLines
                          .filter(line => line.line_type === 'CREDIT')
                          .reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0)
                      )}
                    </td>
                    <td colSpan="3"></td>
                  </tr>
                  <tr className="font-semibold border-t-2 border-[#0d5f7a]">
                    <td colSpan="2" className="px-4 py-3 text-right text-[#0d5f7a] text-lg">Balance:</td>
                    <td colSpan="4" className="px-4 py-3">
                      {(() => {
                        const totalDebit = glLines.filter(line => line.line_type === 'DEBIT').reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
                        const totalCredit = glLines.filter(line => line.line_type === 'CREDIT').reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
                        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
                        return isBalanced ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Balanced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Not Balanced (Diff: {formatCurrency(Math.abs(totalDebit - totalCredit))})
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                  <tr className="font-semibold border-t border-gray-300">
                    <td colSpan="2" className="px-4 py-3 text-right text-gray-700">Invoice Total:</td>
                    <td className="px-4 py-3 text-right text-lg text-[#0d5f7a]">
                      {formatCurrency(invoiceTotalAmount)}
                    </td>
                    <td colSpan="3" className="px-4 py-3">
                      {(() => {
                        const totalDebit = glLines.filter(line => line.line_type === 'DEBIT').reduce((sum, line) => sum + (parseFloat(line.amount) || 0), 0);
                        const glTotal = totalDebit;
                        const isMatching = Math.abs(invoiceTotalAmount - glTotal) < 0.01;
                        return isMatching ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Matches GL Total
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-sm font-medium">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Mismatch (Diff: {formatCurrency(Math.abs(invoiceTotalAmount - glTotal))})
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      )}

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
          onClick={handleSubmit}
          disabled={invoiceLoading}
          className="px-8 py-2 rounded-full bg-[#0d5f7a] text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {invoiceLoading ? 'Creating...' : 'Create Invoice'}
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;
