import React, { useState } from 'react';
import Toolbar from '../components/shared/Toolbar';
import Table from '../components/shared/Table';

// Example Filter Icon
const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4h16M5 10h10M8 16h4" stroke="#7A9098" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ExampleTablePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('');

  // Sample data
  const tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Active' },
  ];

  // Filter options
  const filterOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // Table columns configuration
  const columns = [
    {
      header: 'ID',
      accessor: 'id',
    },
    {
      header: 'Name',
      accessor: 'name',
    },
    {
      header: 'Email',
      accessor: 'email',
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Admin' ? 'bg-purple-100 text-purple-800' :
          value === 'Manager' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      ),
    },
  ];

  // Filtered data based on search and filter
  const filteredData = tableData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterValue === '' || 
      item.status.toLowerCase() === filterValue.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  const handleFilter = (value) => {
    setFilterValue(value);
  };

  const handleCreate = () => {
    console.log('Create new item clicked');
    // Add your create logic here
  };

  const handleEdit = (row, index) => {
    console.log('Edit clicked for:', row, 'at index:', index);
    // Add your edit logic here
  };

  const handleDelete = (row, index) => {
    console.log('Delete clicked for:', row, 'at index:', index);
    // Add your delete logic here
  };

  return (
    <section className="min-h-screen bg-[#edf2f7] py-8">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[#031b28] mb-6">Users Management</h1>
        
        {/* Toolbar */}
        <Toolbar
          searchPlaceholder="Search users..."
          onSearchChange={handleSearch}
          filterOptions={filterOptions}
          filterLabel="Filter by Status"
          filterIcon={<FilterIcon />}
          onFilterChange={handleFilter}
          createButtonText="Create User"
          onCreateClick={handleCreate}
        />

        {/* Table */}
        <div className="mt-6">
          <Table
            columns={columns}
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            emptyMessage="No users found"
          />
        </div>
      </div>
    </section>
  );
};

export default ExampleTablePage;
