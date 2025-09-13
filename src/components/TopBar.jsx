 
import { FaUserCircle } from 'react-icons/fa';

const TopBar = ({ user, activeView }) => {
  const getViewTitle = () => {
    switch (activeView) {
      case 'leads': return 'Lead Management';
      case 'employees': return 'Employee Management';
      case 'lead-sources': return 'Lead Sources Management';
      default: return 'Dashboard';
    }
  };

  const getViewSubtitle = () => {
    switch (activeView) {
      case 'leads': return 'Manage and track all leads';
      case 'employees': return 'Manage employee accounts';
      case 'lead-sources': return 'Manage lead source configurations';
      default: return '';
    }
  };

  return (
    <div className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {getViewTitle()}
        </h1>
        <p className="text-gray-600">
          {getViewSubtitle()}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-xs text-gray-500 capitalize">
            {user.role}
          </p>
        </div>
        <FaUserCircle size={32} className="text-gray-600" />
      </div>
    </div>
  );
};

export default TopBar;