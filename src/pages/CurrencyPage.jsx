import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageHeader from '../components/shared/PageHeader';
import Table from '../components/shared/Table';
import SlideUpModal from '../components/shared/SlideUpModal';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import ConfirmModal from '../components/shared/ConfirmModal';
import Toggle from '../components/shared/Toggle';
import {
  fetchCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
} from '../store/currenciesSlice';

const CurrencyPage = () => {
  const dispatch = useDispatch();
  const { currencies } = useSelector((state) => state.currencies);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    isBaseCurrency: false,
  });
  const [errors, setErrors] = useState({});

  // Fetch currencies on component mount
  useEffect(() => {
    dispatch(fetchCurrencies());
  }, [dispatch]);

  const handleToggleBaseCurrency = async (currency, newValue) => {
    const payload = {
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      is_base: newValue,
    };

    try {
      await dispatch(updateCurrency({ id: currency.id, data: payload })).unwrap();
      toast.success(
        newValue
          ? `${currency.code} marked as base currency`
          : `${currency.code} unset as base currency`
      );
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Failed to update base currency';

      if (err && typeof err === 'object' && !err.message && !err.error) {
        const errorMessages = [];
        Object.keys(err).forEach((key) => {
          if (Array.isArray(err[key])) {
            errorMessages.push(`${key}: ${err[key].join(', ')}`);
          } else if (typeof err[key] === 'string') {
            errorMessages.push(`${key}: ${err[key]}`);
          }
        });

        if (errorMessages.length > 0) {
          toast.error(errorMessages.join(' | '));
          return;
        }
      }

      toast.error(errorMessage);
    }
  };

  // Table columns
  const columns = [
    {
      header: 'Code',
      accessor: 'code',
      width: '120px',
      render: (value) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      header: 'Name',
      accessor: 'name',
      render: (value) => (
        <span className="text-gray-900">{value}</span>
      ),
    },
    {
      header: 'Symbol',
      accessor: 'symbol',
      width: '120px',
      render: (value) => (
        <span className="font-semibold text-gray-700">{value}</span>
      ),
    },
    {
      header: 'Base Currency',
      accessor: 'is_base',
      width: '160px',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Toggle
            checked={!!value}
            onChange={(checked) => handleToggleBaseCurrency(row, checked)}
          />
          
        </div>
      ),
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Currency code is required';
    } else if (formData.code.length !== 3) {
      newErrors.code = 'Currency code must be 3 characters (ISO 4217)';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Currency name is required';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCurrency = async () => {
    if (!validateForm()) return;

    const currencyData = {
      code: formData.code.toUpperCase().trim(),
      name: formData.name.trim(),
      symbol: formData.symbol.trim(),
      is_base: formData.isBaseCurrency,
    };

    console.log('Submitting currency data:', currencyData);

    try {
      if (editingCurrency) {
        // Update existing currency
        const result = await dispatch(updateCurrency({ 
          id: editingCurrency.id, 
          data: currencyData 
        })).unwrap();
        console.log('Currency updated:', result);
        toast.success('Currency updated successfully!');
      } else {
        // Create new currency
        const result = await dispatch(createCurrency(currencyData)).unwrap();
        console.log('Currency created:', result);
        toast.success('Currency created successfully!');
      }
      // Refresh the currencies list
      await dispatch(fetchCurrencies());
      handleCloseModal();
    } catch (err) {
      console.error('Error saving currency:', err);
      
      // Display detailed error message from API response
      const errorMessage = err?.message || err?.error || err?.detail || 'Failed to save currency';
      
      // If there are field-specific errors, display them
      if (err && typeof err === 'object' && !err.message && !err.error && !err.detail) {
        const errorMessages = [];
        Object.keys(err).forEach(key => {
          if (Array.isArray(err[key])) {
            errorMessages.push(`${key}: ${err[key].join(', ')}`);
          } else if (typeof err[key] === 'string') {
            errorMessages.push(`${key}: ${err[key]}`);
          }
        });
        
        if (errorMessages.length > 0) {
          toast.error(errorMessages.join(' | '));
          return;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCurrency(null);
    setFormData({
      code: '',
      name: '',
      symbol: '',
      isBaseCurrency: false,
    });
    setErrors({});
  };

  const handleEdit = (row) => {
    // Handle both row.rawData and direct row object
    const currency = row.rawData || row;
    setEditingCurrency(currency);
    setFormData({
      code: currency.code || '',
      name: currency.name || '',
      symbol: currency.symbol || '',
      isBaseCurrency: !!currency.is_base,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    // Handle both row.rawData and direct row object
    const currency = row.rawData || row;
    setCurrencyToDelete(currency);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteCurrency(currencyToDelete.id)).unwrap();
      toast.success('Currency deleted successfully!');
      setConfirmDelete(false);
      setCurrencyToDelete(null);
    } catch (err) {
      // Display detailed error message from API response
      const errorMessage = err?.message || err?.error || err?.detail || 'Failed to delete currency';
      
      // If there are field-specific errors, display them
      if (err && typeof err === 'object' && !err.message && !err.error && !err.detail) {
        const errorMessages = [];
        Object.keys(err).forEach(key => {
          if (Array.isArray(err[key])) {
            errorMessages.push(`${key}: ${err[key].join(', ')}`);
          } else if (typeof err[key] === 'string') {
            errorMessages.push(`${key}: ${err[key]}`);
          }
        });
        
        if (errorMessages.length > 0) {
          toast.error(errorMessages.join(' | '));
          return;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <PageHeader
        title="Currency"
        subtitle="Manage currencies and exchange rates"
        icon={
          <svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 0C6.49 0 0 6.49 0 14.5C0 22.51 6.49 29 14.5 29C22.51 29 29 22.51 29 14.5C29 6.49 22.51 0 14.5 0ZM14.5 26.5C7.87 26.5 2.5 21.13 2.5 14.5C2.5 7.87 7.87 2.5 14.5 2.5C21.13 2.5 26.5 7.87 26.5 14.5C26.5 21.13 21.13 26.5 14.5 26.5Z" fill="#28819C"/>
            <path d="M15.75 7.5H13.25V13.25H7.5V15.75H13.25V21.5H15.75V15.75H21.5V13.25H15.75V7.5Z" fill="#28819C"/>
          </svg>
        }
      />

      <div className="w-[95%] mx-auto px-6 py-8">
        {/* Header with Title and Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Currency</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 11H11V15H9V11H5V9H9V5H11V9H15V11Z" fill="white"/>
            </svg>
            Add Currency
          </button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={currencies}
          onEdit={handleEdit}
          onDelete={handleDelete}
          editIcon="edit"
        />
      </div>

      {/* Add/Edit Currency Modal */}
      <SlideUpModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCurrency ? 'Edit Currency' : 'Add Currency'}
        maxWidth="550px"
      >
        <div className="space-y-6">
          {/* Currency Code */}
          <FloatingLabelInput
            label="Currency Code (ISO 4217)"
            name="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            error={errors.code}
            required
            placeholder="e.g., USD"
            maxLength={3}
            disabled={!!editingCurrency}
          />

          {/* Currency Name */}
          <FloatingLabelInput
            label="Currency Name"
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
            placeholder="e.g., US Dollar"
          />

          {/* Symbol */}
          <FloatingLabelInput
            label="Symbol"
            name="symbol"
            value={formData.symbol}
            onChange={(e) => handleInputChange('symbol', e.target.value)}
            error={errors.symbol}
            required
            placeholder="e.g., $"
          />

          {/* Base Currency Toggle */}
          <div className="flex items-center gap-3">
            <Toggle
              checked={formData.isBaseCurrency}
              onChange={(checked) => setFormData((prev) => ({ ...prev, isBaseCurrency: checked }))}
            />
            <div>
              <p className="text-sm font-semibold text-gray-700">Set as Base Currency</p>
              <p className="text-xs text-gray-500">Base currency is used as the default for conversions.</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleCloseModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCurrency}
              className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
            >
              {editingCurrency ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </SlideUpModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setCurrencyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Currency"
        message={`Are you sure you want to delete currency "${currencyToDelete?.code} - ${currencyToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CurrencyPage;
