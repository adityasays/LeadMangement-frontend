
import { FaSignOutAlt, FaChartBar, FaUsers, FaDatabase, FaUserPlus, FaPlus, FaUpload } from 'react-icons/fa';

const Sidebar = ({ 
  user, 
  activeView, 
  onViewChange, 
  onLogout, 
  onCreateLead,
  onCreateEmployee,
  onCreateLeadSource 
}) => {
  const handleUnderConstruction = (featureName) => {
    alert(`${featureName} feature is under construction. Coming soon!`);
  };

  const menuItems = [
    {
      key: 'leads',
      label: 'All Leads',
      icon: FaChartBar,
      onClick: () => onViewChange('leads')
    }
  ];

  
  if (user.role === 'admin') {
    menuItems.push(
      {
        key: 'employees',
        label: 'Employees',
        icon: FaUsers,
        onClick: () => onViewChange('employees')
      },
      {
        key: 'lead-sources',
        label: 'Lead Sources',
        icon: FaDatabase,
        onClick: () => onViewChange('lead-sources')
      }
    );
  }

  const adminActions = user.role === 'admin' ? [
    {
      key: 'add-lead',
      label: 'Add Lead',
      icon: FaPlus,
      onClick: onCreateLead
    },
    {
      key: 'add-employee',
      label: 'Add Employee',
      icon: FaUserPlus,
      onClick: onCreateEmployee
    },
    {
      key: 'add-lead-source',
      label: 'Add Lead Source',
      icon: FaPlus,
      onClick: onCreateLeadSource
    },
    {
      key: 'bulk-import',
      label: 'Bulk Import',
      icon: FaUpload,
      onClick: () => handleUnderConstruction('Bulk Import')
    }
  ] : [];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Lead Manager</h2>
        <p className="text-sm text-gray-300">Welcome, {user.first_name}</p>
        <p className="text-xs text-gray-400 capitalize">{user.role}</p>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button 
                key={item.key}
                onClick={item.onClick}
                className={`w-full text-left p-3 rounded hover:bg-gray-700 transition-colors ${
                  activeView === item.key ? 'bg-gray-700' : ''
                }`}
              >
                <Icon className="inline mr-2" />
                {item.label}
              </button>
            );
          })}

          {adminActions.length > 0 && (
            <div className="border-t border-gray-700 pt-2 mt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide px-3 pb-2">
                Admin Actions
              </p>
              
              {adminActions.map(action => {
                const Icon = action.icon;
                return (
                  <button 
                    key={action.key}
                    onClick={action.onClick}
                    className="w-full text-left p-3 rounded hover:bg-gray-700 transition-colors"
                  >
                    <Icon className="inline mr-2" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-2 p-3 rounded hover:bg-gray-700 text-left transition-colors"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;