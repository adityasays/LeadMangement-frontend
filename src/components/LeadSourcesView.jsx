import { useState, useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { format, parseISO } from 'date-fns';
import api from '../api';
import { FaEdit, FaTrash, FaDownload } from 'react-icons/fa';


import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const LeadSourcesView = ({ refreshTrigger, onRefresh }) => {
  const [leadSources, setLeadSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef();

  
  useEffect(() => {
    const fetchLeadSources = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/admin/lead-sources');
        setLeadSources(res.data || []);
      } catch (err) {
        console.error('Failed to fetch lead sources:', err);
        setLeadSources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadSources();
  }, [refreshTrigger]);

  
  const StatusCellRenderer = (params) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(params.value);

    const handleSave = async (newStatus) => {
      try {
        await api.put(`/api/admin/lead-sources/${params.data._id}`, { 
          is_active: newStatus 
        });
        params.node.setDataValue('is_active', newStatus);
        setEditing(false);
        onRefresh();
      } catch (err) {
        console.error('Failed to update status:', err);
        alert('Failed to update status');
      }
    };

    if (editing) {
      return (
        <select
          value={value ? 'true' : 'false'}
          onChange={(e) => setValue(e.target.value === 'true')}
          onBlur={() => handleSave(value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave(value)}
          autoFocus
          className="w-full p-1 border rounded text-xs"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      );
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
        onClick={() => setEditing(true)}
        title="Click to toggle status"
      >
        {value ? 'Active' : 'Inactive'}
      </span>
    );
  };


  const DescriptionCellRenderer = (params) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(params.value || '');

    const handleSave = async () => {
      try {
        await api.put(`/api/admin/lead-sources/${params.data._id}`, { 
          description: value 
        });
        params.node.setDataValue('description', value);
        setEditing(false);
      } catch (err) {
        console.error('Failed to update description:', err);
        alert('Failed to update description');
      }
    };

    if (editing) {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          className="w-full p-1 border rounded"
        />
      );
    }

    return (
      <span
        className="cursor-pointer hover:bg-gray-100 p-1 rounded"
        onClick={() => setEditing(true)}
        title="Click to edit description"
      >
        {value || 'No description'}
      </span>
    );
  };

  
  const LeadSourceActionsCellRenderer = (params) => {
    const handleEdit = () => {
      console.log('Edit lead source:', params.data);
      alert('Edit lead source functionality will be implemented in a future update.');
    };

    const handleDelete = async () => {
      if (window.confirm(`Are you sure you want to delete lead source "${params.data.name}"?`)) {
        try {
          await api.delete(`/api/admin/lead-sources/${params.data._id}`);
          onRefresh();
        } catch (err) {
          console.error('Failed to delete lead source:', err);
          alert('Failed to delete lead source');
        }
      }
    };

    return (
      <div className="flex space-x-1">
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-800 p-1"
          title="Edit Lead Source"
        >
          <FaEdit size={12} />
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 p-1"
          title="Delete Lead Source"
        >
          <FaTrash size={12} />
        </button>
      </div>
    );
  };

  
  const columnDefs = useMemo(() => [
    {
      field: 'name',
      headerName: 'Source Name',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 200,
      pinned: 'left',
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'description',
      headerName: 'Description',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 300,
      cellRenderer: DescriptionCellRenderer,
    },
    {
      field: 'is_active',
      headerName: 'Status',
      width: 120,
      cellRenderer: StatusCellRenderer,
    },
    {
      field: 'created_at',
      headerName: 'Created',
      valueFormatter: (params) => 
        params.value ? format(parseISO(params.value), 'MMM dd, yyyy HH:mm') : '',
      width: 150,
    },
    {
      headerName: 'Actions',
      cellRenderer: LeadSourceActionsCellRenderer,
      sortable: false,
      filter: false,
      width: 100,
      pinned: 'right'
    },
  ], []);

  
  const handleExport = () => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `lead_sources_${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  };

 
  const stats = useMemo(() => {
    const total = leadSources.length;
    const active = leadSources.filter(source => source.is_active).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [leadSources]);

  return (
    <div className="flex flex-col h-full">
    
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
            {leadSources.length} lead sources total
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="ag-theme-alpine h-full">
          <AgGridReact
            ref={gridRef}
            rowData={leadSources}
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
            }}
            onGridReady={(params) => {
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
            onFirstDataRendered={(params) => {
              params.api.sizeColumnsToFit();
            }}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Sources</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Active Sources</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Inactive Sources</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadSourcesView;