import { FaSearch, FaTimes, FaFilter } from 'react-icons/fa';

const LeadFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  employees, 
  userRole 
}) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'lost', label: 'Lost' },
    { value: 'won', label: 'Won' }
  ];

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'website', label: 'Website' },
    { value: 'facebook_ads', label: 'Facebook Ads' },
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'referral', label: 'Referral' },
    { value: 'events', label: 'Events' },
    { value: 'other', label: 'Other' }
  ];

  const qualifiedOptions = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Qualified' },
    { value: 'false', label: 'Not Qualified' }
  ];

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white border-b p-4">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-60 relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search by email, company, name..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>

        <select
          value={filters.status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.source}
          onChange={(e) => onFilterChange('source', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {sourceOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {userRole === 'admin' && (
          <select
            value={filters.assigned_to}
            onChange={(e) => onFilterChange('assigned_to', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Assigned</option>
            <option value="null">Unassigned</option>
            {employees.map(employee => (
              <option key={employee._id} value={employee._id}>
                {employee.first_name} {employee.last_name}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.is_qualified}
          onChange={(e) => onFilterChange('is_qualified', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {qualifiedOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-4 items-center mt-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Score:</label>
          <input
            type="number"
            placeholder="Min"
            min="0"
            max="100"
            value={filters.score_min}
            onChange={(e) => onFilterChange('score_min', e.target.value)}
            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">to</span>
          <input
            type="number"
            placeholder="Max"
            min="0"
            max="100"
            value={filters.score_max}
            onChange={(e) => onFilterChange('score_max', e.target.value)}
            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Value:</label>
          <input
            type="number"
            placeholder="Min $"
            min="0"
            step="0.01"
            value={filters.value_min}
            onChange={(e) => onFilterChange('value_min', e.target.value)}
            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">to</span>
          <input
            type="number"
            placeholder="Max $"
            min="0"
            step="0.01"
            value={filters.value_max}
            onChange={(e) => onFilterChange('value_max', e.target.value)}
            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Created:</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => onFilterChange('date_from', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => onFilterChange('date_to', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>

    
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            
            let displayValue = value;
            let displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            if (key === 'assigned_to' && userRole === 'admin') {
              if (value === 'null') {
                displayValue = 'Unassigned';
              } else {
                const employee = employees.find(emp => emp._id === value);
                displayValue = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
              }
            } else if (key === 'is_qualified') {
              displayValue = value === 'true' ? 'Qualified' : 'Not Qualified';
            }

            return (
              <span
                key={key}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
              >
                <span>{displayKey}: {displayValue}</span>
                <button
                  onClick={() => onFilterChange(key, '')}
                  className="hover:text-blue-600"
                >
                  <FaTimes size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeadFilters;