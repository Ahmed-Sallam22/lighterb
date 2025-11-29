import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageHeader from '../components/shared/PageHeader';
import Card from '../components/shared/Card';
import Table from '../components/shared/Table';
import SlideUpModal from '../components/shared/SlideUpModal';
import ConfirmModal from '../components/shared/ConfirmModal';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import Toggle from '../components/shared/Toggle';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  markPreferred,
  removePreferred,
  putOnHold,
  removeHold,
  blacklistSupplier,
  removeBlacklist,
} from '../store/suppliersSlice';
import { fetchCurrencies } from '../store/currenciesSlice';

const SupplierIcon = () => (
  <svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.5">
      <path d="M14 2L2 8V20L14 26L26 20V8L14 2Z" stroke="#D3D3D3" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M14 14C15.6569 14 17 12.6569 17 11C17 9.34315 15.6569 8 14 8C12.3431 8 11 9.34315 11 11C11 12.6569 12.3431 14 14 14Z" fill="#D3D3D3"/>
      <path d="M8 22C8 19.2386 10.2386 17 13 17H15C17.7614 17 20 19.2386 20 22" stroke="#D3D3D3" strokeWidth="2"/>
    </g>
  </svg>
);

const SupplierActionsMenu = ({ supplier, onEdit, onTogglePreferred, onToggleHold, onToggleBlacklist, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClickOutside = (e) => {
    if (!e.target.closest('.actions-menu')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative actions-menu">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Actions"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
              </svg>
              Edit Supplier
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={() => {
                onTogglePreferred();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-lg">{supplier.is_preferred ? '★' : '☆'}</span>
              {supplier.is_preferred ? 'Remove Preferred' : 'Mark as Preferred'}
            </button>

            <button
              onClick={() => {
                onToggleHold();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-lg">{supplier.is_on_hold ? '🔓' : '🔒'}</span>
              {supplier.is_on_hold ? 'Remove Hold' : 'Put on Hold'}
            </button>

            <button
              onClick={() => {
                onToggleBlacklist();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <span className="text-lg">{supplier.is_blacklisted ? '✓' : '🚫'}</span>
              {supplier.is_blacklisted ? 'Remove from Blacklist' : 'Blacklist Supplier'}
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
              </svg>
              Delete Supplier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SuppliersPage = () => {
  const dispatch = useDispatch();
  const { suppliers, loading, error } = useSelector((state) => state.suppliers);
  const { currencies } = useSelector((state) => state.currencies);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [supplierForm, setSupplierForm] = useState({
    code: '',
    name: '',
    legal_name: '',
    email: '',
    phone: '',
    website: '',
    country: 'US',
    currency: '',
    tax_id: '',
    vendor_category: 'SERVICES',
    payment_terms: 'NET30',
    credit_limit: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    bank_name: '',
    bank_account_number: '',
    bank_swift_code: '',
    bank_iban: '',
    bank_routing_number: '',
    is_active: true,
    is_preferred: false,
    compliance_verified: false,
    kyc_verified: false,
    performance_score: '',
    risk_rating: 'MEDIUM',
  });

  const vendorCategories = [
    { value: 'GOODS', label: 'Goods Supplier' },
    { value: 'SERVICES', label: 'Services Provider' },
  ];

  const paymentTerms = [
    { value: 'NET15', label: 'Net 15 Days' },
    { value: 'NET30', label: 'Net 30 Days' },
    { value: 'NET45', label: 'Net 45 Days' },
    { value: 'NET60', label: 'Net 60 Days' },
    { value: 'NET90', label: 'Net 90 Days' },
    { value: 'COD', label: 'Cash on Delivery' },
    { value: 'ADVANCE', label: 'Advance Payment' },
  ];

  const riskRatings = [
    { value: 'LOW', label: 'Low Risk' },
    { value: 'MEDIUM', label: 'Medium Risk' },
    { value: 'HIGH', label: 'High Risk' },
  ];

  const countries = [
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' },
    { value: 'IT', label: 'Italy' },
    { value: 'ES', label: 'Spain' },
    { value: 'SA', label: 'Saudi Arabia' },
    { value: 'IN', label: 'India' },
    { value: 'EG', label: 'Egypt' },
  ];

  const title = 'Suppliers Management';
  const subtitle = 'Manage your suppliers and vendor information';
  const icon = <SupplierIcon />;

  // Update browser title
  useEffect(() => {
    document.title = `${title} - LightERP`;
    return () => {
      document.title = 'LightERP';
    };
  }, [title]);

  const refreshSuppliers = useCallback(() => dispatch(fetchSuppliers()), [dispatch]);

  useEffect(() => {
    refreshSuppliers();
    dispatch(fetchCurrencies());
  }, [refreshSuppliers, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleOpenModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierForm({
        code: supplier.code || '',
        name: supplier.name || '',
        legal_name: supplier.legal_name || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        website: supplier.website || '',
        country: supplier.country || 'US',
        currency: supplier.currency ? supplier.currency.toString() : '',
        tax_id: supplier.tax_id || '',
        vendor_category: supplier.vendor_category || 'SERVICES',
        payment_terms: supplier.payment_terms || 'NET30',
        credit_limit: supplier.credit_limit ? supplier.credit_limit.toString() : '',
        address_line1: supplier.address_line1 || '',
        address_line2: supplier.address_line2 || '',
        city: supplier.city || '',
        state: supplier.state || '',
        postal_code: supplier.postal_code || '',
        bank_name: supplier.bank_name || '',
        bank_account_number: supplier.bank_account_number || '',
        bank_swift_code: supplier.bank_swift_code || '',
        bank_iban: supplier.bank_iban || '',
        bank_routing_number: supplier.bank_routing_number || '',
        is_active: supplier.is_active !== undefined ? supplier.is_active : true,
        is_preferred: supplier.is_preferred || false,
        compliance_verified: supplier.compliance_verified || false,
        kyc_verified: supplier.kyc_verified || false,
        performance_score: supplier.performance_score ? supplier.performance_score.toString() : '',
        risk_rating: supplier.risk_rating || 'MEDIUM',
      });
    } else {
      setEditingSupplier(null);
      setSupplierForm({
        code: '',
        name: '',
        legal_name: '',
        email: '',
        phone: '',
        website: '',
        country: 'US',
        currency: '',
        tax_id: '',
        vendor_category: 'SERVICES',
        payment_terms: 'NET30',
        credit_limit: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        bank_name: '',
        bank_account_number: '',
        bank_swift_code: '',
        bank_iban: '',
        bank_routing_number: '',
        is_active: true,
        is_preferred: false,
        compliance_verified: false,
        kyc_verified: false,
        performance_score: '',
        risk_rating: 'MEDIUM',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    setSupplierForm({
      code: '',
      name: '',
      legal_name: '',
      email: '',
      phone: '',
      website: '',
      country: 'US',
      currency: '',
      tax_id: '',
      vendor_category: 'SERVICES',
      payment_terms: 'NET30',
      credit_limit: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      bank_name: '',
      bank_account_number: '',
      bank_swift_code: '',
      bank_iban: '',
      bank_routing_number: '',
      is_active: true,
      is_preferred: false,
      compliance_verified: false,
      kyc_verified: false,
      performance_score: '',
      risk_rating: 'MEDIUM',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSupplierForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supplierForm.name.trim()) {
      toast.error('Supplier name is required');
      return;
    }

    // Format data for API - ensure proper data types
    const formattedData = {
      ...supplierForm,
      currency: supplierForm.currency ? parseInt(supplierForm.currency) : null,
      credit_limit: supplierForm.credit_limit ? parseFloat(supplierForm.credit_limit) : null,
      performance_score: supplierForm.performance_score ? parseFloat(supplierForm.performance_score) : null,
    };

    // Remove empty strings and null values for optional fields
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === '' || formattedData[key] === null) {
        // Keep boolean fields and required fields
        if (typeof formattedData[key] !== 'boolean' && 
            !['name', 'country', 'vendor_category', 'payment_terms', 'risk_rating', 'is_active', 'is_preferred', 'compliance_verified', 'kyc_verified'].includes(key)) {
          delete formattedData[key];
        }
      }
    });

    console.log('Submitting supplier data:', formattedData);

    try {
      if (editingSupplier) {
        await dispatch(updateSupplier({ id: editingSupplier.id, supplierData: formattedData })).unwrap();
        toast.success('Supplier updated successfully');
      } else {
        await dispatch(createSupplier(formattedData)).unwrap();
        toast.success('Supplier created successfully');
      }
      await refreshSuppliers();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving supplier:', err);
      toast.error(err || 'Failed to save supplier');
    }
  };

  const handleDeleteClick = (supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    try {
      await dispatch(deleteSupplier(supplierToDelete.id)).unwrap();
      toast.success('Supplier deleted successfully');
      await refreshSuppliers();
      setIsDeleteModalOpen(false);
      setSupplierToDelete(null);
    } catch (err) {
      toast.error(err || 'Failed to delete supplier');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSupplierToDelete(null);
  };

  const handleTogglePreferred = async (supplier) => {
    try {
      if (supplier.is_preferred) {
        await dispatch(removePreferred(supplier.id)).unwrap();
        toast.success('Removed from preferred suppliers');
      } else {
        await dispatch(markPreferred(supplier.id)).unwrap();
        toast.success('Marked as preferred supplier');
      }
      await refreshSuppliers();
    } catch (err) {
      toast.error(err || 'Failed to update preferred status');
    }
  };

  const handleToggleHold = async (supplier) => {
    try {
      if (supplier.is_on_hold) {
        await dispatch(removeHold(supplier.id)).unwrap();
        toast.success('Hold removed');
      } else {
        await dispatch(putOnHold(supplier.id)).unwrap();
        toast.success('Supplier put on hold');
      }
      await refreshSuppliers();
    } catch (err) {
      toast.error(err || 'Failed to update hold status');
    }
  };

  const handleToggleBlacklist = async (supplier) => {
    try {
      if (supplier.is_blacklisted) {
        await dispatch(removeBlacklist(supplier.id)).unwrap();
        toast.success('Removed from blacklist');
      } else {
        await dispatch(blacklistSupplier(supplier.id)).unwrap();
        toast.success('Supplier blacklisted');
      }
      await refreshSuppliers();
    } catch (err) {
      toast.error(err || 'Failed to update blacklist status');
    }
  };

  const columns = [
    { 
      header: 'id', 
      accessor: 'id', 
      sortable: true,
      width: '80px',
      render: (value) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    { 
      header: 'code', 
      accessor: 'code', 
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="font-semibold text-gray-700">{value || '-'}</span>
      ),
    },
    { 
      header: 'name', 
      accessor: 'name', 
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    { 
      header: 'email', 
      accessor: 'email', 
      sortable: true,
      render: (value) => (
        <span className="text-gray-600 text-sm">{value || '-'}</span>
      ),
    },
    { 
      header: 'phone', 
      accessor: 'phone', 
      sortable: true,
      width: '140px',
      render: (value) => (
        <span className="text-gray-600 text-sm">{value || '-'}</span>
      ),
    },
    {
      header: 'country',
      accessor: 'country',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className="font-medium text-gray-700">{value}</span>
      ),
    },
    {
      header: 'city',
      accessor: 'city',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="text-gray-600">{value || '-'}</span>
      ),
    },
    {
      header: 'address_line1',
      accessor: 'address_line1',
      render: (value, row) => {
        const address = [value, row.address_line2, row.city, row.state, row.postal_code]
          .filter(Boolean)
          .join(', ');
        return <span className="text-gray-600 text-sm">{address || '-'}</span>;
      },
    },
    {
      header: 'currency_code',
      accessor: 'currency',
      sortable: true,
      width: '100px',
      render: (value, row) => {
        const currencyCode = value || row?.currency_code || '-';
        return <span className="font-medium text-[#28819C]">{currencyCode}</span>;
      },
    },
    {
      header: 'vendor_category_display',
      accessor: 'vendor_category_display',
      sortable: true,
      width: '150px',
      render: (value) => (
        <span className="font-semibold text-[#28819C]">{value}</span>
      ),
    },
    {
      header: 'onboarding_status',
      accessor: 'onboarding_status',
      sortable: true,
      width: '140px',
      render: (value) => {
        const colors = {
          PENDING: 'bg-yellow-100 text-yellow-800',
          IN_PROGRESS: 'bg-blue-100 text-blue-800',
          COMPLETED: 'bg-green-100 text-green-800',
        };
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'status',
      accessor: 'status',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'is_preferred',
      accessor: 'is_preferred',
      width: '100px',
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {value ? '⭐ Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'is_on_hold',
      accessor: 'is_on_hold',
      width: '100px',
      render: (value) => (
        value ? <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">🔒 Yes</span> : 
        <span className="text-gray-400">-</span>
      ),
    },
    {
      header: 'is_blacklisted',
      accessor: 'is_blacklisted',
      width: '110px',
      render: (value) => (
        value ? <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">🚫 Yes</span> : 
        <span className="text-gray-400">-</span>
      ),
    },
    {
      header: 'can_transact',
      accessor: 'can_transact',
      width: '120px',
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? '✓ Yes' : '✗ No'}
        </span>
      ),
    },
    {
      header: 'performance_score',
      accessor: 'performance_score',
      sortable: true,
      width: '120px',
      render: (value) => {
        if (value === null || value === undefined) return <span className="text-gray-400">-</span>;
        const color = value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600';
        return <span className={`font-semibold ${color}`}>{value}%</span>;
      },
    },
    {
      header: 'actions',
      accessor: 'Actions',
      width: '80px',
      render: (_value, supplier) => (
        <SupplierActionsMenu 
          supplier={supplier}
          onEdit={() => handleOpenModal(supplier)}
          onTogglePreferred={() => handleTogglePreferred(supplier)}
          onToggleHold={() => handleToggleHold(supplier)}
          onToggleBlacklist={() => handleToggleBlacklist(supplier)}
          onDelete={() => handleDeleteClick(supplier)}
        />
      ),
    },
  ];

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="">
      {/* <ToastContainer /> */}
      <PageHeader title={title} subtitle={subtitle} icon={icon} />
      
      <Card>
        <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0d5f7a] max-w-md"
          />
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2 bg-[#0d5f7a] text-white rounded-lg hover:bg-[#0a4a5e] transition-colors font-medium"
          >
            Add New Supplier
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5f7a]"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredSuppliers}
            rowsPerPage={10}
            emptyMessage="No suppliers found"
          />
        )}
      </Card>

      {/* Add/Edit Modal */}
      <SlideUpModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Supplier Code"
                name="code"
                type="text"
                value={supplierForm.code}
                onChange={handleChange}
                placeholder="e.g., SUP-US-001"
              />

              <FloatingLabelInput
                label="Supplier Name *"
                name="name"
                type="text"
                value={supplierForm.name}
                onChange={handleChange}
                required
                placeholder="Enter supplier name"
              />

              <FloatingLabelInput
                label="Legal Name"
                name="legal_name"
                type="text"
                value={supplierForm.legal_name}
                onChange={handleChange}
                placeholder="Enter legal/registered name"
              />

              <FloatingLabelInput
                label="Email"
                name="email"
                type="email"
                value={supplierForm.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />

              <FloatingLabelInput
                label="Phone"
                name="phone"
                type="text"
                value={supplierForm.phone}
                onChange={handleChange}
                placeholder="e.g., +1-555-123-4567"
              />

              <FloatingLabelInput
                label="Website"
                name="website"
                type="url"
                value={supplierForm.website}
                onChange={handleChange}
                placeholder="https://www.example.com"
              />

              <FloatingLabelSelect
                label="Category *"
                name="vendor_category"
                value={supplierForm.vendor_category}
                onChange={handleChange}
                options={vendorCategories}
                placeholder="Select category"
                required
              />

              <FloatingLabelInput
                label="Tax ID"
                name="tax_id"
                type="text"
                value={supplierForm.tax_id}
                onChange={handleChange}
                placeholder="e.g., 12-3456789"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className=" pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelSelect
                label="Currency"
                name="currency"
                value={supplierForm.currency}
                onChange={handleChange}
                options={currencies.map(curr => ({ 
                  value: curr.id, 
                  label: `${curr.code} - ${curr.name}` 
                }))}
                placeholder="Select currency"
              />

              <FloatingLabelSelect
                label="Payment Terms"
                name="payment_terms"
                value={supplierForm.payment_terms}
                onChange={handleChange}
                options={paymentTerms}
                placeholder="Select payment terms"
              />

              <FloatingLabelInput
                label="Credit Limit"
                name="credit_limit"
                type="number"
                step="0.01"
                value={supplierForm.credit_limit}
                onChange={handleChange}
                placeholder="e.g., 100000.00"
              />

              <FloatingLabelInput
                label="Performance Score"
                name="performance_score"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={supplierForm.performance_score}
                onChange={handleChange}
                placeholder="e.g., 92.00"
              />

              <FloatingLabelSelect
                label="Risk Rating"
                name="risk_rating"
                value={supplierForm.risk_rating}
                onChange={handleChange}
                options={riskRatings}
                placeholder="Select risk rating"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className=" pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Address Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelSelect
                label="Country *"
                name="country"
                value={supplierForm.country}
                onChange={handleChange}
                options={countries}
                placeholder="Select country"
                required
              />

              <FloatingLabelInput
                label="City"
                name="city"
                type="text"
                value={supplierForm.city}
                onChange={handleChange}
                placeholder="Enter city"
              />

              <FloatingLabelInput
                label="State/Province"
                name="state"
                type="text"
                value={supplierForm.state}
                onChange={handleChange}
                placeholder="Enter state"
              />

              <FloatingLabelInput
                label="Postal Code"
                name="postal_code"
                type="text"
                value={supplierForm.postal_code}
                onChange={handleChange}
                placeholder="Enter postal code"
              />

              <FloatingLabelInput
                label="Address Line 1"
                name="address_line1"
                type="text"
                value={supplierForm.address_line1}
                onChange={handleChange}
                placeholder="Enter address"
              />

              <FloatingLabelInput
                label="Address Line 2"
                name="address_line2"
                type="text"
                value={supplierForm.address_line2}
                onChange={handleChange}
                placeholder="Enter address line 2"
              />
            </div>
          </div>

          {/* Bank Information */}
          <div className=" pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Bank Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Bank Name"
                name="bank_name"
                type="text"
                value={supplierForm.bank_name}
                onChange={handleChange}
                placeholder="e.g., Chase Bank"
              />

              <FloatingLabelInput
                label="Account Number"
                name="bank_account_number"
                type="text"
                value={supplierForm.bank_account_number}
                onChange={handleChange}
                placeholder="Enter account number"
              />

              <FloatingLabelInput
                label="SWIFT Code"
                name="bank_swift_code"
                type="text"
                value={supplierForm.bank_swift_code}
                onChange={handleChange}
                placeholder="e.g., CHASUS33"
              />

              <FloatingLabelInput
                label="IBAN"
                name="bank_iban"
                type="text"
                value={supplierForm.bank_iban}
                onChange={handleChange}
                placeholder="e.g., US12CHAS0001987654321"
              />

              <FloatingLabelInput
                label="Routing Number"
                name="bank_routing_number"
                type="text"
                value={supplierForm.bank_routing_number}
                onChange={handleChange}
                placeholder="e.g., 021000021"
              />
            </div>
          </div>

          {/* Status & Verification */}
          <div className=" pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Status & Verification</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Toggle
                  checked={supplierForm.is_active}
                  onChange={(checked) => setSupplierForm((prev) => ({ ...prev, is_active: checked }))}
                />
                <label className="text-sm font-medium text-gray-700">
                  Active Supplier
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Toggle
                  checked={supplierForm.is_preferred}
                  onChange={(checked) => setSupplierForm((prev) => ({ ...prev, is_preferred: checked }))}
                />
                <label className="text-sm font-medium text-gray-700">
                  Preferred Supplier
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Toggle
                  checked={supplierForm.compliance_verified}
                  onChange={(checked) => setSupplierForm((prev) => ({ ...prev, compliance_verified: checked }))}
                />
                <label className="text-sm font-medium text-gray-700">
                  Compliance Verified
                </label>
              </div>

              <div className="flex items-center gap-3">
                <Toggle
                  checked={supplierForm.kyc_verified}
                  onChange={(checked) => setSupplierForm((prev) => ({ ...prev, kyc_verified: checked }))}
                />
                <label className="text-sm font-medium text-gray-700">
                  KYC Verified
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4  sticky ">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#0d5f7a] text-white rounded-lg hover:bg-[#0a4a5e] transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingSupplier ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </SlideUpModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${supplierToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SuppliersPage;
