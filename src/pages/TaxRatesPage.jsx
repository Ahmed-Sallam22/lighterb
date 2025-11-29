import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageHeader from '../components/shared/PageHeader';
import Table from '../components/shared/Table';
import SlideUpModal from '../components/shared/SlideUpModal';
import ConfirmModal from '../components/shared/ConfirmModal';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import Toggle from '../components/shared/Toggle';
import {
  fetchTaxRates,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate,
} from '../store/taxRatesSlice';

const TaxRatesPage = () => {
  const dispatch = useDispatch();
  const { taxRates, loading } = useSelector((state) => state.taxRates);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rate: '',
    country: '',
    code: '',
    category: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  // Fetch tax rates on component mount
  useEffect(() => {
    dispatch(fetchTaxRates());
  }, [dispatch]);

  // Country options
  const countryOptions = [
    { value: 'AE', label: 'United Arab Emirates (AE)' },
    { value: 'EG', label: 'Egypt (EG)' },
    { value: 'IN', label: 'India (IN)' },
    { value: 'SA', label: 'Saudi Arabia (SA)' },
    { value: 'US', label: 'United States (US)' },
  ];

  // Category options
  const categoryOptions = [
    { value: 'STANDARD', label: 'Standard' },
    { value: 'ZERO', label: 'Zero-Rated' },
    { value: 'EXEMPT', label: 'Exempt' },
  ];

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
      header: 'Rate (%)',
      accessor: 'rate',
      width: '100px',
      render: (value) => (
        <span className="font-semibold text-[#28819C]">{value}%</span>
      ),
    },
    {
      header: 'Country',
      accessor: 'country',
      width: '100px',
      render: (value) => (
        <span className="text-gray-700 font-medium">{value}</span>
      ),
    },
    {
      header: 'Category',
      accessor: 'category',
      width: '120px',
      render: (value) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'STANDARD' ? 'bg-blue-100 text-blue-800' :
          value === 'ZERO' ? 'bg-yellow-100 text-yellow-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      width: '100px',
      render: (value) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
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

    if (!formData.name.trim()) {
      newErrors.name = 'Tax name is required';
    }

    if (!formData.rate.trim()) {
      newErrors.rate = 'Tax rate is required';
    } else if (isNaN(formData.rate) || parseFloat(formData.rate) < 0) {
      newErrors.rate = 'Tax rate must be a positive number';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTaxRate = async () => {
    if (!validateForm()) return;

    const taxRateData = {
      name: formData.name,
      rate: parseFloat(formData.rate),
      country: formData.country,
      code: formData.code || null,
      category: formData.category || null,
      is_active: formData.isActive,
    };

    try {
      if (editingId) {
        // Update existing tax rate
        await dispatch(updateTaxRate({ id: editingId, data: taxRateData })).unwrap();
        toast.success('Tax rate updated successfully!');
      } else {
        // Add new tax rate
        await dispatch(createTaxRate(taxRateData)).unwrap();
        toast.success('Tax rate created successfully!');
      }
      handleCloseModal();
    } catch (error) {
      const errorMessage = error?.message || error?.error || 'Failed to save tax rate';
      toast.error(errorMessage);
    }
  };

 

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: '',
      rate: '',
      country: '',
      code: '',
      category: '',
      isActive: true,
    });
    setErrors({});
  };

  const handleEdit = (row) => {
    console.log(row?.id);
    const taxRate = taxRates.find(rate => rate.id === row?.id);
    console.log(taxRates);
    console.log(taxRate);
    
    if (taxRate) {
      setEditingId(row?.id);
      setFormData({
        name: taxRate.name,
        rate: taxRate.rate.toString(),
        country: taxRate.country,
        code: taxRate.code || '',
        category: taxRate.category || '',
        isActive: taxRate.is_active,
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id.id);    
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteTaxRate(deleteId)).unwrap();
        toast.success('Tax rate deleted successfully!');
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      } catch (error) {
        const errorMessage = error?.message || error?.error || 'Failed to delete tax rate';
        toast.error(errorMessage);
      }
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
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
        title="Tax Rates"
        subtitle="Manage tax rates and VAT configuration"
        icon={
          <svg width="29" height="35" viewBox="0 0 29 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.5 0C6.49 0 0 6.49 0 14.5C0 22.51 6.49 29 14.5 29C22.51 29 29 22.51 29 14.5C29 6.49 22.51 0 14.5 0ZM14.5 26.5C7.87 26.5 2.5 21.13 2.5 14.5C2.5 7.87 7.87 2.5 14.5 2.5C21.13 2.5 26.5 7.87 26.5 14.5C26.5 21.13 21.13 26.5 14.5 26.5Z" fill="#28819C"/>
            <path d="M11 8H13V11H16V13H13V16H16V18H13V21H11V18H8V16H11V13H8V11H11V8ZM18 8H21V11H18V8ZM18 18H21V21H18V18Z" fill="#28819C"/>
          </svg>
        }
      />

      <div className=" mx-auto px-6 py-8">
        {/* Header with Title and Buttons */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tax Rates</h2>
          <div className="flex gap-3">
    
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM15 11H11V15H9V11H5V9H9V5H11V9H15V11Z" fill="white"/>
              </svg>
              Add Tax Rate
            </button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={taxRates}
          onEdit={handleEdit}
          onDelete={handleDelete}
          editIcon="edit"
          loading={loading}
        />
      </div>

      {/* Add/Edit Tax Rate Modal */}
      <SlideUpModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Tax Rate' : 'Add Tax Rate'}
        maxWidth="550px"
      >
        <div className="space-y-6">
          {/* Tax Name */}
          <FloatingLabelInput
            label="Tax Name"
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
            placeholder="e.g., Standard VAT 5%"
          />

          {/* Tax Rate */}
          <FloatingLabelInput
            label="Tax Rate (%)"
            name="rate"
            type="number"
            step="0.01"
            min="0"
            value={formData.rate}
            onChange={(e) => handleInputChange('rate', e.target.value)}
            error={errors.rate}
            required
            placeholder="e.g., 5.00"
          />

          {/* Country */}
          <FloatingLabelSelect
            label="Country"
            name="country"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            error={errors.country}
            options={countryOptions}
            required
          />

          {/* Tax Code (Optional) */}
          <FloatingLabelInput
            label="Tax Code (Optional)"
            name="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="e.g., VAT5"
          />

          {/* Category (Optional) */}
          <FloatingLabelSelect
            label="Category (Optional)"
            name="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={categoryOptions}
          />

          {/* Toggle for Active Status */}
          <div className="pt-2">
            <Toggle
              label="Set as Active"
              checked={formData.isActive}
              onChange={(checked) => handleInputChange('isActive', checked)}
            />
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
              onClick={handleAddTaxRate}
              className="flex-1 px-4 py-2 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </SlideUpModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Tax Rate"
        message="Are you sure you want to delete this tax rate? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default TaxRatesPage;
