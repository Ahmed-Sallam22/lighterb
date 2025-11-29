import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import PageHeader from '../components/shared/PageHeader';
import Table from '../components/shared/Table';
import SlideUpModal from '../components/shared/SlideUpModal';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import ConfirmModal from '../components/shared/ConfirmModal';
import {
  fetchExchangeRates,
  fetchCurrencies,
  createExchangeRate,
  updateExchangeRate,
  deleteExchangeRate,
  convertCurrency,
  clearConversionResult,
} from '../store/exchangeRatesSlice';

const ExchangeRatesPage = () => {
  const dispatch = useDispatch();
  const { rates, currencies, loading, error, conversionResult } = useSelector((state) => state.exchangeRates);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);
  
  const [formData, setFormData] = useState({
    fromCurrency: '',
    toCurrency: '',
    rateType: 'SPOT',
    rate: '',
    effectiveDate: '',
    source: '',
  });
  const [errors, setErrors] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    fromCurrency: '',
    toCurrency: '',
    rateType: '',
    dateFrom: '',
    dateTo: '',
  });

  // Converter states
  const [converterData, setConverterData] = useState({
    amount: '',
    fromCurrency: '',
    toCurrency: '',
    rateDate: new Date().toISOString().split('T')[0],
  });
  const [converterErrors, setConverterErrors] = useState({});

  // Fetch rates and currencies on mount
  useEffect(() => {
    dispatch(fetchExchangeRates());
    dispatch(fetchCurrencies());
  }, [dispatch]);

  // Display error toast
  useEffect(() => {
    if (error) {
      toast.error(error, { autoClose: 5000 });
    }
  }, [error]);

  // Transform API data for table display
  const exchangeRates = rates.map((rate) => ({
    id: rate.id,
    fromCurrency: rate.from_currency?.code || rate.from_currency_code || '-',
    toCurrency: rate.to_currency?.code || rate.to_currency_code || '-',
    rateType: rate.rate_type || '-',
    rate: rate.rate || '-',
    effectiveDate: rate.rate_date || '-',
    source: rate.source || '-',
    status: 'Active',
    rawData: rate,
  }));

  // Table columns
  const columns = [
    {
      header: 'From Currency',
      accessor: 'fromCurrency',
    
    },
    {
      header: 'To Currency',
      accessor: 'toCurrency',
    
    },
    {
      header: 'Rate Type',
      accessor: 'rateType',
      
      render: (value) => (
        <span className="font-semibold text-[#28819C]">{value}</span>
      ),
    },
    {
      header: 'Exchange Rate',
      accessor: 'rate',

    },
    {
      header: 'Effective Date',
      accessor: 'effectiveDate',

    },
    {
      header: 'Source',
      accessor: 'source',
    },
    {
      header: 'Status',
      accessor: 'status',
      
      render: (value) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            value === 'Active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  // Currency options from Redux
  const currencyCodeOptions = currencies.map((currency) => ({
    value: currency.code,
    label: `${currency.code} - ${currency.name}`,
  }));

  const currencyIdOptions = currencies
    .filter((currency) => currency.id !== undefined && currency.id !== null)
    .map((currency) => ({
      value: currency.id.toString(),
      label: `${currency.code} - ${currency.name}`,
    }));

  // Rate type options
  const rateTypeOptions = [
    { value: 'SPOT', label: 'Spot' },
    { value: 'CORPORATE', label: 'Corporate' },
    { value: 'USER', label: 'User' },
    { value: 'AVERAGE', label: 'Average' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    const filterParams = {
      from_currency: filters.fromCurrency,
      to_currency: filters.toCurrency,
      rate_type: filters.rateType,
      date_from: filters.dateFrom,
      date_to: filters.dateTo,
    };
    dispatch(fetchExchangeRates(filterParams));
    toast.info('Filters applied');
  };

  const handleClearFilters = () => {
    setFilters({
      fromCurrency: '',
      toCurrency: '',
      rateType: '',
      dateFrom: '',
      dateTo: '',
    });
    dispatch(fetchExchangeRates());
    toast.info('Filters cleared');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromCurrency) {
      newErrors.fromCurrency = 'From currency is required';
    }

    if (!formData.toCurrency) {
      newErrors.toCurrency = 'To currency is required';
    }

    if (formData.fromCurrency === formData.toCurrency) {
      newErrors.toCurrency = 'To currency must be different from From currency';
    }

    if (!formData.rateType) {
      newErrors.rateType = 'Rate type is required';
    }

    if (!formData.rate.trim()) {
      newErrors.rate = 'Exchange rate is required';
    } else if (isNaN(formData.rate) || parseFloat(formData.rate) <= 0) {
      newErrors.rate = 'Exchange rate must be a positive number';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExchangeRate = async () => {
    if (!validateForm()) return;

    try {
      const rateData = {
        from_currency: parseInt(formData.fromCurrency, 10),
        to_currency: parseInt(formData.toCurrency, 10),
        rate: parseFloat(formData.rate),
        rate_date: formData.effectiveDate,
        rate_type: formData.rateType || 'SPOT',
        source: formData.source,
      };

      if (Number.isNaN(rateData.from_currency) || Number.isNaN(rateData.to_currency)) {
        toast.error('Invalid currency selection');
        return;
      }

      if (isEditMode && selectedRate) {
        await dispatch(updateExchangeRate({ id: selectedRate.id, rateData })).unwrap();
        toast.success('Exchange rate updated successfully');
      } else {
        await dispatch(createExchangeRate(rateData)).unwrap();
        toast.success('Exchange rate created successfully');
      }
      
      handleCloseModal();
      dispatch(fetchExchangeRates());
    } catch (error) {
      console.error('Failed to save exchange rate:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedRate(null);
    setFormData({
      fromCurrency: '',
      toCurrency: '',
      rateType: 'SPOT',
      rate: '',
      effectiveDate: '',
      source: '',
    });
    setErrors({});
  };

  const handleEdit = (row) => {
    const rate = row.rawData || row;
    setSelectedRate(rate);
    setIsEditMode(true);
    setFormData({
      fromCurrency: rate.from_currency?.id?.toString()
        || rate.from_currency?.toString()
        || rate.from_currency
        || '',
      toCurrency: rate.to_currency?.id?.toString()
        || rate.to_currency?.toString()
        || rate.to_currency
        || '',
      rateType: rate.rate_type || 'SPOT',
      rate: rate.rate || '',
      effectiveDate: rate.rate_date || '',
      source: rate.source || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    const rate = row.rawData || row;
    setSelectedRate(rate);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteExchangeRate(selectedRate.id)).unwrap();
      toast.success('Exchange rate deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedRate(null);
    } catch (error) {
      // Error is already handled in Redux
      console.error('Failed to delete exchange rate:', error);
    }
  };

  // Converter handlers
  const validateConverter = () => {
    const newErrors = {};

    if (!converterData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(converterData.amount) || parseFloat(converterData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!converterData.fromCurrency) {
      newErrors.fromCurrency = 'From currency is required';
    }

    if (!converterData.toCurrency) {
      newErrors.toCurrency = 'To currency is required';
    }

    if (converterData.fromCurrency === converterData.toCurrency) {
      newErrors.toCurrency = 'To currency must be different from From currency';
    }

    if (!converterData.rateDate) {
      newErrors.rateDate = 'Rate date is required';
    }

    setConverterErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConvert = async () => {
    if (!validateConverter()) return;

    try {
      const conversionData = {
        amount: converterData.amount,
        from_currency_code: converterData.fromCurrency,
        to_currency_code: converterData.toCurrency,
        rate_date: converterData.rateDate,
      };

      await dispatch(convertCurrency(conversionData)).unwrap();
      toast.success('Currency converted successfully');
      // Result will be shown in the converter modal via conversionResult state
    } catch (error) {
      // Error is already handled in Redux
      console.error('Failed to convert currency:', error);
    }
  };

  const handleCloseConverter = () => {
    setIsConverterOpen(false);
    setConverterData({
      amount: '',
      fromCurrency: '',
      toCurrency: '',
      rateDate: new Date().toISOString().split('T')[0],
    });
    setConverterErrors({});
    dispatch(clearConversionResult());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Exchange Rates"
        subtitle="Manage currency exchange rates"
        icon={
          <svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 0C6.49 0 0 6.49 0 14.5C0 22.51 6.49 29 14.5 29C22.51 29 29 22.51 29 14.5C29 6.49 22.51 0 14.5 0ZM14.5 26.5C7.87 26.5 2.5 21.13 2.5 14.5C2.5 7.87 7.87 2.5 14.5 2.5C21.13 2.5 26.5 7.87 26.5 14.5C26.5 21.13 21.13 26.5 14.5 26.5Z" fill="#28819C"/>
            <path d="M19 10L14.5 14.5L10 10M10 19L14.5 14.5L19 19" stroke="#28819C" strokeWidth="2"/>
          </svg>
        }
      />

      <div className="mx-auto px-6 py-8">
        {/* Header with Title and Buttons */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Exchange Rates</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setIsConverterOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#28819C] text-[#28819C] rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14 11L10 15L6 11H14ZM6 9L10 5L14 9H6Z" fill="#28819C"/>
              </svg>
              Currency Converter
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 11H11V15H9V11H5V9H9V5H11V9H15V11Z" fill="white"/>
              </svg>
              Add Exchange Rate
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="rounded-lg pt-3 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            {/* From Currency Filter */}
            <FloatingLabelSelect
              label="From Currency"
              name="filterFromCurrency"
              value={filters.fromCurrency}
              onChange={(e) => handleFilterChange('fromCurrency', e.target.value)}
              options={[{ value: '', label: 'All' }, ...currencyCodeOptions]}
            />

            {/* To Currency Filter */}
            <FloatingLabelSelect
              label="To Currency"
              name="filterToCurrency"
              value={filters.toCurrency}
              onChange={(e) => handleFilterChange('toCurrency', e.target.value)}
              options={[{ value: '', label: 'All' }, ...currencyCodeOptions]}
            />

            {/* Rate Type Filter */}
            <FloatingLabelSelect
              label="Rate Type"
              name="filterRateType"
              value={filters.rateType}
              onChange={(e) => handleFilterChange('rateType', e.target.value)}
              options={[{ value: '', label: 'All' }, ...rateTypeOptions]}
            />

            {/* Date From Filter */}
            <FloatingLabelInput
              label="Date From"
              name="filterDateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            {/* Date To Filter */}
            <FloatingLabelInput
              label="Date To"
              name="filterDateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Clear all
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2.5 bg-[#28819C] text-white rounded-lg hover:bg-[#206b82] font-medium transition-colors"
            >
              Apply filters
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#28819C]"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={exchangeRates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            editIcon="edit"
            emptyMessage="No exchange rates found"
          />
        )}
      </div>

      {/* Add/Edit Exchange Rate Modal */}
      <SlideUpModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditMode ? 'Edit Exchange Rate' : 'Add Exchange Rate'}
        maxWidth="550px"
      >
        <div className="space-y-6">
          {/* From Currency */}
          <FloatingLabelSelect
            label="From Currency"
            name="fromCurrency"
            value={formData.fromCurrency}
            onChange={(e) => handleInputChange('fromCurrency', e.target.value)}
            error={errors.fromCurrency}
            options={currencyIdOptions}
            required
          />

          {/* To Currency */}
          <FloatingLabelSelect
            label="To Currency"
            name="toCurrency"
            value={formData.toCurrency}
            onChange={(e) => handleInputChange('toCurrency', e.target.value)}
            error={errors.toCurrency}
            options={currencyIdOptions}
            required
          />

          {/* Rate Type */}
          <FloatingLabelSelect
            label="Rate Type"
            name="rateType"
            value={formData.rateType}
            onChange={(e) => handleInputChange('rateType', e.target.value)}
            error={errors.rateType}
            options={rateTypeOptions}
            required
          />

          {/* Exchange Rate */}
          <FloatingLabelInput
            label="Exchange Rate"
            name="rate"
            type="number"
            step="0.0001"
            value={formData.rate}
            onChange={(e) => handleInputChange('rate', e.target.value)}
            error={errors.rate}
            required
            placeholder="e.g., 3.6725"
          />

          {/* Effective Date */}
          <FloatingLabelInput
            label="Effective Date"
            name="effectiveDate"
            type="date"
            value={formData.effectiveDate}
            onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
            error={errors.effectiveDate}
            required
          />

          {/* Source */}
          <FloatingLabelInput
            label="Source"
            name="source"
            value={formData.source}
            onChange={(e) => handleInputChange('source', e.target.value)}
            error={errors.source}
            required
            placeholder="e.g., ECB Daily Rate"
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddExchangeRate}
              className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
            >
              {isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </SlideUpModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRate(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Exchange Rate"
        message={`Are you sure you want to delete this exchange rate? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Currency Converter Modal */}
      <SlideUpModal
        isOpen={isConverterOpen}
        onClose={handleCloseConverter}
        title="Currency Converter"
        maxWidth="550px"
      >
        <div className="space-y-6">
          {/* Amount */}
          <FloatingLabelInput
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            value={converterData.amount}
            onChange={(e) => setConverterData(prev => ({ ...prev, amount: e.target.value }))}
            error={converterErrors.amount}
            required
            placeholder="e.g., 100.00"
          />

          {/* From Currency */}
          <FloatingLabelSelect
            label="From Currency"
            name="fromCurrency"
            value={converterData.fromCurrency}
            onChange={(e) => {
              setConverterData(prev => ({ ...prev, fromCurrency: e.target.value }));
              if (converterErrors.fromCurrency) {
                setConverterErrors(prev => ({ ...prev, fromCurrency: '' }));
              }
            }}
            error={converterErrors.fromCurrency}
            options={currencyCodeOptions}
            required
          />

          {/* To Currency */}
          <FloatingLabelSelect
            label="To Currency"
            name="toCurrency"
            value={converterData.toCurrency}
            onChange={(e) => {
              setConverterData(prev => ({ ...prev, toCurrency: e.target.value }));
              if (converterErrors.toCurrency) {
                setConverterErrors(prev => ({ ...prev, toCurrency: '' }));
              }
            }}
            error={converterErrors.toCurrency}
            options={currencyCodeOptions}
            required
          />

          {/* Rate Date */}
          <FloatingLabelInput
            label="Rate Date"
            name="rateDate"
            type="date"
            value={converterData.rateDate}
            onChange={(e) => {
              setConverterData(prev => ({ ...prev, rateDate: e.target.value }));
              if (converterErrors.rateDate) {
                setConverterErrors(prev => ({ ...prev, rateDate: '' }));
              }
            }}
            error={converterErrors.rateDate}
            required
          />

          {/* Conversion Result */}
          {conversionResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 mb-2">Conversion Result:</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-green-900">
                  {converterData.amount} {converterData.fromCurrency} = {conversionResult.converted_amount} {converterData.toCurrency}
                </p>
                <p className="text-sm text-green-700">
                  Exchange Rate: {conversionResult.rate}
                </p>
                <p className="text-xs text-green-600">
                  Rate Date: {conversionResult.rate_date || converterData.rateDate}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCloseConverter}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Close
            </button>
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
            >
              Convert
            </button>
          </div>
        </div>
      </SlideUpModal>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default ExchangeRatesPage;
