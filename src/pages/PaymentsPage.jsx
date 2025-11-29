import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PageHeader from '../components/shared/PageHeader';
import Toolbar from '../components/shared/Toolbar';
import Table from '../components/shared/Table';
import ConfirmModal from '../components/shared/ConfirmModal';
import { fetchARPayments, deleteARPayment } from '../store/arPaymentsSlice';
import { fetchAPPayments, deleteAPPayment } from '../store/apPaymentsSlice';

const ARPaymentIcon = () => (
  <svg width="28" height="25" viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.5">
      <path d="M3.33661 23.4218C2.21774 20.9417 1.11652 18.4969 0 16.0203C0.431783 15.8215 0.841212 15.6203 1.26123 15.4415C2.48246 14.9226 3.70486 14.4061 4.93197 13.9014C6.52027 13.2485 8.00151 13.4485 9.38628 14.4685C10.2981 15.1415 11.2369 15.778 12.1558 16.4403C13.1664 17.1698 14.3112 17.4686 15.5348 17.5404C16.2344 17.5804 16.9337 17.6329 17.6325 17.698C17.7866 17.7233 17.9353 17.7742 18.0725 17.8486C18.2362 17.9163 18.3766 18.0303 18.4765 18.1766C18.5764 18.3229 18.6314 18.4951 18.6349 18.6722C18.6573 19.0675 18.4561 19.3428 18.1278 19.5299C17.6095 19.8114 17.0269 19.9533 16.4372 19.9417C15.1853 19.9511 13.9324 19.9593 12.6805 19.9323C11.5158 19.9076 10.411 19.5687 9.32039 19.1852C9.17506 19.1305 9.02701 19.0834 8.87684 19.044C9.39334 19.5685 9.97543 20.024 10.6087 20.3993C11.3902 20.872 12.2898 21.1132 13.2029 21.0947C14.27 21.0782 15.3359 21.1053 16.403 21.0864C17.3031 21.07 18.1678 20.8994 18.922 20.3523C19.642 19.8275 19.8503 19.1063 19.7208 18.2569C19.6032 17.4945 19.1796 16.9627 18.4455 16.7686C17.8222 16.6143 17.1869 16.5128 16.5466 16.4651C15.9736 16.4109 15.3936 16.4368 14.8171 16.4227C14.6705 16.4206 14.5267 16.3827 14.3983 16.3121L15.2077 15.8415C16.0524 15.3521 16.8854 14.8403 17.7455 14.3803C18.2855 14.092 18.8879 13.9026 19.4867 14.1755C19.8397 14.3367 20.1361 14.6214 20.4832 14.8697C20.9018 14.4682 21.4377 14.211 22.0127 14.1355C22.3415 14.0854 22.6757 14.0811 23.0057 14.1226C23.6681 14.2273 23.954 14.6132 24.0257 15.4027C24.3387 15.2591 24.641 15.105 24.954 14.9791C25.5352 14.7438 26.1305 14.6109 26.7552 14.8038C27.7623 15.1168 28.1188 16.1133 27.4494 16.9215C27.048 17.3998 26.5711 17.8091 26.0376 18.1334C22.8163 20.0899 19.5667 21.9982 16.343 23.9536C15.3289 24.5689 14.31 24.7631 13.1888 24.3454C12.9147 24.243 12.6229 24.1901 12.3499 24.0877C10.7487 23.4995 9.14509 22.9112 7.55326 22.29C6.60616 21.9229 5.71789 21.9171 4.84726 22.5018C4.37783 22.8253 3.87075 23.1006 3.33661 23.4218Z" fill="#D3D3D3"/>
      <path d="M21.0144 6.46019C21.019 7.74454 20.642 9.00133 19.9312 10.0711C19.2205 11.1409 18.208 11.9754 17.0222 12.4689C15.8364 12.9624 14.5308 13.0926 13.2709 12.8429C12.011 12.5933 10.8537 11.975 9.94574 11.0666C9.03776 10.1583 8.42004 9.00065 8.17095 7.74067C7.92186 6.48069 8.05262 5.17512 8.54663 3.98956C9.04065 2.80401 9.87567 1.7919 10.9458 1.08162C12.0159 0.371342 13.2728 -0.00510118 14.5572 5.22114e-05C18.0818 -0.00139528 21.0144 2.93121 21.0144 6.46019ZM13.9217 2.24221C13.9217 2.48683 13.9072 2.70251 13.9217 2.91384C13.9449 3.17294 13.8653 3.30322 13.5902 3.34809C13.3561 3.39909 13.1311 3.48548 12.9229 3.6043C11.6014 4.31067 11.5319 5.92027 12.797 6.70915C13.1436 6.89861 13.5035 7.06261 13.8739 7.19985C14.2257 7.35184 14.589 7.47922 14.9292 7.65147C15.0589 7.70787 15.165 7.80754 15.2294 7.93345C15.2938 8.05937 15.3125 8.20374 15.2824 8.34192C15.2604 8.48076 15.1929 8.60835 15.0904 8.70455C14.9879 8.80075 14.8563 8.86007 14.7164 8.87315C14.3761 8.93944 14.0279 8.95554 13.6829 8.92091C13.1792 8.84709 12.6885 8.68642 12.1558 8.55181L11.7982 9.80678L13.858 10.2758V11.2369H14.9813V10.1715C15.3243 10.05 15.6384 9.966 15.9294 9.83138C17.2205 9.23646 17.5028 7.59936 16.4592 6.71205C16.1934 6.50689 15.9013 6.33844 15.5907 6.21122C15.0681 5.97094 14.5181 5.78856 14.01 5.52222C13.9204 5.46314 13.8465 5.38309 13.7948 5.28901C13.7431 5.19492 13.7151 5.08964 13.7133 4.9823C13.7451 4.79413 13.9695 4.61464 14.1475 4.48726C14.285 4.41109 14.4441 4.38355 14.5991 4.4091C15.2013 4.47858 15.8006 4.57267 16.4403 4.66386L16.7588 3.49139L15.029 3.14979V2.24221H13.9217Z" fill="#D3D3D3"/>
    </g>
  </svg>
);

const APPaymentIcon = () => (
  <svg width="27" height="20" viewBox="0 0 27 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path opacity="0.5" d="M26.8421 3.66029V19.5216H3.66029V17.0814H24.4019V3.66029H26.8421ZM21.9617 14.6412H0V0H21.9617V14.6412ZM14.6412 7.32058C14.6412 5.29522 13.0062 3.66029 10.9809 3.66029C8.95551 3.66029 7.32058 5.29522 7.32058 7.32058C7.32058 9.34594 8.95551 10.9809 10.9809 10.9809C13.0062 10.9809 14.6412 9.34594 14.6412 7.32058Z" fill="#D3D3D3"/>
  </svg>
);

const PaymentsPage = () => {
  const { type } = useParams(); // 'ar' or 'ap'
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Determine content based on type
  const isAR = type?.toLowerCase() === 'ar';
  
  // Get data from Redux based on type
  const { payments: arPayments, loading: arLoading } = useSelector((state) => state.arPayments);
  const { payments: apPayments, loading: apLoading } = useSelector((state) => state.apPayments);
  
  const payments = isAR ? arPayments : apPayments;
  const loading = isAR ? arLoading : apLoading;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const title = isAR ? 'AR Payments' : 'AP Payments';
  const subtitle = isAR ? 'Receive payments from customers' : 'Make Payments to Suppliers';
  const icon = isAR ? <ARPaymentIcon /> : <APPaymentIcon />;
  const buttonText = 'New Payment';
  const quickActionPath = isAR ? '/quick-actions/receive-payment' : '/quick-actions/make-payment';

  // Fetch payments on mount
  useEffect(() => {
    if (isAR) {
      dispatch(fetchARPayments());
    } else {
      dispatch(fetchAPPayments());
    }
  }, [dispatch, isAR]);

  // Update browser title
  useEffect(() => {
    document.title = `${title} - LightERP`;
    return () => {
      document.title = 'LightERP';
    };
  }, [title]);

  // Filter and search payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.memo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || payment.status?.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Table columns configuration
  const columns = [
    {
      header: 'Payment Date',
      accessor: 'date',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      header: isAR ? 'Customer' : 'Supplier',
      accessor: isAR ? 'customer_name' : 'supplier_name',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      header: 'Reference',
      accessor: 'reference',
      sortable: true,
      render: (value) => value || '-',
    },
    {
      header: 'Amount',
      accessor: isAR ? 'total_amount' : 'amount',
      sortable: true,
      render: (value) => <span className="font-semibold">{parseFloat(value || 0).toFixed(2)}</span>,
    },
    {
      header: 'Currency',
      accessor: 'currency_code',
      render: (value) => value || '-',
    },
    {
      header: 'Payment Method',
      accessor: 'payment_method',
      render: (value) => {
        if (!value) return '-';
        return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      },
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusColors = {
          COMPLETED: 'bg-green-100 text-green-800',
          PENDING: 'bg-yellow-100 text-yellow-800',
          FAILED: 'bg-red-100 text-red-800',
          CANCELLED: 'bg-gray-100 text-gray-800',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusColors[value] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {value || 'PENDING'}
          </span>
        );
      },
    },
  ];

  // Filter options for toolbar
  const filterOptions = [
    { value: '', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Handlers
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  const handleFilter = (filterValue) => {
    setFilterStatus(filterValue);
  };

  const handleCreate = () => {
    navigate(quickActionPath);
  };

  const handleEdit = (payment) => {
    // Navigate to edit form with payment ID
    navigate(quickActionPath, { state: { paymentId: payment.id, payment } });
  };

  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;

    try {
      if (isAR) {
        await dispatch(deleteARPayment(paymentToDelete.id)).unwrap();
        toast.success('AR Payment deleted successfully');
      } else {
        await dispatch(deleteAPPayment(paymentToDelete.id)).unwrap();
        toast.success('AP Payment deleted successfully');
      }
      setIsDeleteModalOpen(false);
      setPaymentToDelete(null);
    } catch (error) {
      toast.error(error || 'Failed to delete payment');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setPaymentToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <PageHeader icon={icon} title={title} subtitle={subtitle} />

      {/* Toolbar */}
      <div className="px-6 mt-6">
        <Toolbar
          searchPlaceholder="Search payments..."
          onSearchChange={handleSearch}
          filterOptions={filterOptions}
          filterLabel="Filter by Status"
          onFilterChange={handleFilter}
          createButtonText={buttonText}
          onCreateClick={handleCreate}
        />
      </div>

      {/* Table */}
      <div className="px-6 mt-6 pb-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5f7a]"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredPayments}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            emptyMessage={`No ${isAR ? 'customer' : 'supplier'} payments found`}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Payment"
        message={`Are you sure you want to delete payment "${paymentToDelete?.reference || 'this payment'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default PaymentsPage;
