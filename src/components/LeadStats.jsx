import { useMemo } from 'react';

const LeadStats = ({ leads }) => {
  const stats = useMemo(() => {
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const totalValue = leads.reduce((sum, lead) => sum + (lead.lead_value || 0), 0);
    const avgScore = leads.length > 0 
      ? leads.reduce((sum, lead) => sum + (lead.score || 0), 0) / leads.length 
      : 0;

    const qualifiedCount = leads.filter(lead => lead.is_qualified).length;

    return {
      statusCounts,
      totalValue,
      avgScore,
      qualifiedCount,
      totalLeads: leads.length
    };
  }, [leads]);

  const statusOptions = ['new', 'contacted', 'qualified', 'lost', 'won'];
  const statusColors = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500', 
    qualified: 'bg-green-500',
    lost: 'bg-red-500',
    won: 'bg-purple-500'
  };

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statusOptions.map(status => {
        const count = stats.statusCounts[status] || 0;
        const percentage = stats.totalLeads > 0 ? ((count / stats.totalLeads) * 100).toFixed(1) : 0;
        
        return (
          <div key={status} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600 capitalize">{status}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{percentage}% of total</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${statusColors[status]}`}></div>
            </div>
          </div>
        );
      })}

      <div className="bg-white p-4 rounded-lg shadow-sm border md:col-span-1">
        <div className="text-center">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-xl font-bold text-green-600">${stats.totalValue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border md:col-span-1">
        <div className="text-center">
          <p className="text-sm text-gray-600">Avg Score</p>
          <p className="text-xl font-bold text-blue-600">{stats.avgScore.toFixed(1)}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border md:col-span-1">
        <div className="text-center">
          <p className="text-sm text-gray-600">Qualified</p>
          <p className="text-xl font-bold text-purple-600">{stats.qualifiedCount}</p>
        </div>
      </div>
    </div>
  );
};

export default LeadStats;