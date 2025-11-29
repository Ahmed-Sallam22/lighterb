import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PageHeader from '../components/shared/PageHeader';
import SlideUpModal from '../components/shared/SlideUpModal';
import Table from '../components/shared/Table';
import FloatingLabelInput from '../components/shared/FloatingLabelInput';
import FloatingLabelSelect from '../components/shared/FloatingLabelSelect';
import {
  fetchCatalogItems,
  createCatalogItem,
  updateCatalogItem,
  clearCatalogErrors,
} from '../store/catalogItemsSlice';

const HeaderIcon = () => (
  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center shadow-lg">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7L12 3L20 7V17L12 21L4 17V7Z" stroke="#D3D3D3" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 12L12 16L20 12" stroke="#48C1F0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 3V16" stroke="#48C1F0" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

const statusDot = (active) => (
  <span
    className={`inline-flex items-center gap-1 text-sm ${
      active ? 'text-emerald-600' : 'text-gray-500'
    }`}
  >
    <span
      className={`w-2.5 h-2.5 rounded-full ${
        active ? 'bg-emerald-500' : 'bg-gray-300'
      }`}
    />
    {active ? 'Posted' : 'Inactive'}
  </span>
);

const ProcurementCatalog = () => {
  const dispatch = useDispatch();
  const { items, loading, creating, updating, error, actionError } = useSelector(
    (state) => state.catalogItems
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newItem, setNewItem] = useState({
    item_code: '',
    name: '',
    description: '',
    supplier: '',
    category: '',
    unit_price: '',
  });
  const [editForm, setEditForm] = useState({
    unit_price: '',
  });

  useEffect(() => {
    dispatch(
      fetchCatalogItems({
        category: categoryFilter,
        active: statusFilter,
        supplier: '',
      })
    );
  }, [dispatch, categoryFilter, statusFilter]);

  useEffect(() => {
    if (selectedItem) {
      setEditForm({ unit_price: selectedItem.list_price || '' });
    }
  }, [selectedItem]);

  const categories = useMemo(() => {
    const map = new Map();
    items.forEach((item) => {
      if (item.category && item.category_name) {
        map.set(item.category, item.category_name);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  }, [items]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return items
      .filter((item) => {
        if (!term) return true;
        return (
          item.name?.toLowerCase().includes(term) ||
          item.item_code?.toLowerCase().includes(term) ||
          item.short_description?.toLowerCase().includes(term)
        );
      })
      .filter((item) => {
        if (!categoryFilter) return true;
        return `${item.category}` === `${categoryFilter}`;
      })
      .filter((item) => {
        if (statusFilter === '') return true;
        if (statusFilter === 'true') return item.is_active;
        if (statusFilter === 'false') return !item.is_active;
        return true;
      });
  }, [items, searchTerm, categoryFilter, statusFilter]);

  const handleCreate = async () => {
    try {
      const payload = {
        item_code: newItem.item_code,
        description: newItem.description,
        supplier: newItem.supplier ? Number(newItem.supplier) : null,
        category: newItem.category ? Number(newItem.category) : null,
        unit_price: newItem.unit_price,
        name: newItem.name || newItem.description || '',
      };

      await dispatch(createCatalogItem(payload)).unwrap();
      setIsAddModalOpen(false);
      setNewItem({
        item_code: '',
        name: '',
        description: '',
        supplier: '',
        category: '',
        unit_price: '',
      });
    } catch (err) {
      // errors are handled via slice state
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      await dispatch(
        updateCatalogItem({
          id: selectedItem.id,
          data: { unit_price: editForm.unit_price },
        })
      ).unwrap();
      setIsEditModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      // errors are handled via slice state
    }
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditForm({ unit_price: item.list_price || '' });
    setIsEditModalOpen(true);
  };

  const currencyFormat = (amount, code) => {
    const numeric = Number(amount || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  };

  const columns = [
    {
      key: 'short_description',
      label: 'Description',
      render: (value) => value || '—',
    },
    {
      key: 'item_code',
      label: 'Code',
      render: (value) => <span className="font-semibold text-gray-900">{value || '—'}</span>,
    },
    {
      key: 'name',
      label: 'Name',
      render: (value) => value || '—',
    },
    {
      key: 'list_price',
      label: 'Price',
      render: (value, row) => (
        <span className="text-[#d33b3b] font-semibold">
          {currencyFormat(value, row.currency_code)}
        </span>
      ),
    },
    {
      key: 'uom_code',
      label: 'UOM',
      render: (value) => value || '—',
    },
    {
      key: 'supplier_name',
      label: 'Supplier',
      render: (value) => value || '—',
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (value) => statusDot(value),
    },
  ];

  const actions = [
    {
      label: 'View',
      onClick: (row) => openEdit(row),
      className: 'text-[#28819C] hover:text-[#1d5c6d] font-semibold',
    },
  ];

  const handleModalClose = () => {
    dispatch(clearCatalogErrors());
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <section className="min-h-screen bg-[#f2f3f5] ">
      <PageHeader icon={<HeaderIcon />} title="Catalogue Reference" subtitle="Browse Catalogue Items Reference only (use PR page to request items)" />

      <div className=" px-6 mt-8">
        <div className="bg-white/80 backdrop-blur-sm border border-white/70 rounded-3xl shadow-[0_18px_50px_rgba(3,27,40,0.12)] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by code or name ..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48C1F0]/50"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7.5 13.5C10.8137 13.5 13.5 10.8137 13.5 7.5C13.5 4.18629 10.8137 1.5 7.5 1.5C4.18629 1.5 1.5 4.18629 1.5 7.5C1.5 10.8137 4.18629 13.5 7.5 13.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16.5 16.5L12.875 12.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <FloatingLabelSelect
                  label="Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Categories' },
                    ...categories.map((cat) => ({ value: cat.value, label: cat.label })),
                  ]}
                />
                <FloatingLabelSelect
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'true', label: 'Active' },
                    { value: 'false', label: 'Inactive' },
                  ]}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#28819C] text-white font-semibold shadow-lg hover:bg-[#1f6b7e] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1.33337V14.6667" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1.33398 8H14.6673" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              New Item
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-gray-100 bg-white shadow-[0_10px_30px_rgba(3,27,40,0.08)]">
            <Table
              columns={columns}
              data={filteredItems}
              actions={actions}
              loading={loading}
            />
          </div>
          {(error || actionError) && (
            <p className="mt-3 text-sm text-red-600 font-semibold">{error || actionError}</p>
          )}
        </div>
      </div>

      <SlideUpModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        title="New Catalogue Item"
        maxWidth="640px"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FloatingLabelInput
              label="Item Code"
              value={newItem.item_code}
              onChange={(e) => setNewItem({ ...newItem, item_code: e.target.value })}
              placeholder="CAT-001"
            />
            <FloatingLabelInput
              label="Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Item Name"
            />
            <FloatingLabelInput
              label="Category (ID)"
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              placeholder="1"
            />
            <FloatingLabelInput
              label="Supplier (ID)"
              value={newItem.supplier}
              onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
              placeholder="Supplier ID"
            />
            <FloatingLabelInput
              label="Unit Price"
              type="number"
              value={newItem.unit_price}
              onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
              placeholder="25.00"
            />
          </div>
          <FloatingLabelInput
            label="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Item description"
            multiline
            rows={3}
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={creating}
              onClick={handleCreate}
              className="flex-1 px-4 py-2 rounded-xl bg-[#28819C] text-white font-semibold hover:bg-[#1f6b7e] disabled:opacity-60"
            >
              {creating ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>
      </SlideUpModal>

      <SlideUpModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        title="Catalogue Item Details"
        maxWidth="640px"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Code</p>
                <p className="font-semibold text-gray-900">{selectedItem.item_code || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-900">{selectedItem.name || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-semibold text-gray-900">{selectedItem.category_name || selectedItem.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Supplier</p>
                <p className="font-semibold text-gray-900">{selectedItem.supplier_name || selectedItem.preferred_supplier || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">UOM</p>
                <p className="font-semibold text-gray-900">{selectedItem.uom_code || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                {statusDot(selectedItem.is_active)}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Price</p>
              <div className="flex items-center gap-3">
                <FloatingLabelInput
                  label="Unit Price"
                  type="number"
                  value={editForm.unit_price}
                  onChange={(e) => setEditForm({ ...editForm, unit_price: e.target.value })}
                />
                <span className="text-sm text-gray-600">{selectedItem.currency_code || 'USD'}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleUpdate}
                className="flex-1 px-4 py-2 rounded-xl bg-[#28819C] text-white font-semibold hover:bg-[#1f6b7e] disabled:opacity-60"
              >
                {updating ? 'Updating...' : 'Update Price'}
              </button>
            </div>
          </div>
        )}
      </SlideUpModal>
    </section>
  );
};

export default ProcurementCatalog;
