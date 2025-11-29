import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageHeader from '../components/shared/PageHeader';
import Toolbar from '../components/shared/Toolbar';
import Table from '../components/shared/Table';
import SlideUpModal from '../components/shared/SlideUpModal';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import Toggle from '../components/shared/Toggle';
import ConfirmModal from '../components/shared/ConfirmModal';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../store/customersSlice';
import { fetchCurrencies } from '../store/currenciesSlice';

const CustomerIcon = () => (
  <svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.5">
      <path d="M14 13.5C17.3137 13.5 20 10.8137 20 7.5C20 4.18629 17.3137 1.5 14 1.5C10.6863 1.5 8 4.18629 8 7.5C8 10.8137 10.6863 13.5 14 13.5Z" fill="#D3D3D3"/>
      <path d="M2 25.5C2 19.9772 6.47715 15.5 12 15.5H16C21.5228 15.5 26 19.9772 26 25.5V26.5H2V25.5Z" fill="#D3D3D3"/>
    </g>
  </svg>
);

const CustomersPage = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customers);
  const { currencies } = useSelector((state) => state.currencies);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    country: '',
    currency: '',
    vat_number: '',
    is_active: true,
  });

  const [searchTerm, setSearchTerm] = useState('');

  const title = 'Customers';
  const subtitle = 'Manage your customer database';
  const icon = <CustomerIcon />;

  // Country options
  const countryOptions = [
    { value: '', label: 'Select Country' },
    { value: 'AE', label: 'United Arab Emirates (AE)' },
    { value: 'EG', label: 'Egypt (EG)' },
    { value: 'IN', label: 'India (IN)' },
    { value: 'SA', label: 'Saudi Arabia (SA)' },
    { value: 'US', label: 'United States (US)' },
  ];

  // Generate currency options from Redux state
  const currencyOptions = [
    { value: '', label: 'Select Currency' },
    ...currencies.map(currency => ({
      value: currency.id.toString(),
      label: `${currency.code} - ${currency.name}`,
    }))
  ];

  // Fetch customers and currencies on mount
  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchCurrencies());
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error, { autoClose: 5000 });
    }
  }, [error]);

  // Update browser title
  useEffect(() => {
    document.title = `${title} - LightERP`;
    return () => {
      document.title = 'LightERP';
    };
  }, [title]);

  // Transform API data for table display
  const tableData = customers
    .filter((customer) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        customer.name?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.code?.toLowerCase().includes(search) ||
        customer.country?.toLowerCase().includes(search) ||
        customer.vat_number?.toLowerCase().includes(search)
      );
    })
    .map((customer) => ({
      id: customer.id,
      code: customer.code || '-',
      name: customer.name || '-',
      email: customer.email || '-',
      country: customer.country || '-',
      currencyName: customer.currency_name || customer.currency || '-',
      vatNumber: customer.vat_number || '-',
      isActive: customer.is_active,
      rawData: customer,
    }));

  // Table columns
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      render: (value) => <span className="text-gray-500 font-medium">#{value}</span>,
    },
    {
      header: 'Code',
      accessor: 'code',
      render: (value) => value || '-',
    },
    {
      header: 'Customer Name',
      accessor: 'name',
      render: (value) => <span className="font-semibold text-[#0d5f7a]">{value}</span>,
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Country',
      accessor: 'country',
      render: (value) => value || '-',
    },
    {
      header: 'Currency',
      accessor: 'currencyName',
      render: (value) => value || '-',
    },
    {
      header: 'VAT Number',
      accessor: 'vatNumber',
      render: (value) => value || '-',
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleCreate = () => {
    setEditingCustomer(null);
    setFormData({
      code: '',
      name: '',
      email: '',
      country: '',
      currency: '',
      vat_number: '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingCustomer(row.rawData);
    setFormData({
      code: row.rawData.code || '',
      name: row.rawData.name || '',
      email: row.rawData.email || '',
      country: row.rawData.country || '',
      currency: row.rawData.currency?.toString() || '',
      vat_number: row.rawData.vat_number || '',
      is_active: row.rawData.is_active !== undefined ? row.rawData.is_active : true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (row) => {
    setCustomerToDelete(row.rawData);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    try {
      await dispatch(deleteCustomer(customerToDelete.id)).unwrap();
      toast.success('Customer deleted successfully');
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    } catch (err) {
      toast.error(err || 'Failed to delete customer');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.country || !formData.currency) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Prepare data for API
    const customerData = {
      code: formData.code || null,
      name: formData.name,
      email: formData.email,
      country: formData.country,
      currency: parseInt(formData.currency),
      vat_number: formData.vat_number || null,
      is_active: formData.is_active,
    };

    try {
      if (editingCustomer) {
        await dispatch(updateCustomer({ id: editingCustomer.id, data: customerData })).unwrap();
        toast.success('Customer updated successfully');
      } else {
        await dispatch(createCustomer(customerData)).unwrap();
        toast.success('Customer created successfully');
      }
      setIsModalOpen(false);
      setFormData({
        code: '',
        name: '',
        email: '',
        country: '',
        currency: '',
        vat_number: '',
        is_active: true,
      });
      setEditingCustomer(null);
    } catch (err) {
      toast.error(err || 'Failed to save customer');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />

      {/* Page Header */}
      <PageHeader icon={icon} title={title} subtitle={subtitle} />

      {/* Toolbar */}
      <div className="px-6 mt-6">
        <Toolbar
          searchPlaceholder="Search customers..."
          onSearchChange={handleSearch}
          createButtonText="New Customer"
          onCreateClick={handleCreate}
        />
      </div>

      {/* Table */}
      <div className="px-6 mt-6 pb-6">
        <Table
          columns={columns}
          data={tableData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No customers found"
          loading={loading}
        />
      </div>

      {/* Create/Edit Modal */}
      <SlideUpModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
          setFormData({
            code: '',
            name: '',
            email: '',
            country: '',
            currency: '',
            vat_number: '',
            is_active: true,
          });
        }}
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
      >
        <div className="space-y-6">
          {/* Customer Code */}
          <FloatingLabelInput
            label="Customer Code (Optional)"
            name="code"
            type="text"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g., CUST-UAE-001"
          />

          {/* Customer Name */}
          <FloatingLabelInput
            label="Customer Name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter customer name"
          />

          {/* Email */}
          <FloatingLabelInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="customer@example.com"
          />

          {/* Country */}
          <FloatingLabelSelect
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            options={countryOptions}
            required
          />

          {/* Currency */}
          <FloatingLabelSelect
            label="Currency"
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            options={currencyOptions}
            required
          />

          {/* VAT Number */}
          <FloatingLabelInput
            label="VAT Number (Optional)"
            name="vat_number"
            type="text"
            value={formData.vat_number}
            onChange={handleInputChange}
            placeholder="e.g., AE100200300400001"
          />

          {/* Active Status Toggle */}
          <div className="pt-2">
            <Toggle
              label="Active Status"
              checked={formData.is_active}
              onChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCustomer(null);
                setFormData({
                  code: '',
                  name: '',
                  email: '',
                  country: '',
                  currency: '',
                  vat_number: '',
                  is_active: true,
                });
              }}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-[#28819C] text-white rounded-lg hover:bg-[#206b85] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {editingCustomer ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                editingCustomer ? 'Update Customer' : 'Create Customer'
              )}
            </button>
          </div>
        </div>
      </SlideUpModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customerToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CustomersPage;
