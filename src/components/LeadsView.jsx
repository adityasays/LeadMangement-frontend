import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { format, parseISO } from 'date-fns';
import api from '../api';
import LeadFilters from './LeadFilters';
import LeadStats from './LeadStats';
import EditLeadModal from './EditLeadModal';
import { 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaPlus,
  FaDownload,
  
} from 'react-icons/fa';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const LeadsView = ({ user, refreshTrigger, onRefresh }) => {
  const [leads, setLeads] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    search: '',
    status: '',
    source: '',
    assigned_to: '',
    score_min: '',
    score_max: '',
    value_min: '',
    value_max: '',
    date_from: '',
    date_to: '',
    is_qualified: ''
  });

  const gridRef = useRef();

  useEffect(() => {
    const fetchEmployees = async () => {
      if (user.role === 'admin') {
        try {
          const res = await api.get('/api/admin/employees');
          setEmployees(res.data);
        } catch (err) {
          console.error('Failed to fetch employees:', err);
        }
      }
    };
    fetchEmployees();
  }, [user.role]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize
      };

      
      Object.keys(quickFilters).forEach(key => {
        const value = quickFilters[key];
        if (value !== '' && value !== null && value !== undefined) {
          switch (key) {
            case 'search':
              params.email_contains = value;
              break;
            case 'status':
              params.status_equals = value;
              break;
            case 'source':
              params.source_equals = value;
              break;
            case 'assigned_to':
              params.assigned_to_equals = value;
              break;
            case 'score_min':
              params.score_gt = parseInt(value) - 1;
              break;
            case 'score_max':
              params.score_lt = parseInt(value) + 1;
              break;
            case 'value_min':
              params.lead_value_gt = parseFloat(value) - 0.01;
              break;
            case 'value_max':
              params.lead_value_lt = parseFloat(value) + 0.01;
              break;
            case 'date_from':
              params.created_at_after = value;
              break;
            case 'date_to':
              params.created_at_before = value;
              break;
            case 'is_qualified':
              params.is_qualified_equals = value;
              break;
          }
        }
      });

      const res = await api.get('/api/leads', { params });
      setLeads(res.data.data || []);
      setTotalRecords(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, quickFilters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads, refreshTrigger]);

  const handleFilterChange = (key, value) => {
    setQuickFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setQuickFilters({
      search: '',
      status: '',
      source: '',
      assigned_to: '',
      score_min: '',
      score_max: '',
      value_min: '',
      value_max: '',
      date_from: '',
      date_to: '',
      is_qualified: ''
    });
    if (gridRef.current) {
      gridRef.current.api.setFilterModel(null);
    }
  };

  const StatusCellRenderer = (params) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(params.value || 'new');

    const statusOptions = ['new', 'contacted', 'qualified', 'lost', 'won'];

    const handleSave = async (newStatus) => {
      try {
        await api.put(`/api/leads/${params.data._id}`, { status: newStatus });
        params.node.setDataValue('status', newStatus);
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
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => handleSave(value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave(value)}
          autoFocus
          className="w-full p-1 border rounded text-xs"
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      );
    }

    const getStatusColor = (status) => {
      const colors = {
        new: 'bg-blue-100 text-blue-800',
        contacted: 'bg-yellow-100 text-yellow-800',
        qualified: 'bg-green-100 text-green-800',
        lost: 'bg-red-100 text-red-800',
        won: 'bg-purple-100 text-purple-800'
      };
      return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${getStatusColor(value)}`}
        onClick={() => setEditing(true)}
        title="Click to edit status"
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    );
  };

  const ScoreCellRenderer = (params) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(params.value || 0);

    const handleSave = async () => {
      try {
        const score = parseInt(value);
        if (score < 0 || score > 100) {
          alert('Score must be between 0 and 100');
          return;
        }
        await api.put(`/api/leads/${params.data._id}`, { score });
        params.node.setDataValue('score', score);
        setEditing(false);
      } catch (err) {
        console.error('Failed to update score:', err);
        alert('Failed to update score');
      }
    };

    if (editing) {
      return (
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          className="w-full p-1 border rounded text-center"
        />
      );
    }

    const getScoreColor = (score) => {
      if (score >= 80) return 'text-green-600 font-bold';
      if (score >= 60) return 'text-yellow-600 font-bold';
      if (score >= 40) return 'text-orange-600';
      return 'text-red-600';
    };

    return (
      <span
        className={`cursor-pointer ${getScoreColor(value)}`}
        onClick={() => setEditing(true)}
        title="Click to edit score"
      >
        {value}
      </span>
    );
  };

  const LeadValueCellRenderer = (params) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(params.value || 0);

    const handleSave = async () => {
      try {
        const leadValue = parseFloat(value) || 0;
        await api.put(`/api/leads/${params.data._id}`, { lead_value: leadValue });
        params.node.setDataValue('lead_value', leadValue);
        setEditing(false);
      } catch (err) {
        console.error('Failed to update lead value:', err);
        alert('Failed to update lead value');
      }
    };

    if (editing) {
      return (
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          className="w-full p-1 border rounded text-center"
        />
      );
    }

    return (
      <span
        className="cursor-pointer hover:bg-gray-100 p-1 rounded"
        onClick={() => setEditing(true)}
        title="Click to edit lead value"
      >
        ${(value || 0).toLocaleString()}
      </span>
    );
  };

  // Assign To Cell Renderer (Admin only)
  const AssignToCellRenderer = (params) => {
    const [editing, setEditing] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(
      params.data.assigned_to?._id || ''
    );

    const handleSave = async () => {
      try {
        if (user.role === 'admin') {
          await api.put(`/api/admin/leads/${params.data._id}/assign`, {
            assigned_to: selectedEmployee || null
          });
          
          const employee = employees.find(emp => emp._id === selectedEmployee);
          params.node.setDataValue('assigned_to', employee || null);
        }
        setEditing(false);
      } catch (err) {
        console.error('Failed to assign lead:', err);
        alert('Failed to assign lead');
      }
    };

    if (editing && user.role === 'admin') {
      return (
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          autoFocus
          className="w-full p-1 border rounded text-xs"
        >
          <option value="">Unassigned</option>
          {employees.map(employee => (
            <option key={employee._id} value={employee._id}>
              {employee.first_name} {employee.last_name}
            </option>
          ))}
        </select>
      );
    }

    const assignedName = params.data.assigned_to
      ? `${params.data.assigned_to.first_name} ${params.data.assigned_to.last_name}`
      : 'Unassigned';

    return (
      <span
        className={`cursor-pointer ${user.role === 'admin' ? 'hover:bg-gray-100' : ''} p-1 rounded`}
        onClick={() => user.role === 'admin' && setEditing(true)}
        title={user.role === 'admin' ? "Click to assign" : ""}
      >
        {assignedName}
      </span>
    );
  };

  
  const ActionsCellRenderer = (params) => {
    const handleView = () => {
      setSelectedLead(params.data);
    };

    const handleEdit = () => {
      setSelectedLead(params.data);
      setShowEditModal(true);
    };

    const handleDelete = async () => {
      if (window.confirm('Are you sure you want to delete this lead?')) {
        try {
          await api.delete(`/api/leads/${params.data._id}`);
          onRefresh();
        } catch (err) {
          console.error('Failed to delete lead:', err);
          alert('Failed to delete lead');
        }
      }
    };

    return (
      <div className="flex space-x-1">
        <button
          onClick={handleView}
          className="text-green-600 hover:text-green-800 p-1"
          title="View Lead"
        >
          <FaEye size={12} />
        </button>
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-800 p-1"
          title="Edit Lead"
        >
          <FaEdit size={12} />
        </button>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 p-1"
          title="Delete Lead"
        >
          <FaTrash size={12} />
        </button>
      </div>
    );
  };

  
  const columnDefs = useMemo(() => [
    {
      field: 'first_name',
      headerName: 'First Name',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 120,
      pinned: 'left'
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 120,
      pinned: 'left'
    },
    {
      field: 'email',
      headerName: 'Email',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 130,
    },
    {
      field: 'company',
      headerName: 'Company',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 150,
    },
    {
      field: 'city',
      headerName: 'City',
      sortable: true,
      filter: 'agTextColumnFilter',
      width: 120,
    },
    {
      field: 'state',
      headerName: 'State',
      width: 80,
    },
    {
      field: 'status',
      headerName: 'Status',
      cellRenderer: StatusCellRenderer,
      width: 120,
    },
    {
      field: 'score',
      headerName: 'Score',
      cellRenderer: ScoreCellRenderer,
      width: 80,
    },
    {
      field: 'lead_value',
      headerName: 'Value',
      cellRenderer: LeadValueCellRenderer,
      width: 100,
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 120,
    },
    {
      field: 'is_qualified',
      headerName: 'Qualified',
      width: 90,
      cellRenderer: (params) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          params.value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {params.value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      valueFormatter: (params) => 
        params.value ? format(parseISO(params.value), 'MMM dd, yyyy') : '',
      width: 120,
    },
    {
      field: 'last_activity_at',
      headerName: 'Last Activity',
      valueFormatter: (params) => 
        params.value ? format(parseISO(params.value), 'MMM dd, yyyy') : 'Never',
      width: 130,
    },
    {
      field: 'assigned_to',
      headerName: 'Assigned To',
      cellRenderer: AssignToCellRenderer,
      width: 130,
    },
    {
      field: 'created_by',
      headerName: 'Created By',
      valueGetter: (params) => 
        params.data.created_by 
          ? `${params.data.created_by.first_name} ${params.data.created_by.last_name}`
          : 'Unknown',
      width: 130,
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionsCellRenderer,
      sortable: false,
      filter: false,
      width: 100,
      pinned: 'right'
    },
  ], [user, employees]);

  const handleExport = () => {
    if (gridRef.current) {
      gridRef.current.api.exportDataAsCsv({
        fileName: `leads_${new Date().toISOString().split('T')[0]}.csv`
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <LeadFilters 
        filters={quickFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        employees={employees}
        userRole={user.role}
      />

      
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
            Showing {leads.length} of {totalRecords} leads
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Page size:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

    
      <div className="flex-1 p-4">
        <div className="ag-theme-alpine h-full">
          <AgGridReact
            ref={gridRef}
            rowData={leads}
            columnDefs={columnDefs}
            loading={loading}
            pagination={true}
            paginationPageSize={pageSize}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowSelection="multiple"
            animateRows={true}
            enableRangeSelection={true}
            suppressRowClickSelection={true}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              floatingFilter: false,
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

        
        <LeadStats leads={leads} />
      </div>

      
      {showEditModal && selectedLead && (
        <EditLeadModal
          lead={selectedLead}
          employees={employees}
          userRole={user.role}
          onClose={() => {
            setShowEditModal(false);
            setSelectedLead(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedLead(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default LeadsView;