import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import LeadsView from '../components/LeadsView';
import EmployeesView from '../components/EmployeesView';
import LeadSourcesView from '../components/LeadSourcesView';
import CreateLeadModal from '../components/CreateLeadModal';
import CreateEmployeeModal from '../components/CreateEmployeeModal';
import CreateLeadSourceModal from '../components/CreateLeadSourceModal';
import { FaUserCircle } from 'react-icons/fa';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('leads');
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showCreateLeadSourceModal, setShowCreateLeadSourceModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleRefreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateLead = () => setShowCreateLeadModal(true);
  const handleCreateEmployee = () => setShowCreateEmployeeModal(true);
  const handleCreateLeadSource = () => setShowCreateLeadSourceModal(true);

  const handleModalClose = (shouldRefresh = false) => {
    setShowCreateLeadModal(false);
    setShowCreateEmployeeModal(false);
    setShowCreateLeadSourceModal(false);
    if (shouldRefresh) {
      handleRefreshData();
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        user={user}
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
        onCreateLead={handleCreateLead}
        onCreateEmployee={handleCreateEmployee}
        onCreateLeadSource={handleCreateLeadSource}
      />

      <div className="flex-1 flex flex-col">
        <TopBar user={user} activeView={activeView} />
        
        <div className="flex-1 overflow-hidden">
          {activeView === 'leads' && (
            <LeadsView 
              user={user} 
              refreshTrigger={refreshTrigger}
              onRefresh={handleRefreshData}
            />
          )}
          {activeView === 'employees' && user.role === 'admin' && (
            <EmployeesView 
              refreshTrigger={refreshTrigger}
              onRefresh={handleRefreshData}
            />
          )}
          {activeView === 'lead-sources' && user.role === 'admin' && (
            <LeadSourcesView 
              refreshTrigger={refreshTrigger}
              onRefresh={handleRefreshData}
            />
          )}
        </div>
      </div>

      {showCreateLeadModal && (
        <CreateLeadModal 
          user={user}
          onClose={handleModalClose}
        />
      )}
      
      {showCreateEmployeeModal && user.role === 'admin' && (
        <CreateEmployeeModal 
          onClose={handleModalClose}
        />
      )}
      
      {showCreateLeadSourceModal && user.role === 'admin' && (
        <CreateLeadSourceModal 
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

export default Dashboard;