// components/EmployeesView.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { format, parseISO } from 'date-fns';
import api from '../api';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const EmployeesView = ({ refreshTrigger, onRefresh }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef();

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/admin/employees');
        console.log('API Response:', res.data); // Debug log
        setEmployees(res.data || []);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [refreshTrigger]);

  // Debug log to check employees data
  useEffect(() => {
    console.log('Employees state updated:', employees);
  }, [employees]);

  // Employee Actions Cell Renderer
  const EmployeeActionsCellRenderer = (params) => {
    const handleEdit = () => {
      console.log('Edit employee:', params.data);
      alert('Edit employee functionality will be implemented in a future update.');
    };

    const handleDelete = async () => {
      if (window.confirm(`Are you sure you want to delete employee ${params.data.first_name} ${params.data.last_name}?`)) {
        try {
          await api.delete(`/api/admin/employees/${params.data._id}`);
          onRefresh();
        } catch (err) {
          console.error('Failed to delete employee:', err);
          alert('Failed to delete employee');
        }
      }
    };

    return (
      <div className="flex space-x-1">
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-800 p-1"
          title="Edit Employee"
        >
          <FaEdit size={12} />
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 p-1"
          title="Delete Employee"
        >
          <FaTrash size={12} />
        </button>
      </div>
    );
  };

  // Column definitions
  const columnDefs = useMemo(() => [
    {
      field: 'first_name',
      headerName: 'First Name',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 150,
      pinned: 'left',
      // Add value getter as fallback
      valueGetter: (params) => params.data?.first_name || ''
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 150,
      pinned: 'left',
      valueGetter: (params) => params.data?.last_name || ''
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 250,
      valueGetter: (params) => params.data?.email || ''
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
      valueGetter: (params) => params.data?.phone || ''
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 100,
      valueFormatter: (params) => 
        params.value ? params.value.charAt(0).toUpperCase() + params.value.slice(1) : '',
      cellStyle: (params) => {
        if (params.value === 'admin') {
          return { backgroundColor: '#fef3c7', color: '#d97706' };
        }
        return { backgroundColor: '#e0f2fe', color: '#0369a1' };
      },
      valueGetter: (params) => params.data?.role || ''
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 120,
      cellRenderer: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {params.value ? 'Active' : 'Inactive'}
        </span>
      ),
      valueGetter: (params) => params.data?.is_active ?? false
    },
    {
      field: 'created_at',
      headerName: 'Created',
      valueFormatter: (params) => 
        params.value ? format(parseISO(params.value), 'MMM dd, yyyy HH:mm') : '',
      width: 150,
      valueGetter: (params) => params.data?.created_at || ''
    },
    {
      field: 'updated_at',
      headerName: 'Last Updated',
      valueFormatter: (params) => 
        params.value ? format(parseISO(params.value), 'MMM dd, yyyy HH:mm') : '',
      width: 150,
      valueGetter: (params) => params.data?.updated_at || ''
    },
    {
      headerName: 'Actions',
      cellRenderer: EmployeeActionsCellRenderer,
      sortable: false,
      filter: false,
      width: 100,
      pinned: 'right'
    },
  ], []);

  // Export data
  const handleExport = () => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `employees_${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(emp => emp.is_active).length;
    const inactive = total - active;
    const admins = employees.filter(emp => emp.role === 'admin').length;
    const regularEmployees = total - admins;

    return { total, active, inactive, admins, regularEmployees };
  }, [employees]);

  return (
    <div className="flex flex-col h-full">
      {/* Action Bar */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <FaDownload size={14} />
            <span>Export CSV</span>
          </button>

          <div className="text-sm text-gray-600">
            {employees.length} employees total
          </div>
        </div>
      </div>

      {/* AG Grid */}
      <div className="flex-1 p-4">
        {/* Add a minimum height to ensure grid is visible */}
        <div className="ag-theme-alpine" style={{ height: '500px', minHeight: '400px' }}>
          <AgGridReact
            ref={gridRef}
            rowData={employees}
            columnDefs={columnDefs}
            loading={loading}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50]}
            rowSelection="multiple"
            animateRows={true}
            enableRangeSelection={true}
            suppressRowClickSelection={true}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              floatingFilter: true,
              minWidth: 80,
              flex: 1, // Add flex for better column sizing
            }}
            onGridReady={(params) => {
              console.log('Grid ready, row count:', params.api.getDisplayedRowCount());
              console.log('Grid API available:', !!params.api);
              console.log('Grid column API available:', !!params.columnApi);
              // Force refresh after grid is ready
              setTimeout(() => {
                params.api.refreshCells();
                params.api.sizeColumnsToFit();
              }, 100);
            }}
            onFirstDataRendered={(params) => {
              console.log('First data rendered, row count:', params.api.getDisplayedRowCount());
              console.log('Total rows:', params.api.getModel().getRowCount());
              params.api.sizeColumnsToFit();
            }}
            suppressMovableColumns={false}
            suppressMenuHide={false}
            enableCellTextSelection={true}
            getContextMenuItems={() => [
              'copy',
              'copyWithHeaders',
              'separator',
              'export',
              'separator',
              {
                name: 'Refresh Data',
                action: onRefresh,
                icon: '<i class=""></i>'
              }
            ]}
            // Add overlays for better user feedback
            overlayLoadingTemplate={'<span class="ag-overlay-loading-center">Loading employees...</span>'}
            overlayNoRowsTemplate={'<span class="ag-overlay-no-rows-center">No employees found</span>'}
          />
        </div>

        {/* Employee Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.admins}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Regular Employees</p>
                <p className="text-2xl font-bold text-purple-600">{stats.regularEmployees}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesView;